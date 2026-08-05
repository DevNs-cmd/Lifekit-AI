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
import { MemoryRepository } from "../src/memory/repositories/memory.repository";

describe("Memories API (e2e)", () => {
  let app: INestApplication;

  const mockUserRepo = {
    findById: jest.fn(),
  };

  const mockMemoryRepo = {
    createMemory: jest.fn(),
    findMemoryById: jest.fn(),
    findUserMemories: jest.fn(),
    searchMemoryMetadata: jest.fn(),
    updateMemory: jest.fn(),
    deleteMemory: jest.fn(),
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

  function mockMemory(overrides: any = {}) {
    return {
      memory_id: 1,
      user_id: testUserId,
      content: "Remember to meditate daily.",
      memory_type: "GENERAL",
      title: "Meditation",
      importance_score: 0.8,
      embedding_id: null,
      created_at: new Date(),
      updated_at: new Date(),
      metadata: {},
      contextInfo: null,
      ...overrides,
    };
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UserRepository)
      .useValue(mockUserRepo)
      .overrideProvider(MemoryRepository)
      .useValue(mockMemoryRepo)
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

  describe("POST /api/memories", () => {
    it("should create a memory entry", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockMemoryRepo.createMemory.mockResolvedValue(mockMemory());
      const res = await request(app.getHttpServer())
        .post("/api/memories")
        .set("Authorization", `Bearer ${token}`)
        .send({
          content: "Remember to meditate daily.",
          type: "JOURNAL",
        })
        .expect(HttpStatus.CREATED);
      expect(res.body.data.memory_id).toBe(1);
    });
  });

  describe("GET /api/memories", () => {
    it("should return paginated memories", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockMemoryRepo.findUserMemories.mockResolvedValue({
        data: [mockMemory()],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      const res = await request(app.getHttpServer())
        .get("/api/memories")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });

    it("should search memories by query", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockMemoryRepo.searchMemoryMetadata.mockResolvedValue({
        data: [mockMemory()],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      const res = await request(app.getHttpServer())
        .get("/api/memories?query=meditate")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe("GET /api/memories/:id", () => {
    it("should return a memory entry", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockMemoryRepo.findMemoryById.mockResolvedValue(
        mockMemory({ user_id: testUserId }),
      );
      await request(app.getHttpServer())
        .get("/api/memories/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);
    });

    it("should return 404 when missing", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockMemoryRepo.findMemoryById.mockResolvedValue(null);
      await request(app.getHttpServer())
        .get("/api/memories/999")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe("PATCH /api/memories/:id", () => {
    it("should update a memory entry", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockMemoryRepo.findMemoryById.mockResolvedValue(
        mockMemory({ user_id: testUserId }),
      );
      mockMemoryRepo.updateMemory.mockResolvedValue(
        mockMemory({ content: "Updated content" }),
      );
      const res = await request(app.getHttpServer())
        .patch("/api/memories/1")
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "Updated content" })
        .expect(HttpStatus.OK);
      expect(res.body.data.content).toBe("Updated content");
    });
  });

  describe("DELETE /api/memories/:id", () => {
    it("should delete a memory entry", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockMemoryRepo.findMemoryById.mockResolvedValue(
        mockMemory({ user_id: testUserId }),
      );
      mockMemoryRepo.deleteMemory.mockResolvedValue(mockMemory());
      await request(app.getHttpServer())
        .delete("/api/memories/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);
    });
  });
});
