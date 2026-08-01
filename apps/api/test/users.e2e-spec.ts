// Define environment variables BEFORE imports so that ConfigModule validation does not crash during import phase
process.env.DATABASE_URL = 'postgresql://localhost:5432/test-db';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_SECRET = 'test-jwt-secret-key-that-is-at-least-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-secret-key-that-is-at-least-32-characters-long';
process.env.AI_SERVICE_URL = 'http://localhost:8000';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserRepository } from '../src/users/repositories/user.repository';
import { SessionRepository } from '../src/auth/repositories/session.repository';
import { PrismaService } from '../src/prisma/prisma.service';
import { TransformInterceptor } from '../src/common/interceptors';
import * as jwt from 'jsonwebtoken';
import { User } from '../src/users/entities/user.entity';
import { hashPassword } from '../src/auth/utils';

describe('Users API (e2e)', () => {
  let app: INestApplication;

  const mockUserRepo = {
    findById: jest.fn(),
    updateUser: jest.fn(),
    updatePreferences: jest.fn(),
  };

  const mockSessionRepo = {
    findSessionsByUser: jest.fn(),
    deleteSessionByTokenHash: jest.fn(),
  };

  const mockPrismaService = {
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
  };

  const secret = 'test-jwt-secret-key-that-is-at-least-32-characters-long';

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
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
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

  const testUserId = 'user-123-abc';
  const token = jwt.sign({ sub: testUserId }, secret, { expiresIn: '1h' });

  function createMockDbUser(overrides: Partial<User> = {}): User {
    return {
      id: testUserId,
      email: 'john@example.com',
      fullName: 'John Doe',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwx',
      phone: '+12025550143',
      dateOfBirth: '1990-01-01',
      profession: 'Software Engineer',
      profilePhoto: 'https://example.com/photo.jpg',
      preference: {
        id: 'pref-123',
        userId: testUserId,
        theme: 'dark',
        notificationsEnabled: true,
        goals: ['Code NestJS'],
        interests: ['AI'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      createdAt: new Date('2026-07-28T12:00:00Z'),
      updatedAt: new Date('2026-07-28T12:00:00Z'),
      ...overrides,
    } as User;
  }

  describe('GET /api/users/me', () => {
    it('should return 401 when unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/api/users/me')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 200 and user profile', async () => {
      const mockUser = createMockDbUser();
      mockUserRepo.findById.mockResolvedValue(mockUser);

      const res = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testUserId);
      expect(res.body.data.email).toBe(mockUser.email);
      expect(res.body.data.fullName).toBe(mockUser.fullName);
      expect(res.body.data).not.toHaveProperty('passwordHash');
      expect(res.body.data.preferences).toEqual({
        theme: 'dark',
        notificationsEnabled: true,
        goals: ['Code NestJS'],
        interests: ['AI'],
      });
    });

    it('should return 401 if user no longer exists (invalidated by strategy)', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /api/users/me', () => {
    it('should update and return the user profile', async () => {
      const mockUser = createMockDbUser();
      const updatedUser = createMockDbUser({
        fullName: 'Jane Doe',
        phone: '+12025550143',
      });
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.updateUser.mockResolvedValue(updatedUser);

      const res = await request(app.getHttpServer())
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          fullName: 'Jane Doe',
          phone: '+12025550143',
        })
        .expect(HttpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.fullName).toBe('Jane Doe');
      expect(res.body.data.phone).toBe('+12025550143');
      expect(mockUserRepo.updateUser).toHaveBeenCalledWith(testUserId, {
        fullName: 'Jane Doe',
        phone: '+12025550143',
      });
    });

    it('should reject invalid data types (e.g. invalid phone number)', async () => {
      mockUserRepo.findById.mockResolvedValue(createMockDbUser());

      await request(app.getHttpServer())
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          phone: 'invalid-phone',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject trying to update read-only fields (e.g. email)', async () => {
      mockUserRepo.findById.mockResolvedValue(createMockDbUser());

      await request(app.getHttpServer())
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'newemail@example.com',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('PATCH /api/users/preferences', () => {
    it('should update and return preferences', async () => {
      const mockUser = createMockDbUser();
      const updatedPreferences = {
        id: 'pref-123',
        userId: testUserId,
        theme: 'light',
        notificationsEnabled: false,
        goals: ['Sleep well'],
        interests: ['Health'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.updatePreferences.mockResolvedValue(updatedPreferences);

      const res = await request(app.getHttpServer())
        .patch('/api/users/preferences')
        .set('Authorization', `Bearer ${token}`)
        .send({
          theme: 'light',
          notificationsEnabled: false,
          goals: ['Sleep well'],
          interests: ['Health'],
        })
        .expect(HttpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.theme).toBe('light');
      expect(res.body.data.notificationsEnabled).toBe(false);
      expect(mockUserRepo.updatePreferences).toHaveBeenCalledWith(testUserId, {
        theme: 'light',
        notificationsEnabled: false,
        goals: ['Sleep well'],
        interests: ['Health'],
      });
    });

    it('should reject non-object body', async () => {
      mockUserRepo.findById.mockResolvedValue(createMockDbUser());

      await request(app.getHttpServer())
        .patch('/api/users/preferences')
        .set('Authorization', `Bearer ${token}`)
        .send('"string-payload"')
        .set('Content-Type', 'application/json')
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('PATCH /api/users/change-password', () => {
    let rawPassword = 'CurrentPassword123';
    let hashedCurrent = '';

    beforeAll(async () => {
      hashedCurrent = await hashPassword(rawPassword);
    });

    it('should change password and invalidate refresh sessions', async () => {
      const mockUser = createMockDbUser({ passwordHash: hashedCurrent });
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.updateUser.mockResolvedValue(mockUser);

      mockSessionRepo.findSessionsByUser.mockResolvedValue([
        { token: 'token-1' },
      ]);
      mockSessionRepo.deleteSessionByTokenHash.mockResolvedValue({});

      const res = await request(app.getHttpServer())
        .patch('/api/users/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: rawPassword,
          newPassword: 'NewPassword123!',
        })
        .expect(HttpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(mockSessionRepo.deleteSessionByTokenHash).toHaveBeenCalledWith('token-1');
    });

    it('should return 401 for incorrect current password', async () => {
      const mockUser = createMockDbUser({ passwordHash: hashedCurrent });
      mockUserRepo.findById.mockResolvedValue(mockUser);

      await request(app.getHttpServer())
        .patch('/api/users/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'WrongPassword',
          newPassword: 'NewPassword123!',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 400 if new password is too short', async () => {
      mockUserRepo.findById.mockResolvedValue(createMockDbUser());

      await request(app.getHttpServer())
        .patch('/api/users/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: rawPassword,
          newPassword: 'short',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});
