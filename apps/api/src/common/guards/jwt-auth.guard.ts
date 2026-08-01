import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

/**
 * Production-ready JWT authentication guard.
 *
 * - Extends Passport's AuthGuard('jwt') strategy
 * - Supports @Public() decorator to skip auth on specific routes
 * - Logs unauthorized access attempts (without leaking sensitive data)
 * - Returns standardized UnauthorizedException
 *
 * Usage:
 * - Apply globally or per-controller/per-route
 * - Use @Public() decorator on routes that should be accessible without auth
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * Determines if a route can be activated.
   * Skips JWT validation for routes marked with @Public() decorator.
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context) as boolean | Promise<boolean>;
  }

  /**
   * Handles authentication errors and returns a standardized response.
   * Logs the event without exposing sensitive details.
   */
  handleRequest<TUser = any>(
    err: Error | null,
    user: TUser | false,
    info: { message?: string } | string | undefined,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      const request = context.switchToHttp().getRequest();
      const path = request.url || "unknown";
      const method = request.method || "UNKNOWN";

      // Extract a safe error message from Passport's info object
      const errorMessage =
        err?.message ||
        (typeof info === "object" && info?.message) ||
        (typeof info === "string" ? info : "Authentication required");

      this.logger.warn(
        `Authentication failed — ${method} ${path}: ${errorMessage}`,
      );

      throw (
        err ||
        new UnauthorizedException("Invalid or expired authentication token")
      );
    }

    return user;
  }
}
