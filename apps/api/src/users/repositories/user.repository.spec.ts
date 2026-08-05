import { UserRepository } from "./user.repository";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateUserDto } from "../dto/update-user.dto";

describe("UserRepository", () => {
  let repository: UserRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      $transaction: jest.fn(),
    };
    repository = new UserRepository(mockPrisma as unknown as PrismaService);
  });

  it("should update existing preferences when they exist", async () => {
    const userId = 1;
    const dto: UpdateUserDto = {
      preferences: {
        theme: "dark",
        notificationsEnabled: false,
      },
    };

    mockPrisma.$transaction.mockImplementation(async (cb: any) => {
      const tx = {
        preferences: {
          findFirst: jest
            .fn()
            .mockResolvedValue({ preference_id: 10, user_id: userId }),
          update: jest.fn().mockResolvedValue({ preference_id: 10 }),
          create: jest.fn(),
        },
        interests: { deleteMany: jest.fn(), createMany: jest.fn() },
        goals: { deleteMany: jest.fn(), createMany: jest.fn() },
        users: {
          update: jest.fn(),
          findUnique: jest.fn().mockResolvedValue({
            user_id: userId,
            user_preferences: [{ preference_id: 10 }],
          }),
        },
      };
      const res = await cb(tx);
      expect(tx.preferences.update).toHaveBeenCalledWith({
        where: { preference_id: 10 },
        data: { theme: "dark", notification_enabled: false },
      });
      expect(tx.preferences.create).not.toHaveBeenCalled();
      return res;
    });

    await repository.updateUser(userId, dto);
  });

  it("should create preferences for first-time users when they do not exist", async () => {
    const userId = 1;
    const dto: UpdateUserDto = {
      preferences: {
        theme: "dark",
        notificationsEnabled: false,
      },
    };

    mockPrisma.$transaction.mockImplementation(async (cb: any) => {
      const tx = {
        preferences: {
          findFirst: jest.fn().mockResolvedValue(null),
          update: jest.fn(),
          create: jest.fn().mockResolvedValue({ preference_id: 11 }),
        },
        interests: { deleteMany: jest.fn(), createMany: jest.fn() },
        goals: { deleteMany: jest.fn(), createMany: jest.fn() },
        users: {
          update: jest.fn(),
          findUnique: jest.fn().mockResolvedValue({
            user_id: userId,
            user_preferences: [{ preference_id: 11 }],
          }),
        },
      };
      const res = await cb(tx);
      expect(tx.preferences.create).toHaveBeenCalledWith({
        data: { user_id: userId, theme: "dark", notification_enabled: false },
      });
      expect(tx.preferences.update).not.toHaveBeenCalled();
      return res;
    });

    await repository.updateUser(userId, dto);
  });

  it("should roll back transaction and bubble up errors", async () => {
    const userId = 1;
    const dto: UpdateUserDto = {
      preferences: {
        theme: "dark",
      },
    };

    mockPrisma.$transaction.mockImplementation(async (cb: any) => {
      const tx = {
        preferences: {
          findFirst: jest.fn().mockRejectedValue(new Error("Database error")),
        },
      };
      await cb(tx);
    });

    await expect(repository.updateUser(userId, dto)).rejects.toThrow();
  });
});
