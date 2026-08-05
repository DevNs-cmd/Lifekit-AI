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
import { TaskRepository } from "../src/tasks/repositories/task.repository";
import { LifeMissionRepository } from "../src/life-mission/repositories/life-mission.repository";

describe("Tasks API (e2e)", () => {
  let app: INestApplication;

  const mockUserRepo = {
    findById: jest.fn(),
  };

  const mockTaskRepo = {
    createTask: jest.fn(),
    findTaskById: jest.fn(),
    findTasksByMission: jest.fn(),
    updateTask: jest.fn(),
    updateTaskStatus: jest.fn(),
    deleteTask: jest.fn(),
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

  function mockTask(overrides: any = {}) {
    return {
      task_id: 1,
      mission_id: 1,
      title: "Buy new running shoes",
      description: "Ensure shoes are suitable for road running.",
      status: "PENDING",
      priority: "Medium",
      due_date: new Date("2026-08-05"),
      created_at: new Date(),
      ...overrides,
    };
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UserRepository)
      .useValue(mockUserRepo)
      .overrideProvider(TaskRepository)
      .useValue(mockTaskRepo)
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

  describe("POST /api/tasks", () => {
    it("should create a task", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockMissionRepo.findMissionById.mockResolvedValue(mockMission());
      mockTaskRepo.createTask.mockResolvedValue(mockTask());
      const res = await request(app.getHttpServer())
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
          missionId: 1,
          title: "Buy new running shoes",
          description: "Ensure shoes are suitable for road running.",
          status: "PENDING",
          priority: "Medium",
          dueDate: "2026-08-05T18:00:00.000Z",
        })
        .expect(HttpStatus.CREATED);
      expect(res.body.data.task_id).toBe(1);
    });

    it("should return 400 for invalid payload", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      await request(app.getHttpServer())
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "" })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe("GET /api/tasks?missionId=", () => {
    it("should return paginated tasks", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockMissionRepo.findMissionById.mockResolvedValue(mockMission());
      mockTaskRepo.findTasksByMission.mockResolvedValue({
        data: [mockTask()],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      const res = await request(app.getHttpServer())
        .get("/api/tasks?missionId=1")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });
  });

  describe("GET /api/tasks/:id", () => {
    it("should return a task", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockTaskRepo.findTaskById.mockResolvedValue(mockTask());
      mockMissionRepo.findMissionById.mockResolvedValue(mockMission());
      await request(app.getHttpServer())
        .get("/api/tasks/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);
    });

    it("should return 404 when missing", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockTaskRepo.findTaskById.mockResolvedValue(null);
      await request(app.getHttpServer())
        .get("/api/tasks/999")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe("PATCH /api/tasks/:id/status", () => {
    it("should update task status", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockTaskRepo.findTaskById.mockResolvedValue(mockTask());
      mockMissionRepo.findMissionById.mockResolvedValue(mockMission());
      mockTaskRepo.updateTaskStatus.mockResolvedValue(
        mockTask({ status: "COMPLETED" }),
      );
      const res = await request(app.getHttpServer())
        .patch("/api/tasks/1/status")
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "COMPLETED" })
        .expect(HttpStatus.OK);
      expect(res.body.data.status).toBe("COMPLETED");
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("should delete a task", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockTaskRepo.findTaskById.mockResolvedValue(mockTask());
      mockMissionRepo.findMissionById.mockResolvedValue(mockMission());
      mockTaskRepo.deleteTask.mockResolvedValue(mockTask());
      await request(app.getHttpServer())
        .delete("/api/tasks/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);
    });
  });
});
