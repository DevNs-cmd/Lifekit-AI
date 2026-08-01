import {
  Injectable,
  ConflictException,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import { UserRepository } from "../users/repositories/user.repository";
import { SessionRepository } from "./repositories/session.repository";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { User } from "../users/entities/user.entity";
import { AuthResult, JwtPayload } from "./interfaces";
import {
  hashPassword,
  comparePassword,
  parseDuration,
  hashRefreshToken,
} from "./utils";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registers a new user. Hashes the password, saves user in the repository,
   * generates access/refresh tokens, and starts an active user session.
   * @param registerDto Contains email, fullName, and password
   * @param ipAddress IP address of the client device (optional)
   * @param userAgent User-agent header string from the client browser (optional)
   * @returns The registered user along with active JWT tokens
   * @throws ConflictException if the email is already in use
   */
  async register(
    registerDto: RegisterDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResult> {
    const existingUser = await this.userRepository.findByEmail(
      registerDto.email,
    );
    if (existingUser) {
      this.logger.warn(
        `Registration failed — email already in use: ${registerDto.email}`,
      );
      throw new ConflictException(
        "A user with this email address already exists",
      );
    }

    const passwordHash = await hashPassword(registerDto.password);
    const user = await this.userRepository.createUser({
      email: registerDto.email,
      fullName: registerDto.fullName,
      passwordHash,
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    const tokenHash = hashRefreshToken(refreshToken);

    // Save hashed refresh token session to database (never store plaintext tokens)
    const expiresAt = new Date(Date.now() + this.getRefreshExpiryMs());
    await this.sessionRepository.createSession({
      userId: user.id,
      tokenHash,
      expiresAt,
      ipAddress,
      userAgent,
    });

    this.logger.log(`User registered successfully: ${user.id}`);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Logs in a user by verifying credentials, creating a new session,
   * and returning signed tokens.
   * @param loginDto Contains email and password
   * @param ipAddress IP address of the client device (optional)
   * @param userAgent User-agent header string from the client browser (optional)
   * @returns Authenticated user and a fresh pair of tokens
   * @throws UnauthorizedException on invalid credentials
   */
  async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResult> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    const tokenHash = hashRefreshToken(refreshToken);

    // Store the hashed refresh token session
    const expiresAt = new Date(Date.now() + this.getRefreshExpiryMs());
    await this.sessionRepository.createSession({
      userId: user.id,
      tokenHash,
      expiresAt,
      ipAddress,
      userAgent,
    });

    this.logger.log(`User logged in successfully: ${user.id}`);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Validates user credentials. Checks email against registered users and verifies password hashes.
   * @param email Email address of the user
   * @param pass Plaintext password to compare
   * @returns Sanitized User entity (with passwordHash removed)
   * @throws UnauthorizedException on failure
   */
  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, "passwordHash">> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      this.logger.warn(`Login failed — user not found for email: ${email}`);
      throw new UnauthorizedException("Invalid email address or password");
    }

    const isPasswordValid = await comparePassword(pass, user.passwordHash);
    if (!isPasswordValid) {
      this.logger.warn(`Login failed — invalid password for email: ${email}`);
      throw new UnauthorizedException("Invalid email address or password");
    }

    return this.sanitizeUser(user);
  }

  /**
   * Refreshes an access token using a valid refresh token.
   * Uses Refresh Token Rotation (RTR) to invalidate the old session and issue new tokens.
   *
   * Security hardening:
   * - Refresh tokens are hashed (SHA-256) before database lookup
   * - Old sessions are deleted before new ones are created to prevent race conditions
   * - Failed attempts are logged without exposing sensitive data
   *
   * @param refreshTokenDto Holds the raw refresh token
   * @param ipAddress IP address of the client device (optional)
   * @param userAgent User-agent header string from the client browser (optional)
   * @returns New access token, new refresh token, and user details
   * @throws UnauthorizedException on token mismatch or session expiry
   */
  async refreshAccessToken(
    refreshTokenDto: RefreshTokenDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResult> {
    const rawToken = refreshTokenDto.refreshToken;
    let payload: JwtPayload;

    // Step 1: Verify the refresh token signature and expiration
    try {
      payload = jwt.verify(
        rawToken,
        this.getSecret("refreshSecret"),
      ) as JwtPayload;
    } catch (error) {
      this.logger.warn(
        "Refresh token verification failed — invalid or expired token",
      );
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    // Step 2: Hash the token and look up the session (prevent token exfiltration attacks)
    const tokenHash = hashRefreshToken(rawToken);
    const session =
      await this.sessionRepository.findSessionByTokenHash(tokenHash);

    if (!session) {
      this.logger.warn(
        `Refresh token replay suspected — session not found for user: ${payload.sub}`,
      );
      throw new UnauthorizedException("Active session not found");
    }

    // Step 3: Check session expiration
    if (new Date(session.expiresAt) < new Date()) {
      await this.sessionRepository.deleteSessionByTokenHash(tokenHash);
      this.logger.warn(`Expired refresh token used for user: ${payload.sub}`);
      throw new UnauthorizedException("Refresh token session has expired");
    }

    // Step 4: Verify the user still exists
    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      await this.sessionRepository.deleteSessionByTokenHash(tokenHash);
      this.logger.warn(
        `User deleted but refresh token used — cleaning up session. sub: ${payload.sub}`,
      );
      throw new UnauthorizedException("User not found");
    }

    // Step 5: Refresh Token Rotation (RTR) — delete old session BEFORE creating new one
    // This minimizes the race condition window where old+new tokens both exist
    try {
      await this.sessionRepository.deleteSessionByTokenHash(tokenHash);
    } catch (error) {
      this.logger.error(
        `Failed to delete old session during RTR for user: ${user.id}`,
        (error as Error).stack,
      );
      // Continue — if delete failed (e.g. already deleted), rotation still proceeds
    }

    // Step 6: Generate new token pair
    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);
    const newTokenHash = hashRefreshToken(newRefreshToken);

    // Step 7: Save new hashed token session
    const expiresAt = new Date(Date.now() + this.getRefreshExpiryMs());
    await this.sessionRepository.createSession({
      userId: user.id,
      tokenHash: newTokenHash,
      expiresAt,
      ipAddress: ipAddress ?? session.ipAddress ?? undefined,
      userAgent: userAgent ?? session.userAgent ?? undefined,
    });

    this.logger.log(`Access token refreshed successfully for user: ${user.id}`);

    return {
      user: this.sanitizeUser(user),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logs out the user by deleting their refresh token session from database.
   * @param refreshToken The raw refresh token corresponding to the session to invalidate
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      const tokenHash = hashRefreshToken(refreshToken);
      await this.sessionRepository.deleteSessionByTokenHash(tokenHash);
      this.logger.log("User logged out — session deleted successfully");
    } catch (error) {
      // Log the error but do not throw — logout should be idempotent
      this.logger.error(
        "Logout session deletion encountered an issue (session may already be deleted)",
        (error as Error).stack,
      );
    }
  }

  /**
   * Generates a signed JWT token (access or refresh).
   * Uses a single unified method to avoid duplicate signing logic.
   *
   * Security:
   * - Payload contains only `sub` (user ID) — no PII in tokens
   * - A unique `jti` claim is included for replay detection
   *
   * @param user The user object
   * @param secret The signing secret key
   * @param expiresIn Token expiration duration string (e.g., '15m', '7d')
   * @returns Signed JWT string
   */
  private signToken(
    user: Omit<User, "passwordHash"> | User,
    secret: string,
    expiresIn: string,
  ): string {
    const payload: JwtPayload = {
      sub: user.id,
    };

    return jwt.sign(payload, secret, {
      expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
      jwtid: crypto.randomBytes(32).toString("hex"),
    });
  }

  /**
   * Generates a signed Access JWT.
   * @param user The user object (sanitized or full)
   */
  private generateAccessToken(user: Omit<User, "passwordHash"> | User): string {
    return this.signToken(
      user,
      this.getSecret("secret"),
      this.getExpiry("expiresIn", "15m"),
    );
  }

  /**
   * Generates a signed Refresh JWT.
   * @param user The user object (sanitized or full)
   */
  private generateRefreshToken(
    user: Omit<User, "passwordHash"> | User,
  ): string {
    return this.signToken(
      user,
      this.getSecret("refreshSecret"),
      this.getExpiry("refreshExpiresIn", "7d"),
    );
  }

  /**
   * Removes the passwordHash field from User payload to protect user credentials.
   * Uses an allowlist approach for forward-compatibility with new sensitive fields.
   * @param user Full user entity
   */
  private sanitizeUser(user: User): Omit<User, "passwordHash"> {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      preference: user.preference,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Retrieves a JWT configuration value by key with a fallback default.
   * @param key Config key path (e.g., 'secret', 'expiresIn')
   * @param fallback Default value if config is not set
   */
  private getSecret(key: "secret" | "refreshSecret"): string {
    const configKey = `jwt.${key}` as const;
    const secret = this.configService.get<string>(configKey);
    if (!secret) {
      throw new Error(`JWT configuration missing: ${configKey}`);
    }
    return secret;
  }

  /**
   * Retrieves a JWT expiration setting by key with a fallback default.
   * @param key Config key path (e.g., 'expiresIn', 'refreshExpiresIn')
   * @param fallback Default value if config is not set
   */
  private getExpiry(
    key: "expiresIn" | "refreshExpiresIn",
    fallback: string,
  ): string {
    return this.configService.get<string>(`jwt.${key}`) || fallback;
  }

  /**
   * Calculates the refresh token expiration offset in milliseconds.
   */
  private getRefreshExpiryMs(): number {
    const expiry = this.getExpiry("refreshExpiresIn", "7d");
    return parseDuration(expiry);
  }
}
