import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserRepository } from "../users/repositories/user.repository";
import { JwtPayload } from "./interfaces/jwt-payload.interface";

/**
 * Passport JWT Strategy for access token verification.
 *
 * - Extracts JWT from the Authorization header (Bearer token)
 * - Validates the token signature using the configured JWT secret
 * - Retrieves the authenticated user from the database via UserRepository
 * - Attaches the user object to Express request as `request.user`
 *
 * Security considerations:
 * - No Prisma access — uses Repository pattern
 * - Throws UnauthorizedException for invalid/expired tokens
 * - Does NOT attach passwordHash to the request user
 * - Logs authentication failures without exposing secrets
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly userRepository: UserRepository) {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET environment variable is not configured");
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Validates the decoded JWT payload and retrieves the user.
   * Called by Passport after verifying the token signature and expiration.
   *
   * @param payload - Decoded JWT payload (only contains `sub` after hardening)
   * @returns Sanitized user object (without passwordHash)
   * @throws UnauthorizedException if user is not found or deactivated
   */
  async validate(payload: JwtPayload): Promise<any> {
    if (!payload.sub) {
      this.logger.warn("JWT payload missing sub claim");
      throw new UnauthorizedException("Invalid token payload");
    }

    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      this.logger.warn(`User not found for token sub: ${payload.sub}`);
      throw new UnauthorizedException(
        "User associated with this token no longer exists",
      );
    }

    // Remove sensitive fields before attaching to request
    const { passwordHash, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
