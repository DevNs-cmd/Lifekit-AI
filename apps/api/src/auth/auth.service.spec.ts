import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { UserRepository } from "../users/repositories/user.repository";
import { SessionRepository } from "./repositories/session.repository";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { User } from "../users/entities/user.entity";
import { Session } from "./entities/session.entity";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockUserRepository = {
  findByEmail: jest.fn(),
  createUser: jest.fn(),
  findById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  updatePreferences: jest.fn(),
};

const mockSessionRepository = {
  createSession: jest.fn(),
  findSessionByTokenHash: jest.fn(),
  findSessionsByUser: jest.fn(),
  deleteSessionByTokenHash: jest.fn(),
  deleteExpiredSessions: jest.fn(),
  deleteSessionsByUser: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

// Helper: create a fake user
function createMockUser(overrides: any = {}): User {
  const user = {
    user_id: 123,
    email: "john@example.com",
    full_name: "John Doe",
    password_hash: "$2b$12$abcdefghijklmnopqrstuv",
    preference: null,
    created_at: new Date("2025-01-01"),
    updated_at: new Date("2025-01-01"),
    ...overrides,
  } as any;

  // Add compatibility getters
  Object.defineProperty(user, "id", { get: () => user.user_id });
  Object.defineProperty(user, "fullName", { get: () => user.full_name });
  Object.defineProperty(user, "createdAt", { get: () => user.created_at });
  Object.defineProperty(user, "updatedAt", { get: () => user.updated_at });

  return user;
}

function createMockSession(overrides: any = {}): Session {
  return {
    id: "session-id-1",
    userId: 123,
    token: "hashed-token",
    userAgent: "test-agent",
    ipAddress: "127.0.0.1",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------
describe("AuthService", () => {
  let service: AuthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: SessionRepository, useValue: mockSessionRepository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default config stubs
    mockConfigService.get.mockImplementation((key: string) => {
      const map: Record<string, any> = {
        "jwt.secret": "access-secret",
        "jwt.refreshSecret": "refresh-secret",
        "jwt.expiresIn": "15m",
        "jwt.refreshExpiresIn": "7d",
      };
      return map[key] ?? undefined;
    });
  });

  // -------------------------------------------------------------------------
  // register()
  // -------------------------------------------------------------------------
  describe("register", () => {
    const registerDto: RegisterDto = {
      email: "newuser@example.com",
      password: "StrongP@ss1",
      fullName: "New User",
    };

    it("should register a new user and return AuthResult", async () => {
      const mockUser = createMockUser({
        email: registerDto.email,
        full_name: registerDto.fullName,
      });
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.createUser.mockResolvedValue(mockUser);
      mockSessionRepository.createSession.mockResolvedValue(
        createMockSession(),
      );

      const result = await service.register(registerDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(mockUserRepository.createUser).toHaveBeenCalledWith({
        email: registerDto.email,
        fullName: registerDto.fullName,
        passwordHash: expect.any(String),
      });
      expect(mockSessionRepository.createSession).toHaveBeenCalled();
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result.user).not.toHaveProperty("password_hash");
    });

    it("should throw ConflictException when email already exists", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(createMockUser());

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUserRepository.createUser).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // login()
  // -------------------------------------------------------------------------
  describe("login", () => {
    const loginDto: LoginDto = {
      email: "john@example.com",
      password: "MySecretPassword123",
    };

    it("should authenticate and return AuthResult for valid credentials", async () => {
      const plainPassword = "MySecretPassword123";
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const mockUser = createMockUser({
        email: loginDto.email,
        password_hash: hashedPassword,
      });

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockSessionRepository.createSession.mockResolvedValue(
        createMockSession(),
      );

      const result = await service.login(loginDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        loginDto.email,
      );
      expect(mockSessionRepository.createSession).toHaveBeenCalled();
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result.user).not.toHaveProperty("password_hash");
    });

    it("should throw UnauthorizedException for invalid email", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException for invalid password", async () => {
      const mockUser = createMockUser({
        password_hash: await bcrypt.hash("DifferentPassword", 10),
      });
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // -------------------------------------------------------------------------
  // validateUser()
  // -------------------------------------------------------------------------
  describe("validateUser", () => {
    it("should validate and return sanitized user for valid password", async () => {
      const plainPassword = "ValidPassword123";
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const mockUser = createMockUser({ password_hash: hashedPassword });

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.validateUser(mockUser.email, plainPassword);

      expect(result).not.toBeNull();
      expect(result.email).toBe(mockUser.email);
      expect(result).not.toHaveProperty("password_hash");
    });

    it("should throw UnauthorizedException for incorrect password", async () => {
      const plainPassword = "ValidPassword123";
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const mockUser = createMockUser({ password_hash: hashedPassword });

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.validateUser(mockUser.email, "WrongPassword"),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if user not found", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.validateUser("nonexistent@example.com", "any"),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // -------------------------------------------------------------------------
  // refreshAccessToken()
  // -------------------------------------------------------------------------
  describe("refreshAccessToken", () => {
    let mockUser: User;
    let rawRefreshToken: string;

    beforeEach(() => {
      mockUser = createMockUser();
      rawRefreshToken = jwt.sign({ sub: mockUser.user_id }, "refresh-secret", {
        expiresIn: "7d",
      });
    });

    it("should return a new pair of tokens when refresh token is valid", async () => {
      const mockSession = createMockSession({
        userId: mockUser.user_id,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // expires in 5m
      });

      mockSessionRepository.findSessionByTokenHash.mockResolvedValue(
        mockSession,
      );
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockSessionRepository.deleteSessionByTokenHash.mockResolvedValue(
        mockSession,
      );
      mockSessionRepository.createSession.mockResolvedValue(
        createMockSession(),
      );

      const result = await service.refreshAccessToken({
        refreshToken: rawRefreshToken,
      });

      expect(mockSessionRepository.findSessionByTokenHash).toHaveBeenCalled();
      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        mockUser.user_id,
      );
      expect(mockSessionRepository.deleteSessionByTokenHash).toHaveBeenCalled();
      expect(mockSessionRepository.createSession).toHaveBeenCalled();
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
    });

    it("should throw UnauthorizedException if token verification fails", async () => {
      await expect(
        service.refreshAccessToken({ refreshToken: "invalid-token" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException and delete all sessions if token is not in db (replay attack)", async () => {
      mockSessionRepository.findSessionByTokenHash.mockResolvedValue(null);
      mockSessionRepository.deleteSessionsByUser.mockResolvedValue(undefined);

      await expect(
        service.refreshAccessToken({ refreshToken: rawRefreshToken }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockSessionRepository.deleteSessionsByUser).toHaveBeenCalledWith(
        mockUser.user_id,
      );
    });

    it("should throw UnauthorizedException if session is expired", async () => {
      const mockSession = createMockSession({
        userId: mockUser.user_id,
        expiresAt: new Date(Date.now() - 5000), // expired 5s ago
      });

      mockSessionRepository.findSessionByTokenHash.mockResolvedValue(
        mockSession,
      );
      mockSessionRepository.deleteSessionByTokenHash.mockResolvedValue(
        mockSession,
      );

      await expect(
        service.refreshAccessToken({ refreshToken: rawRefreshToken }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockSessionRepository.deleteSessionByTokenHash).toHaveBeenCalled();
    });

    it("should throw UnauthorizedException if user no longer exists", async () => {
      const mockSession = createMockSession({
        userId: mockUser.user_id,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

      mockSessionRepository.findSessionByTokenHash.mockResolvedValue(
        mockSession,
      );
      mockUserRepository.findById.mockResolvedValue(null);
      mockSessionRepository.deleteSessionByTokenHash.mockResolvedValue(
        mockSession,
      );

      await expect(
        service.refreshAccessToken({ refreshToken: rawRefreshToken }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockSessionRepository.deleteSessionByTokenHash).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // logout()
  // -------------------------------------------------------------------------
  describe("logout", () => {
    it("should call deleteSessionByTokenHash and return void", async () => {
      const token = "some-token";
      mockSessionRepository.deleteSessionByTokenHash.mockResolvedValue(
        createMockSession(),
      );

      await service.logout(token);

      expect(mockSessionRepository.deleteSessionByTokenHash).toHaveBeenCalled();
    });

    it("should handle error gracefully and not throw", async () => {
      mockSessionRepository.deleteSessionByTokenHash.mockRejectedValue(
        new Error("DB Error"),
      );

      await expect(service.logout("token")).resolves.not.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // Token Hardening & JWT Verification Checks
  // -------------------------------------------------------------------------
  describe("Token security properties", () => {
    it("should sign access and refresh tokens with correct claims and secrets", async () => {
      const plainPassword = "ValidPassword123";
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const mockUser = createMockUser({ password_hash: hashedPassword });

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockSessionRepository.createSession.mockResolvedValue(
        createMockSession(),
      );

      const result = await service.register({
        email: "test@example.com",
        password: "StrongP@ss1",
        fullName: "Test User",
      });

      // Decode to verify structure
      const accessDecoded = jwt.decode(result.accessToken) as any;
      expect(accessDecoded).not.toBeNull();
      expect(accessDecoded.sub).toBe(mockUser.user_id);
      // Must NOT contain PII
      expect(accessDecoded.email).toBeUndefined();
      expect(accessDecoded.fullName).toBeUndefined();
      expect(accessDecoded.jti).toBeDefined();

      const refreshDecoded = jwt.decode(result.refreshToken) as any;
      expect(refreshDecoded).not.toBeNull();
      expect(refreshDecoded.sub).toBe(mockUser.user_id);
      expect(refreshDecoded.email).toBeUndefined();
      expect(refreshDecoded.jti).toBeDefined();
    });
  });
});
