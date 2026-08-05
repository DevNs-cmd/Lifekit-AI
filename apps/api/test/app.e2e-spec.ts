process.env.DATABASE_URL = "postgresql://localhost:5432/test-db";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.JWT_SECRET =
  "test-jwt-secret-key-that-is-at-least-32-characters-long";
process.env.JWT_REFRESH_SECRET =
  "test-jwt-secret-key-that-is-at-least-32-characters-long";
process.env.AI_SERVICE_URL = "http://localhost:8000";

import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { UserRepository } from "../src/users/repositories/user.repository";
import { SessionRepository } from "../src/auth/repositories/session.repository";
import { PrismaService } from "../src/prisma/prisma.service";
import { CacheService } from "../src/common/cache/cache.service";
import { TransformInterceptor } from "../src/common/interceptors";
import * as bcrypt from "bcrypt";

describe("Authentication API (e2e)", () => {
  let app: INestApplication;
  const testEmail = `e2e-${Date.now()}@example.com`;
  const testPassword = "StrongP@ss123";
  const testFullName = "E2E Test User";
  let accessToken: string;
  let refreshToken: string;

  const passwordHash = bcrypt.hashSync(testPassword, 10);

  const mockUser = {
    user_id: 1,
    email: testEmail,
    full_name: testFullName,
    password_hash: passwordHash,
    phone: null,
    date_of_birth: null,
    profession: null,
    profile_photo: null,
    created_at: new Date(),
    updated_at: new Date(),
    preference: null,
  };

  let registered = false;

  const mockUserRepo = {
    findByEmail: jest.fn().mockImplementation(async (email: string) => {
      if (email === testEmail && registered) {
        return mockUser;
      }
      return null;
    }),
    createUser: jest.fn().mockImplementation(async (data: any) => {
      registered = true;
      return {
        ...mockUser,
        email: data.email,
        full_name: data.fullName,
        password_hash: passwordHash,
      };
    }),
    findById: jest.fn().mockImplementation(async (id: number) => {
      if (id === 1) {
        return mockUser;
      }
      return null;
    }),
  };

  const mockSessionRepo = {
    createSession: jest.fn().mockResolvedValue({
      session_id: 100,
      user_id: 1,
      token_hash: "mock-hash",
      expires_at: new Date(Date.now() + 3600000),
      created_at: new Date(),
    }),
    findSessionByTokenHash: jest
      .fn()
      .mockImplementation(async (hash: string) => {
        if (hash === "bad-token") return null;
        return {
          session_id: 100,
          user_id: 1,
          token_hash: hash,
          expires_at: new Date(Date.now() + 3600000),
          created_at: new Date(),
        };
      }),
    deleteSessionByTokenHash: jest.fn().mockResolvedValue(true),
    deleteSessionsByUser: jest.fn().mockResolvedValue(true),
  };

  const mockPrismaService = {
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
    preferences: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    users: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
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

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UserRepository)
      .useValue(mockUserRepo)
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

  describe("POST /api/auth/register", () => {
    it("should register a new user and return 201", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          email: testEmail,
          password: testPassword,
          fullName: testFullName,
        })
        .expect(HttpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user).not.toHaveProperty("password_hash");
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });

    it("should return 400 for invalid email", async () => {
      await request(app.getHttpServer())
        .post("/api/auth/register")
        .send({ email: "bad", password: testPassword, fullName: testFullName })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it("should return 409 for duplicate email", async () => {
      registered = true; // force duplicate
      const res = await request(app.getHttpServer())
        .post("/api/auth/register")
        .send({ email: testEmail, password: testPassword, fullName: "Dup" })
        .expect(HttpStatus.CONFLICT);

      expect(res.body.message).toContain("already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      registered = true;
      const res = await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email: testEmail, password: testPassword })
        .expect(HttpStatus.OK);

      expect(res.body.data.accessToken).toBeDefined();
      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });

    it("should return 401 for invalid password", async () => {
      registered = true;
      await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email: testEmail, password: "WrongPass1" })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("should rotate tokens", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/auth/refresh")
        .send({ refreshToken })
        .expect(HttpStatus.OK);

      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      refreshToken = res.body.data.refreshToken;
      accessToken = res.body.data.accessToken;
    });

    it("should return 401 for invalid token", async () => {
      await request(app.getHttpServer())
        .post("/api/auth/refresh")
        .send({ refreshToken: "bad-token" })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout successfully", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(HttpStatus.OK);

      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/auth/profile", () => {
    beforeEach(() => {
      registered = true;
    });

    it("should return profile with valid token", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body.data.email).toBe(testEmail);
      expect(res.body.data).not.toHaveProperty("password_hash");
    });

    it("should return 401 without token", async () => {
      await request(app.getHttpServer())
        .get("/api/auth/profile")
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
