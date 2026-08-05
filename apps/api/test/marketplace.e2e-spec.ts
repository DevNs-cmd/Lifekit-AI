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
import { MarketplaceRepository } from "../src/marketplace/repositories/marketplace.repository";

describe("Marketplace API (e2e)", () => {
  let app: INestApplication;

  const mockUserRepo = {
    findById: jest.fn(),
  };

  const mockMarketplaceRepo = {
    createListing: jest.fn(),
    searchListings: jest.fn(),
    findListingById: jest.fn(),
    updateListing: jest.fn(),
    deleteListing: jest.fn(),
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

  function mockListing(overrides: any = {}) {
    return {
      service_id: 1,
      service_name: "Career Coaching",
      provider_name: "LifeKit Provider",
      category: "COACHING",
      description: "One-on-one career coaching session.",
      price: 99.99,
      rating: 4.5,
      image_url: null,
      created_at: new Date(),
      userId: testUserId,
      tags: [],
      isFree: false,
      stock: null,
      isAvailable: true,
      ...overrides,
    };
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UserRepository)
      .useValue(mockUserRepo)
      .overrideProvider(MarketplaceRepository)
      .useValue(mockMarketplaceRepo)
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

  describe("POST /api/marketplace", () => {
    it("should create a listing", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockMarketplaceRepo.createListing.mockResolvedValue(mockListing());
      const res = await request(app.getHttpServer())
        .post("/api/marketplace")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Career Coaching",
          category: "COACHING",
          description: "One-on-one career coaching session.",
          price: 99.99,
          tags: ["career", "coaching"],
          isFree: false,
          availability: {
            isAvailable: true,
            stock: null,
          },
        })
        .expect(HttpStatus.CREATED);
      expect(res.body.data.service_id).toBe(1);
    });
  });

  describe("GET /api/marketplace", () => {
    it("should return paginated listings", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockMarketplaceRepo.searchListings.mockResolvedValue({
        data: [mockListing()],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      const res = await request(app.getHttpServer())
        .get("/api/marketplace?category=COACHING")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });
  });

  describe("GET /api/marketplace/:id", () => {
    it("should return a listing", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockMarketplaceRepo.findListingById.mockResolvedValue(mockListing());
      await request(app.getHttpServer())
        .get("/api/marketplace/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);
    });

    it("should return 404 when missing", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockMarketplaceRepo.findListingById.mockResolvedValue(null);
      await request(app.getHttpServer())
        .get("/api/marketplace/999")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe("PATCH /api/marketplace/:id", () => {
    it("should update a listing", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockMarketplaceRepo.findListingById.mockResolvedValue(mockListing());
      mockMarketplaceRepo.updateListing.mockResolvedValue(
        mockListing({ service_name: "Updated" }),
      );
      const res = await request(app.getHttpServer())
        .patch("/api/marketplace/1")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Updated" })
        .expect(HttpStatus.OK);
      expect(res.body.data.service_name).toBe("Updated");
    });
  });

  describe("DELETE /api/marketplace/:id", () => {
    it("should delete a listing", async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser());
      mockMarketplaceRepo.findListingById.mockResolvedValue(mockListing());
      mockMarketplaceRepo.deleteListing.mockResolvedValue(mockListing());
      await request(app.getHttpServer())
        .delete("/api/marketplace/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);
    });
  });
});
