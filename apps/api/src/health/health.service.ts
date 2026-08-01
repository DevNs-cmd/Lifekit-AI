import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CacheService } from "../common/cache/cache.service";

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  /**
   * Performs full readiness checks on all dependencies (DB, Cache).
   */
  async checkHealth() {
    let dbStatus = "healthy";
    let redisStatus = "healthy";
    let overallStatus = "healthy";
    const errors: string[] = [];

    // Verify PostgreSQL connection
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (err: any) {
      dbStatus = "unhealthy";
      overallStatus = "unhealthy";
      errors.push(`Database connection failed: ${err.message}`);
      this.logger.error("Health check database query failure", err.stack);
    }

    // Verify Redis connection
    try {
      await this.cache.ping();
    } catch (err: any) {
      redisStatus = "unhealthy";
      overallStatus = "unhealthy";
      errors.push(`Redis connection failed: ${err.message}`);
      this.logger.error("Health check Redis ping failure", err.stack);
    }

    return {
      status: overallStatus,
      version: "0.1.0",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      details: {
        api: "healthy",
        database: dbStatus,
        redis: redisStatus,
      },
      ...(errors.length > 0 ? { errors } : {}),
    };
  }

  /**
   * Fast liveness probe check requiring no third-party database dependency checks.
   */
  getLiveness() {
    return {
      status: "healthy",
      version: "0.1.0",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      details: {
        api: "healthy",
      },
    };
  }
}
