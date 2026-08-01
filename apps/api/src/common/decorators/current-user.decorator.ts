import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "../../users/entities/user.entity";

/**
 * Custom parameter decorator that extracts the authenticated user from the request.
 * Usage: @CurrentUser() user: User
 * Usage: @CurrentUser('id') userId: string
 *
 * The user is attached to the request by JwtAuthGuard via Passport strategy.
 * Throws if accessed on an unauthenticated route (no guard applied).
 */
export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: User }>();
    const user = request.user;

    if (!user) {
      throw new Error(
        "CurrentUser decorator requires an authenticated request. " +
          "Ensure JwtAuthGuard is applied to the route.",
      );
    }

    return data ? user[data] : user;
  },
);
