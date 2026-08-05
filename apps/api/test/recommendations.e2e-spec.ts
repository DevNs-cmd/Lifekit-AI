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
import { RecommendationRepository } from "../src/recommendations/repositories/recommendation.repository";

describe("Recommendations API (e2e)", () => {
  let app: INestApplication;

  const mockUserRepo = {
    findById: jest.fn(),
  };

  const mockRecommendationRepo = {
    createRecommendation: jest.fn(),
    findUserRecommendations: jest.fn(),
    findRecommendationById: jest.fn(),
    updateRecommendationStatus: jest.fn(),
    deleteRecommendation: jest.fn(),
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

  function mockRecommendation(overrides: any = {}) {
    return {
      opportunity_id: 1,
      user_id: testUserId,
      category: "CAREER",
      title: "Join a mentorship program",
      description: "Find a mentor to accelerate career growth.",
      relevanceScore: 0.9,
      status: "PENDING",
      created_at: new Date(),
      updated_at: new Date(),
      metadata: {},
      ...overrides,
    };
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UserRepository)
      .useValue(mockUserRepo)
      .overrideProvider(RecommendationRepository)
      .useValue(mockRecommendationRepo)
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

  describe("POST /api/recommendations", () => {
    it("should create a recommendation", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockRecommendationRepo.createRecommendation.mockResolvedValue(
        mockRecommendation(),
      );
      const res = await request(app.getHttpServer())
        .post("/api/recommendations")
        .set("Authorization", `Bearer ${token}`)
        .send({
          category: "CAREER",
          preferences: {
            topics: ["mentorship", "leadership"],
            difficultyLevel: "BEGINNER",
            maxDurationMinutes: 45,
          },
          context: "Looking for career growth opportunities.",
        })
        .expect(HttpStatus.CREATED);
      expect(res.body.data.opportunity_id).toBe(1);
    });

    it("should return 400 when required fields missing", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      await request(app.getHttpServer())
        .post("/api/recommendations")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Only title" })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe("GET /api/recommendations", () => {
    it("should return paginated recommendations", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockRecommendationRepo.findUserRecommendations.mockResolvedValue({
        data: [mockRecommendation()],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      const res = await request(app.getHttpServer())
        .get("/api/recommendations")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });
  });

  describe("GET /api/recommendations/:id", () => {
    it("should return a recommendation", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockRecommendationRepo.findRecommendationById.mockResolvedValue(
        mockRecommendation({ user_id: testUserId }),
      );
      await request(app.getHttpServer())
        .get("/api/recommendations/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);
    });
  });

  describe("PATCH /api/recommendations/:id/status", () => {
    it("should update status", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockRecommendationRepo.findRecommendationById.mockResolvedValue(
        mockRecommendation({ user_id: testUserId }),
      );
      mockRecommendationRepo.updateRecommendationStatus.mockResolvedValue(
        mockRecommendation({ status: "ACCEPTED" }),
      );
      const res = await request(app.getHttpServer())
        .patch("/api/recommendations/1/status")
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "ACCEPTED" })
        .expect(HttpStatus.OK);
      expect(res.body.data.status).toBe("ACCEPTED");
    });
  });

  describe("DELETE /api/recommendations/:id", () => {
    it("should delete", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockRecommendationRepo.findRecommendationById.mockResolvedValue(
        mockRecommendation({ user_id: testUserId }),
      );
      mockRecommendationRepo.deleteRecommendation.mockResolvedValue(
        mockRecommendation(),
      );
      await request(app.getHttpServer())
        .delete("/api/recommendations/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);
    });
  });
});
