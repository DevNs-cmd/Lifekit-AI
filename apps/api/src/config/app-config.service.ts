import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Environment } from "./env.validation";

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get nodeEnv(): Environment {
    return this.configService.get<Environment>(
      "NODE_ENV",
      Environment.Development,
    );
  }

  get isProduction(): boolean {
    return this.nodeEnv === Environment.Production;
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === Environment.Development;
  }

  get port(): number {
    return this.configService.get<number>("PORT", 4000);
  }

  get dbUrl(): string {
    return this.configService.get<string>("DATABASE_URL") || "";
  }

  get redisUrl(): string {
    return this.configService.get<string>("REDIS_URL") || "";
  }

  get jwtSecret(): string {
    return this.configService.get<string>("JWT_SECRET") || "";
  }

  get jwtRefreshSecret(): string {
    return this.configService.get<string>("JWT_REFRESH_SECRET") || "";
  }

  get aiServiceUrl(): string {
    return this.configService.get<string>("AI_SERVICE_URL") || "";
  }

  get corsOrigin(): string {
    return this.configService.get<string>(
      "CORS_ORIGIN",
      "http://localhost:3000",
    );
  }

  get throttlerTtl(): number {
    return this.configService.get<number>("THROTTLER_TTL", 60);
  }

  get throttlerLimit(): number {
    return this.configService.get<number>("THROTTLER_LIMIT", 100);
  }

  get uploadDir(): string {
    return this.configService.get<string>("UPLOAD_DIR", "./uploads");
  }

  get maxFileSize(): number {
    return this.configService.get<number>("MAX_FILE_SIZE", 10485760);
  }
}
