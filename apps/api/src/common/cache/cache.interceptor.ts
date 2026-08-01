import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";
import { CacheService } from "./cache.service";
import { CACHE_METADATA_KEY, CacheOptions } from "./cache.decorators";

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const options = this.reflector.get<CacheOptions>(
      CACHE_METADATA_KEY,
      context.getHandler(),
    );

    if (!options) {
      return next.handle();
    }

    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const { method, originalUrl } = request;

    // Standard behavior: only cache GET requests
    if (method !== "GET") {
      return next.handle();
    }

    const keyPrefix = options.keyPrefix || "route";
    const cacheKey = `${keyPrefix}:${originalUrl}`;
    const ttl = options.ttl || 300; // default 5 minutes

    try {
      const cachedValue = await this.cacheService.get(cacheKey);
      if (cachedValue) {
        this.logger.debug(`Cache hit for key: ${cacheKey}`);
        try {
          const parsed = JSON.parse(cachedValue);
          return of(parsed);
        } catch {
          return of(cachedValue);
        }
      }
    } catch (error: any) {
      this.logger.error(
        `Cache check failed for key ${cacheKey}: ${error.message}`,
      );
    }

    return next.handle().pipe(
      tap(async (result) => {
        if (result !== undefined) {
          try {
            const valueToCache =
              typeof result === "string" ? result : JSON.stringify(result);
            await this.cacheService.set(cacheKey, valueToCache, ttl);
            this.logger.debug(
              `Cached result for key: ${cacheKey} with TTL: ${ttl}s`,
            );
          } catch (error: any) {
            this.logger.error(
              `Failed to write cache for key ${cacheKey}: ${error.message}`,
            );
          }
        }
      }),
    );
  }
}
