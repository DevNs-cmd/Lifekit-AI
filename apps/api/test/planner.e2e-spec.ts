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
import { PlannerRepository } from "../src/planner/repositories/planner.repository";
import { LifeMissionRepository } from "../src/life-mission/repositories/life-mission.repository";

describe("Planner API (e2e)", () => {
  let app: INestApplication;

  const mockUserRepo = {
    findById: jest.fn(),
  };

  const mockPlannerRepo = {
    createPlan: jest.fn(),
    findPlanById: jest.fn(),
    findPlansByMission: jest.fn(),
    updatePlan: jest.fn(),
    deletePlan: jest.fn(),
  };

  const mockMissionRepo = {
    findMissionById: jest.fn(),
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

  function mockUser() {
    return {
      user_id: testUserId,
      email: "john@example.com",
      full_name: "John Doe",
    };
  }

  function mockMission() {
    return {
      mission_id: 1,
      user_id: testUserId,
      title: "Mission",
      description: "desc",
      status: "ACTIVE",
    };
  }

  function mockPlan(overrides: any = {}) {
    return {
      goal_id: 1,
      user_id: testUserId,
      title: "Daily workout plan",
      goalInput: "Exercise 30 minutes daily",
      planningHorizon: "DAILY",
      priority: "MEDIUM",
      constraints: [],
      desiredOutcomes: [],
      created_at: new Date(),
      missionId: 1,
      ...overrides,
    };
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UserRepository)
      .useValue(mockUserRepo)
      .overrideProvider(PlannerRepository)
      .useValue(mockPlannerRepo)
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

  describe("POST /api/plans", () => {
    it("should create a plan", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockMissionRepo.findMissionById.mockResolvedValue(mockMission());
      mockPlannerRepo.createPlan.mockResolvedValue(mockPlan());
      const res = await request(app.getHttpServer())
        .post("/api/plans")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Daily workout plan",
          goalInput: "Exercise 30 minutes daily",
          planningHorizon: "DAILY",
          priority: "HIGH",
          desiredOutcomes: ["5k time under 22m"],
          missionId: 1,
        })
        .expect(HttpStatus.CREATED);
      expect(res.body.data.goal_id).toBe(1);
    });
  });

  describe("GET /api/plans?missionId=", () => {
    it("should return paginated plans", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockMissionRepo.findMissionById.mockResolvedValue(mockMission());
      mockPlannerRepo.findPlansByMission.mockResolvedValue({
        data: [mockPlan()],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      const res = await request(app.getHttpServer())
        .get("/api/plans?missionId=1")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });
  });

  describe("GET /api/plans/:id", () => {
    it("should return a plan", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockPlannerRepo.findPlanById.mockResolvedValue(
        mockPlan({ user_id: testUserId }),
      );
      await request(app.getHttpServer())
        .get("/api/plans/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);
    });
  });

  describe("PATCH /api/plans/:id", () => {
    it("should update a plan", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockPlannerRepo.findPlanById.mockResolvedValue(
        mockPlan({ user_id: testUserId }),
      );
      mockPlannerRepo.updatePlan.mockResolvedValue(
        mockPlan({ title: "Updated" }),
      );
      const res = await request(app.getHttpServer())
        .patch("/api/plans/1")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Updated" })
        .expect(HttpStatus.OK);
      expect(res.body.data.title).toBe("Updated");
    });
  });

  describe("DELETE /api/plans/:id", () => {
    it("should delete a plan", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockPlannerRepo.findPlanById.mockResolvedValue(
        mockPlan({ user_id: testUserId }),
      );
      mockPlannerRepo.deletePlan.mockResolvedValue(mockPlan());
      await request(app.getHttpServer())
        .delete("/api/plans/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);
    });
  });

  describe("POST /api/planner/generate", () => {
    it("should generate a plan using placeholder response", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      const res = await request(app.getHttpServer())
        .post("/api/planner/generate")
        .set("Authorization", `Bearer ${token}`)
        .send({
          goalInput: "Run a marathon",
          planningHorizon: "MONTHLY",
          priority: "HIGH",
          userConstraints: ["busy on weekends"],
        })
        .expect(HttpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe("Plan generation request received");
      expect(res.body.data.received.goalInput).toBe("Run a marathon");
      expect(res.body.data.userId).toBe(testUserId);
    });
  });
});
