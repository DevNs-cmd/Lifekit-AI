import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key used by JwtAuthGuard to identify public routes.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator that marks a route handler as publicly accessible.
 * When applied, JwtAuthGuard will skip JWT authentication for that route.
 *
 * Usage:
 * ```
 * @Public()
 * @Post('register')
 * async register(@Body() dto: RegisterDto) { ... }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

