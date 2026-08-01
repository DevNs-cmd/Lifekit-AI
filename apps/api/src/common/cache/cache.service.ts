import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import Redis from "ioredis";
import { AppConfigService } from "../../config/app-config.service";

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client!: Redis;

  constructor(private readonly config: AppConfigService) {}

  onModuleInit() {
    const url = this.config.redisUrl;
    if (!url) {
      this.logger.warn(
        "REDIS_URL is not defined. Caching features might be unavailable.",
      );
      return;
    }

    this.logger.log("Connecting to Redis server...");
    try {
      this.client = new Redis(url, {
        maxRetriesPerRequest: 3,
      });

      this.client.on("connect", () => {
        this.logger.log("Successfully connected to Redis.");
      });

      this.client.on("error", (err) => {
        this.logger.error(
          `Redis client connection error: ${err.message}`,
          err.stack,
        );
      });
    } catch (err: any) {
      this.logger.error(
        `Failed to initialize Redis client: ${err.message}`,
        err.stack,
      );
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      this.logger.log("Disconnecting from Redis...");
      await this.client.quit();
    }
  }

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    try {
      if (!this.client) return null;
      return await this.client.get(reqKey(key));
    } catch (error: any) {
      this.logger.error(`Redis GET error for key ${key}: ${error.message}`);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (!this.client) return;
      if (ttlSeconds) {
        await this.client.set(reqKey(key), value, "EX", ttlSeconds);
      } else {
        await this.client.set(reqKey(key), value);
      }
    } catch (error: any) {
      this.logger.error(`Redis SET error for key ${key}: ${error.message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (!this.client) return;
      await this.client.del(reqKey(key));
    } catch (error: any) {
      this.logger.error(`Redis DEL error for key ${key}: ${error.message}`);
    }
  }

  async clear(): Promise<void> {
    try {
      if (!this.client) return;
      await this.client.flushdb();
      this.logger.log("Redis cache cleared successfully.");
    } catch (error: any) {
      this.logger.error(`Redis FLUSHDB error: ${error.message}`);
    }
  }

  async ping(): Promise<string> {
    if (!this.client) {
      throw new Error("Redis client is not initialized");
    }
    return await this.client.ping();
  }
}

// Simple prefix mapper to avoid key collisions
function reqKey(key: string): string {
  return `lifekit:cache:${key}`;
}
