import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { UserRepository } from "../repositories/user.repository";
import { SessionRepository } from "../../auth/repositories/session.repository";
import { UsersService } from "./users.service";
import { User } from "../entities/user.entity";
import { hashPassword } from "../../auth/utils";

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
  deleteSessionsByUser: jest.fn(),
};

function createMockUser(overrides: Partial<User> = {}): User {
  const user = {
    user_id: 123,
    email: "john@example.com",
    full_name: "John Doe",
    password_hash: "$2b$10$abcdefghijklmnopqrstuvwx", // hashed password stub
    phone: "+1234567890",
    date_of_birth: "1990-01-01",
    profession: "Software Engineer",
    profile_photo: "https://example.com/photo.jpg",
    preference: {
      preference_id: 456,
      user_id: 123,
      theme: "dark",
      notification_enabled: true,
      goals: ["Code NestJS"],
      interests: ["AI"],
    } as any,
    created_at: new Date("2026-07-28T12:00:00Z"),
    updated_at: new Date("2026-07-28T12:00:00Z"),
    ...overrides,
  } as any;

  // Add compatibility getters
  Object.defineProperty(user, "id", { get: () => user.user_id });
  Object.defineProperty(user, "fullName", { get: () => user.full_name });
  Object.defineProperty(user, "createdAt", { get: () => user.created_at });
  Object.defineProperty(user, "updatedAt", { get: () => user.updated_at });

  return user;
}

describe("UsersService", () => {
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

  describe("getCurrentUser", () => {
    it("should retrieve and map current user profile successfully", async () => {
      const user = createMockUser();
      mockUserRepository.findById.mockResolvedValue(user);

      const result = await service.getCurrentUser(user.user_id);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(user.user_id);
      expect(result).toEqual({
        id: user.user_id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        profession: user.profession,
        profilePhoto: user.profile_photo,
        preferences: {
          theme: "dark",
          notificationsEnabled: true,
          goals: ["Code NestJS"],
          interests: ["AI"],
        },
        createdAt: user.created_at,
        subscriptionPlan: "free",
      });
    });

    it("should throw NotFoundException if user is not found", async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.getCurrentUser(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("updateProfile", () => {
    it("should update user profile and return mapped updated profile", async () => {
      const user = createMockUser();
      const updatedUser = createMockUser({
        full_name: "Jane Doe",
        phone: "+1987654321",
      });
      const updateDto = { fullName: "Jane Doe", phone: "+1987654321" };

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.updateUser.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(user.user_id, updateDto);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(user.user_id);
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(
        user.user_id,
        updateDto,
      );
      expect(result.fullName).toBe("Jane Doe");
      expect(result.phone).toBe("+1987654321");
    });

    it("should throw NotFoundException if user is not found", async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateProfile(999, { fullName: "Jane Doe" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("updatePreferences", () => {
    it("should replace user preferences object successfully", async () => {
      const user = createMockUser();
      const updatedPreference = {
        preference_id: 456,
        user_id: 123,
        theme: "light",
        notification_enabled: false,
        goals: ["Exercise"],
        interests: ["Sports"],
      };
      const prefDto = {
        theme: "light",
        notificationsEnabled: false,
        goals: ["Exercise"],
        interests: ["Sports"],
      };

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.updatePreferences.mockResolvedValue(updatedPreference);

      const result = await service.updatePreferences(user.user_id, prefDto);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(user.user_id);
      expect(mockUserRepository.updatePreferences).toHaveBeenCalledWith(
        user.user_id,
        prefDto,
      );
      expect(result).toEqual({
        theme: "light",
        notificationsEnabled: false,
        goals: ["Exercise"],
        interests: ["Sports"],
      });
    });

    it("should throw NotFoundException if user is not found", async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        service.updatePreferences(999, { theme: "light" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("changePassword", () => {
    const rawPassword = "CurrentPassword123";
    let hashedCurrent = "";

    beforeAll(async () => {
      hashedCurrent = await hashPassword(rawPassword);
    });

    it("should successfully change password and invalidate all sessions", async () => {
      const user = createMockUser({ password_hash: hashedCurrent });
      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.updateUser.mockResolvedValue(user);

      mockSessionRepository.deleteSessionsByUser.mockResolvedValue(undefined);

      const result = await service.changePassword(user.user_id, {
        currentPassword: rawPassword,
        newPassword: "NewPassword123!",
      });

      expect(mockUserRepository.findById).toHaveBeenCalledWith(user.user_id);
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(user.user_id, {
        passwordHash: expect.any(String),
      });
      expect(mockSessionRepository.deleteSessionsByUser).toHaveBeenCalledWith(
        user.user_id,
      );
      expect(result).toEqual({
        success: true,
        message: "Password changed successfully",
      });
    });

    it("should throw UnauthorizedException if current password does not match", async () => {
      const user = createMockUser({ password_hash: hashedCurrent });
      mockUserRepository.findById.mockResolvedValue(user);

      await expect(
        service.changePassword(user.user_id, {
          currentPassword: "WrongPassword",
          newPassword: "NewPassword123!",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw NotFoundException if user is not found", async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        service.changePassword(999, {
          currentPassword: "password123",
          newPassword: "NewPassword123!",
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("Repository failures", () => {
    it("should propagate repository errors from findById", async () => {
      const error = new Error("Database connection failed");
      mockUserRepository.findById.mockRejectedValue(error);

      await expect(service.getCurrentUser(1)).rejects.toThrow(
        "Database connection failed",
      );
    });
  });
});
