import { SetMetadata, UseInterceptors, applyDecorators } from "@nestjs/common";
import { CacheInterceptor } from "./cache.interceptor";

export const CACHE_METADATA_KEY = "lifekit:cache:metadata";

export interface CacheOptions {
  ttl?: number; // Time-to-live in seconds
  keyPrefix?: string; // Custom prefix for the cache key
}

/**
 * Cache decorator to automatically cache method responses in Redis.
 * Only applies to HTTP GET requests when used on controller handlers.
 *
 * @param options configuration for TTL and key prefix
 */
export function Cacheable(options: CacheOptions = {}) {
  return applyDecorators(
    SetMetadata(CACHE_METADATA_KEY, options),
    UseInterceptors(CacheInterceptor),
  );
}
