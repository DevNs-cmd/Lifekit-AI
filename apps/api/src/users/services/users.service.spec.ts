import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../repositories/user.repository';
import { SessionRepository } from '../../auth/repositories/session.repository';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { UserPreference } from '../entities/user-preference.entity';
import { hashPassword } from '../../auth/utils';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockUserRepository = {
  findById: jest.fn(),
  updateUser: jest.fn(),
  updatePreferences: jest.fn(),
};

const mockSessionRepository = {
  findSessionsByUser: jest.fn(),
  deleteSessionByTokenHash: jest.fn(),
};

function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-id-123',
    email: 'john@example.com',
    fullName: 'John Doe',
    passwordHash: '$2b$10$abcdefghijklmnopqrstuvwx', // hashed password stub
    phone: '+1234567890',
    dateOfBirth: '1990-01-01',
    profession: 'Software Engineer',
    profilePhoto: 'https://example.com/photo.jpg',
    preference: {
      id: 'pref-id-123',
      userId: 'user-id-123',
      theme: 'dark',
      notificationsEnabled: true,
      goals: ['Code NestJS'],
      interests: ['AI'],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as UserPreference,
    createdAt: new Date('2026-07-28T12:00:00Z'),
    updatedAt: new Date('2026-07-28T12:00:00Z'),
    ...overrides,
  } as User;
}

describe('UsersService', () => {
  let service: UsersService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: SessionRepository, useValue: mockSessionRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should retrieve and map current user profile successfully', async () => {
      const user = createMockUser();
      mockUserRepository.findById.mockResolvedValue(user);

      const result = await service.getCurrentUser(user.id);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(user.id);
      expect(result).toEqual({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profession: user.profession,
        profilePhoto: user.profilePhoto,
        preferences: {
          theme: 'dark',
          notificationsEnabled: true,
          goals: ['Code NestJS'],
          interests: ['AI'],
        },
        createdAt: user.createdAt,
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.getCurrentUser('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user profile and return mapped updated profile', async () => {
      const user = createMockUser();
      const updatedUser = createMockUser({
        fullName: 'Jane Doe',
        phone: '+1987654321',
      });
      const updateDto = { fullName: 'Jane Doe', phone: '+1987654321' };

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.updateUser.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(user.id, updateDto);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(user.id);
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(user.id, updateDto);
      expect(result.fullName).toBe('Jane Doe');
      expect(result.phone).toBe('+1987654321');
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateProfile('nonexistent', { fullName: 'Jane Doe' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePreferences', () => {
    it('should replace user preferences object successfully', async () => {
      const user = createMockUser();
      const updatedPreference = {
        id: 'pref-id-123',
        userId: 'user-id-123',
        theme: 'light',
        notificationsEnabled: false,
        goals: ['Exercise'],
        interests: ['Sports'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const prefDto = {
        theme: 'light',
        notificationsEnabled: false,
        goals: ['Exercise'],
        interests: ['Sports'],
      };

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.updatePreferences.mockResolvedValue(updatedPreference);

      const result = await service.updatePreferences(user.id, prefDto);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(user.id);
      expect(mockUserRepository.updatePreferences).toHaveBeenCalledWith(user.id, prefDto);
      expect(result).toEqual({
        theme: 'light',
        notificationsEnabled: false,
        goals: ['Exercise'],
        interests: ['Sports'],
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        service.updatePreferences('nonexistent', { theme: 'light' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('changePassword', () => {
    let rawPassword = 'CurrentPassword123';
    let hashedCurrent = '';

    beforeAll(async () => {
      hashedCurrent = await hashPassword(rawPassword);
    });

    it('should successfully change password and invalidate all sessions', async () => {
      const user = createMockUser({ passwordHash: hashedCurrent });
      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.updateUser.mockResolvedValue(user);

      const mockSessions = [
        { token: 'token-hash-1' },
        { token: 'token-hash-2' },
      ];
      mockSessionRepository.findSessionsByUser.mockResolvedValue(mockSessions);
      mockSessionRepository.deleteSessionByTokenHash.mockResolvedValue({});

      const result = await service.changePassword(user.id, {
        currentPassword: rawPassword,
        newPassword: 'NewPassword123!',
      });

      expect(mockUserRepository.findById).toHaveBeenCalledWith(user.id);
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(user.id, {
        passwordHash: expect.any(String),
      });
      expect(mockSessionRepository.findSessionsByUser).toHaveBeenCalledWith(user.id);
      expect(mockSessionRepository.deleteSessionByTokenHash).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        success: true,
        message: 'Password changed successfully',
      });
    });

    it('should throw UnauthorizedException if current password does not match', async () => {
      const user = createMockUser({ passwordHash: hashedCurrent });
      mockUserRepository.findById.mockResolvedValue(user);

      await expect(
        service.changePassword(user.id, {
          currentPassword: 'WrongPassword',
          newPassword: 'NewPassword123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        service.changePassword('nonexistent', {
          currentPassword: 'password123',
          newPassword: 'NewPassword123!',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Repository failures', () => {
    it('should propagate repository errors from findById', async () => {
      const error = new Error('Database connection failed');
      mockUserRepository.findById.mockRejectedValue(error);

      await expect(service.getCurrentUser('user-id-1')).rejects.toThrow(
        'Database connection failed',
      );
    });
  });
});
