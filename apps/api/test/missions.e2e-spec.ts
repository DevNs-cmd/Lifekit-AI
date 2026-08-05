// Define environment variables BEFORE imports so that ConfigModule validation does not crash during import phase
process.env.DATABASE_URL = "postgresql://localhost:5432/test-db";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.JWT_SECRET =
  "test-jwt-secret-key-that-is-at-least-32-characters-long";
process.env.JWT_REFRESH_SECRET =
  "test-jwt-secret-key-that-is-at-least-32-characters-long";
process.env.AI_SERVICE_URL = "http://localhost:8000";

import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import * as jwt from "jsonwebtoken";
import { AppModule } from "../src/app.module";
import { UserRepository } from "../src/users/repositories/user.repository";
import { SessionRepository } from "../src/auth/repositories/session.repository";
import { PrismaService } from "../src/prisma/prisma.service";
import { CacheService } from "../src/common/cache/cache.service";
import { TransformInterceptor } from "../src/common/interceptors";
import { LifeMissionRepository } from "../src/life-mission/repositories/life-mission.repository";

describe("Life Missions API (e2e)", () => {
  let app: INestApplication;

  const mockUserRepo = {
    findById: jest.fn(),
  };

  const mockMissionRepo = {
    createMission: jest.fn(),
    findMissionById: jest.fn(),
    findUserMissions: jest.fn(),
    updateMission: jest.fn(),
    deleteMission: jest.fn(),
  };

  const mockSessionRepo = {
    findSessionsByUser: jest.fn(),
    deleteSessionByTokenHash: jest.fn(),
    deleteSessionsByUser: jest.fn(),
  };

  const mockPrismaService = {
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
  };

  const mockCacheService = {
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    ping: jest.fn().mockResolvedValue("PONG"),
    getClient: jest.fn().mockReturnValue({
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    }),
  };

  const secret = "test-jwt-secret-key-that-is-at-least-32-characters-long";
  const testUserId = 123;
  const token = jwt.sign({ sub: testUserId }, secret, { expiresIn: "1h" });

  function mockMission(overrides: any = {}) {
    return {
      mission_id: 1,
      user_id: testUserId,
      title: "Achieve Financial Independence",
      description: "Build savings and passive income streams.",
      category: null,
      priority: "MEDIUM",
      status: "ACTIVE",
      progress: 0,
      isArchived: false,
      archivedAt: null,
      start_date: new Date("2026-08-01"),
      target_date: new Date("2035-12-31"),
      created_at: new Date(),
      updated_at: new Date(),
      goals: [],
      values: [],
      longTermObjectives: [],
      constraints: [],
      ...overrides,
    };
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UserRepository)
      .useValue(mockUserRepo)
      .overrideProvider(LifeMissionRepository)
      .useValue(mockMissionRepo)
      .overrideProvider(SessionRepository)
      .useValue(mockSessionRepo)
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(CacheService)
      .useValue(mockCacheService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());
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

  describe("POST /api/life-missions", () => {
    it("should create a mission", async () => {
      mockUserRepo.findById.mockResolvedValue({
        user_id: testUserId,
        email: "john@example.com",
        full_name: "John Doe",
      });
      mockMissionRepo.createMission.mockResolvedValue(mockMission());
      const res = await request(app.getHttpServer())
        .post("/api/life-missions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Mission",
          description: "desc",
          goals: ["g1"],
          values: ["v1"],
          longTermObjectives: ["o1"],
          startDate: "2026-08-01",
          targetDate: "2035-12-31",
        })
        .expect(HttpStatus.CREATED);
      expect(res.body.data.mission_id).toBe(1);
    });

    it("should return 400 for invalid payload", async () => {
      mockUserRepo.findById.mockResolvedValue({
        user_id: testUserId,
        email: "john@example.com",
        full_name: "John Doe",
      });
      await request(app.getHttpServer())
        .post("/api/life-missions")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "" })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe("GET /api/life-missions", () => {
    it("should return paginated missions", async () => {
      mockUserRepo.findById.mockResolvedValue({
        user_id: testUserId,
        email: "john@example.com",
        full_name: "John Doe",
      });
      mockMissionRepo.findUserMissions.mockResolvedValue({
        data: [mockMission()],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      const res = await request(app.getHttpServer())
        .get("/api/life-missions")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });
  });

  describe("GET /api/life-missions/:id", () => {
    it("should return a mission", async () => {
      mockUserRepo.findById.mockResolvedValue({
        user_id: testUserId,
        email: "john@example.com",
        full_name: "John Doe",
      });
      mockMissionRepo.findMissionById.mockResolvedValue(
        mockMission({ user_id: testUserId }),
      );
      await request(app.getHttpServer())
        .get("/api/life-missions/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);
    });

    it("should return 404 when missing", async () => {
      mockUserRepo.findById.mockResolvedValue({
        user_id: testUserId,
        email: "john@example.com",
        full_name: "John Doe",
      });
      mockMissionRepo.findMissionById.mockResolvedValue(null);
      await request(app.getHttpServer())
        .get("/api/life-missions/999")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe("PATCH /api/life-missions/:id", () => {
    it("should update a mission", async () => {
      mockUserRepo.findById.mockResolvedValue({
        user_id: testUserId,
        email: "john@example.com",
        full_name: "John Doe",
      });
      mockMissionRepo.findMissionById.mockResolvedValue(
        mockMission({ user_id: testUserId }),
      );
      mockMissionRepo.updateMission.mockResolvedValue(
        mockMission({ title: "Updated" }),
      );
      const res = await request(app.getHttpServer())
        .patch("/api/life-missions/1")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Updated" })
        .expect(HttpStatus.OK);
      expect(res.body.data.title).toBe("Updated");
    });

    it("should return 403 for non-owner", async () => {
      mockUserRepo.findById.mockResolvedValue({
        user_id: testUserId,
        email: "john@example.com",
        full_name: "John Doe",
      });
      mockMissionRepo.findMissionById.mockResolvedValue(
        mockMission({ user_id: 999 }),
      );
      await request(app.getHttpServer())
        .patch("/api/life-missions/1")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Updated" })
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe("DELETE /api/life-missions/:id", () => {
    it("should delete a mission", async () => {
      mockUserRepo.findById.mockResolvedValue({
        user_id: testUserId,
        email: "john@example.com",
        full_name: "John Doe",
      });
      mockMissionRepo.findMissionById.mockResolvedValue(
        mockMission({ user_id: testUserId }),
      );
      mockMissionRepo.deleteMission.mockResolvedValue(mockMission());
      await request(app.getHttpServer())
        .delete("/api/life-missions/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);
    });
  });
});
