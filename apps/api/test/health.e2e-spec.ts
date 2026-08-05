process.env.DATABASE_URL = "postgresql://localhost:5432/test-db";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.JWT_SECRET =
  "test-jwt-secret-key-that-is-at-least-32-characters-long";
process.env.JWT_REFRESH_SECRET =
  "test-jwt-secret-key-that-is-at-least-32-characters-long";
process.env.AI_SERVICE_URL = "http://localhost:8000";

import { HttpStatus, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { CacheService } from "../src/common/cache/cache.service";

describe("Health API (e2e)", () => {
  let app: INestApplication;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
  };

  const mockCacheService = {
    ping: jest.fn(),
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(CacheService)
      .useValue(mockCacheService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/live", () => {
    it("should return 200 and liveness status", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/live")
        .expect(HttpStatus.OK);

      expect(res.body.status).toBe("healthy");
      expect(res.body.details.api).toBe("healthy");
    });
  });

  describe("GET /api/health", () => {
    it("should return 200 when all systems are healthy", async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([1]);
      mockCacheService.ping.mockResolvedValue("PONG");

      const res = await request(app.getHttpServer())
        .get("/api/health")
        .expect(HttpStatus.OK);

      expect(res.body.status).toBe("healthy");
      expect(res.body.details.database).toBe("healthy");
      expect(res.body.details.redis).toBe("healthy");
    });

    it("should return 503 when database query fails", async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(new Error("DB Timeout"));
      mockCacheService.ping.mockResolvedValue("PONG");

      const res = await request(app.getHttpServer())
        .get("/api/health")
        .expect(HttpStatus.SERVICE_UNAVAILABLE);

      expect(res.body.status).toBe("unhealthy");
      expect(res.body.details.database).toBe("unhealthy");
      expect(res.body.details.redis).toBe("healthy");
    });

    it("should return 503 when Redis ping fails", async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([1]);
      mockCacheService.ping.mockRejectedValue(new Error("Redis Timeout"));

      const res = await request(app.getHttpServer())
        .get("/api/health")
        .expect(HttpStatus.SERVICE_UNAVAILABLE);

      expect(res.body.status).toBe("unhealthy");
      expect(res.body.details.database).toBe("healthy");
      expect(res.body.details.redis).toBe("unhealthy");
    });
  });

  describe("GET /api/ready", () => {
    it("should return 200 when ready", async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([1]);
      mockCacheService.ping.mockResolvedValue("PONG");

      await request(app.getHttpServer())
        .get("/api/ready")
        .expect(HttpStatus.OK);
    });

    it("should return 503 when not ready", async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(new Error("DB Error"));
      mockCacheService.ping.mockResolvedValue("PONG");

      await request(app.getHttpServer())
        .get("/api/ready")
        .expect(HttpStatus.SERVICE_UNAVAILABLE);
    });
  });
});
