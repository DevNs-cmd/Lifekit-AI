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

    const expiresAt = new Date(Date.now() + this.getRefreshExpiryMs());
    await this.sessionRepository.createSession({
      userId: user.user_id,
      tokenHash,
      expiresAt,
      ipAddress,
      userAgent,
    });

    this.logger.log(`User registered successfully: ${user.user_id}`);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Logs in a user by verifying credentials, creating a new session,
   * and returning signed tokens.
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

    const expiresAt = new Date(Date.now() + this.getRefreshExpiryMs());
    await this.sessionRepository.createSession({
      userId: user.user_id,
      tokenHash,
      expiresAt,
      ipAddress,
      userAgent,
    });

    this.logger.log(`User logged in successfully: ${user.user_id}`);

    return {
      user: this.sanitizeUser(user as User),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Validates user credentials. Checks email against registered users and verifies password hashes.
   */
  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, "password_hash">> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      this.logger.warn(`Login failed — user not found for email: ${email}`);
      throw new UnauthorizedException("Invalid email address or password");
    }

    const isPasswordValid = await comparePassword(pass, user.password_hash);
    if (!isPasswordValid) {
      this.logger.warn(`Login failed — invalid password for email: ${email}`);
      throw new UnauthorizedException("Invalid email address or password");
    }

    return this.sanitizeUser(user);
  }

  /**
   * Refreshes an access token using a valid refresh token.
   */
  async refreshAccessToken(
    refreshTokenDto: RefreshTokenDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResult> {
    const rawToken = refreshTokenDto.refreshToken;
    let payload: JwtPayload;

    try {
      payload = jwt.verify(
        rawToken,
        this.getSecret("refreshSecret"),
      ) as any as JwtPayload;
    } catch {
      this.logger.warn(
        "Refresh token verification failed — invalid or expired token",
      );
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    const tokenHash = hashRefreshToken(rawToken);
    const session =
      await this.sessionRepository.findSessionByTokenHash(tokenHash);

    if (!session) {
      this.logger.warn(
        `Refresh token replay suspected — session not found for user: ${payload.sub}. Invalidating all active sessions.`,
      );
      try {
        await this.sessionRepository.deleteSessionsByUser(payload.sub);
      } catch (err: any) {
        this.logger.error(
          `Failed to invalidate sessions after suspected replay attack for user: ${payload.sub}`,
          err.stack,
        );
      }
      throw new UnauthorizedException("Active session not found");
    }

    if (new Date(session.expiresAt) < new Date()) {
      await this.sessionRepository.deleteSessionByTokenHash(tokenHash);
      this.logger.warn(`Expired refresh token used for user: ${payload.sub}`);
      throw new UnauthorizedException("Refresh token session has expired");
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      await this.sessionRepository.deleteSessionByTokenHash(tokenHash);
      this.logger.warn(
        `User deleted but refresh token used — cleaning up session. sub: ${payload.sub}`,
      );
      throw new UnauthorizedException("User not found");
    }

    try {
      await this.sessionRepository.deleteSessionByTokenHash(tokenHash);
    } catch (error) {
      this.logger.error(
        `Failed to delete old session during RTR for user: ${user.user_id}`,
        (error as Error).stack,
      );
    }

    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);
    const newTokenHash = hashRefreshToken(newRefreshToken);

    const expiresAt = new Date(Date.now() + this.getRefreshExpiryMs());
    await this.sessionRepository.createSession({
      userId: user.user_id,
      tokenHash: newTokenHash,
      expiresAt,
      ipAddress: ipAddress ?? session.ipAddress ?? undefined,
      userAgent: userAgent ?? session.userAgent ?? undefined,
    });

    this.logger.log(
      `Access token refreshed successfully for user: ${user.user_id}`,
    );

    return {
      user: this.sanitizeUser(user),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logs out the user by deleting their refresh token session from database.
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      const tokenHash = hashRefreshToken(refreshToken);
      await this.sessionRepository.deleteSessionByTokenHash(tokenHash);
      this.logger.log("User logged out — session deleted successfully");
    } catch (error) {
      this.logger.error(
        "Logout session deletion encountered an issue (session may already be deleted)",
        (error as Error).stack,
      );
    }
  }

  private signToken(
    user: Omit<User, "password_hash"> | User,
    secret: string,
    expiresIn: string,
  ): string {
    const payload: JwtPayload = {
      sub: user.user_id,
    };

    return jwt.sign(payload, secret, {
      expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
      jwtid: crypto.randomBytes(32).toString("hex"),
    });
  }

  private generateAccessToken(
    user: Omit<User, "password_hash"> | User,
  ): string {
    return this.signToken(
      user,
      this.getSecret("secret"),
      this.getExpiry("expiresIn", "15m"),
    );
  }

  private generateRefreshToken(
    user: Omit<User, "password_hash"> | User,
  ): string {
    return this.signToken(
      user,
      this.getSecret("refreshSecret"),
      this.getExpiry("refreshExpiresIn", "7d"),
    );
  }

  private sanitizeUser(user: User): Omit<User, "password_hash"> {
    return {
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      preference: user.preference,
      created_at: user.created_at,
      updated_at: user.updated_at,
      // Compatibility fields
      id: user.user_id,
      fullName: user.full_name,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    } as any;
  }

  private getSecret(key: "secret" | "refreshSecret"): string {
    const configKey = `jwt.${key}` as const;
    const secret = this.configService.get<string>(configKey);
    if (!secret) {
      throw new Error(`JWT configuration missing: ${configKey}`);
    }
    return secret;
  }

  private getExpiry(
    key: "expiresIn" | "refreshExpiresIn",
    fallback: string,
  ): string {
    return this.configService.get<string>(`jwt.${key}`) || fallback;
  }

  private getRefreshExpiryMs(): number {
    const expiry = this.getExpiry("refreshExpiresIn", "7d");
    return parseDuration(expiry);
  }
}
