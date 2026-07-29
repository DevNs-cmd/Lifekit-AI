import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserRepository } from '../users/repositories/user.repository';
import { SessionRepository } from './repositories/session.repository';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { User } from '../users/entities/user.entity';
import { Session } from './entities/session.entity';
import * as bcryptUtils from './utils/bcrypt.util';
import { parseDuration } from './utils/duration.util';

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
};

const mockConfigService = {
  get: jest.fn(),
};

// Helper: create a fake user (without the passwordHash leave for us to include)
function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'john@example.com',
    fullName: 'John Doe',
    passwordHash: '$2b$12$abcdefghijklmnopqrstuv',
    preference: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  } as User;
}

function createMockSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 'session-id-1',
    userId: '550e8400-e29b-41d4-a716-446655440000',
    token: 'hashed-token',
    userAgent: 'test-agent',
    ipAddress: '127.0.0.1',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------
describe('AuthService', () => {
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
        'jwt.secret': 'access-secret',
        'jwt.refreshSecret': 'refresh-secret',
        'jwt.expiresIn': '15m',
        'jwt.refreshExpiresIn': '7d',
      };
      return map[key] ?? undefined;
    });
  });

  // -------------------------------------------------------------------------
  // register()
  // -------------------------------------------------------------------------
  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'newuser@example.com',
      password: 'StrongP@ss1',
      fullName: 'New User',
    };

    it('should register a new user and return AuthResult', async () => {
      const mockUser = createMockUser({ email: registerDto.email, fullName: registerDto.fullName });
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.createUser.mockResolvedValue(mockUser);
      mockSessionRepository.createSession.mockResolvedValue(createMockSession());

      const result = await service.register(registerDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(mockUserRepository.createUser).toHaveBeenCalledWith({
        email: registerDto.email,
        fullName: registerDto.fullName,
        passwordHash: expect.any(String),
      });
      expect(mockSessionRepository.createSession).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should throw ConflictException when email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(createMockUser());

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.createUser).not.toHaveBeenCalled();
    });

    it('should propagate repository failure on createUser', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.createUser.mockRejectedValue(new Error('DB error'));

      await expect(service.register(registerDto)).rejects.toThrow('DB error');
    });
  });

  // -------------------------------------------------------------------------
  // login()
  // -------------------------------------------------------------------------
  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'john@example.com',
      password: 'StrongP@ss1',
    };

    it('should login successfully with valid credentials', async () => {
      const mockUser = createMockUser();
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // bcrypt.compare returns true
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      mockSessionRepository.createSession.mockResolvedValue(createMockSession());

      const result = await service.login(loginDto, '192.168.1.1', 'Chrome');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockSessionRepository.createSession).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should throw UnauthorizedException when email not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(createMockUser());
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should propagate repository failure on findByEmail', async () => {
      mockUserRepository.findByEmail.mockRejectedValue(new Error('DB connection lost'));

      await expect(service.login(loginDto)).rejects.toThrow('DB connection lost');
    });
  });

  // -------------------------------------------------------------------------
  // validateUser()
  // -------------------------------------------------------------------------
  describe('validateUser', () => {
    it('should return sanitized user for valid credentials', async () => {
      const mockUser = createMockUser();
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser('john@example.com', 'StrongP@ss1');

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toBe('john@example.com');
    });

    it('should throw UnauthorizedException for unknown email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.validateUser('unknown@example.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(createMockUser());
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.validateUser('john@example.com', 'wrongpass')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // -------------------------------------------------------------------------
  // refreshAccessToken() — Refresh Token Rotation
  // -------------------------------------------------------------------------
  describe('refreshAccessToken', () => {
    const refreshTokenDto: RefreshTokenDto = { refreshToken: 'valid.refresh.token' };
    const mockPayload = { sub: '550e8400-e29b-41d4-a716-446655440000' };

    beforeEach(() => {
      jest.spyOn(jwt, 'verify').mockReturnValue(mockPayload as any);
    });

    it('should rotate tokens successfully', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession();

      mockSessionRepository.findSessionByTokenHash.mockResolvedValue(mockSession);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockSessionRepository.deleteSessionByTokenHash.mockResolvedValue(mockSession);
      mockSessionRepository.createSession.mockResolvedValue(createMockSession());

      const result = await service.refreshAccessToken(refreshTokenDto, '10.0.0.1', 'Firefox');

      expect(jwt.verify).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
        'refresh-secret',
      );
      expect(mockSessionRepository.findSessionByTokenHash).toHaveBeenCalled();
      expect(mockSessionRepository.deleteSessionByTokenHash).toHaveBeenCalled();
      expect(mockSessionRepository.createSession).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      await expect(service.refreshAccessToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when session not found (replay)', async () => {
      mockSessionRepository.findSessionByTokenHash.mockResolvedValue(null);

      await expect(service.refreshAccessToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when session is expired', async () => {
      const expiredSession = createMockSession({
        expiresAt: new Date(Date.now() - 1000),
      });
      mockSessionRepository.findSessionByTokenHash.mockResolvedValue(expiredSession);

      await expect(service.refreshAccessToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockSessionRepository.deleteSessionByTokenHash).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockSessionRepository.findSessionByTokenHash.mockResolvedValue(createMockSession());
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.refreshAccessToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should gracefully handle RTR delete failure and still create new session', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession();

      mockSessionRepository.findSessionByTokenHash.mockResolvedValue(mockSession);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      // delete fails
      mockSessionRepository.deleteSessionByTokenHash.mockRejectedValue(
        new Error('delete conflict'),
      );
      mockSessionRepository.createSession.mockResolvedValue(createMockSession());

      const result = await service.refreshAccessToken(refreshTokenDto);
      expect(result).toHaveProperty('accessToken');
      expect(mockSessionRepository.createSession).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // logout()
  // -------------------------------------------------------------------------
  describe('logout', () => {
    it('should delete session by hashed token and log success', async () => {
      mockSessionRepository.deleteSessionByTokenHash.mockResolvedValue(createMockSession());

      await expect(service.logout('some.refresh.token')).resolves.toBeUndefined();

      expect(mockSessionRepository.deleteSessionByTokenHash).toHaveBeenCalled();
    });

    it('should handle deletion failure gracefully (idempotent)', async () => {
      mockSessionRepository.deleteSessionByTokenHash.mockRejectedValue(
        new Error('session gone'),
      );

      await expect(service.logout('already.deleted.token')).resolves.toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // Token generation (tested indirectly through register/login)
  // -------------------------------------------------------------------------
  describe('token generation', () => {
    it('should generate access and refresh tokens with correct structure', async () => {
      const mockUser = createMockUser();
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.createUser.mockResolvedValue(mockUser);
      mockSessionRepository.createSession.mockResolvedValue(createMockSession());

      const result = await service.register({
        email: 'test@example.com',
        password: 'StrongP@ss1',
        fullName: 'Test User',
      });

      // Decode to verify structure — tokens should have header, payload, signature
      const accessDecoded = jwt.decode(result.accessToken) as any;
      expect(accessDecoded).not.toBeNull();
      expect(accessDecoded.sub).toBe(mockUser.id);
      // Must NOT contain PII
      expect(accessDecoded.email).toBeUndefined();
      expect(accessDecoded.fullName).toBeUndefined();
      expect(accessDecoded.jti).toBeDefined(); // JWT ID present

      const refreshDecoded = jwt.decode(result.refreshToken) as any;
      expect(refreshDecoded).not.toBeNull();
      expect(refreshDecoded.sub).toBe(mockUser.id);
      expect(refreshDecoded.email).toBeUndefined();
      expect(refreshDecoded.jti).toBeDefined();
    });
  });
});
