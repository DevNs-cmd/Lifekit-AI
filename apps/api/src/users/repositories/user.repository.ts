import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IUserRepository } from './user.repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserPreferencesDto } from '../dto/user-preferences.dto';
import { User } from '../entities/user.entity';
import { UserPreference } from '../entities/user-preference.entity';
import { handlePrismaError } from '../../common/utils/prisma-error.util';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: CreateUserDto & { passwordHash: string }): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: {
          email: data.email,
          fullName: data.fullName,
          passwordHash: data.passwordHash,
          preference: data.preferences
            ? {
                create: {
                  theme: data.preferences.theme ?? 'light',
                  notificationsEnabled: data.preferences.notificationsEnabled ?? true,
                  goals: data.preferences.goals ?? [],
                  interests: data.preferences.interests ?? [],
                },
              }
            : {
                create: {
                  theme: 'light',
                  notificationsEnabled: true,
                  goals: [],
                  interests: [],
                },
              },
        },
        include: {
          preference: true,
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
        include: {
          preference: true,
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { email },
        include: {
          preference: true,
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updateUser(id: string, data: UpdateUserDto & { passwordHash?: string }): Promise<User> {
    try {
      const { preferences, ...rest } = data;
      
      return await this.prisma.$transaction(async (tx) => {
        // If there are preferences to update, do it alongside user updates
        if (preferences) {
          await tx.userPreference.upsert({
            where: { userId: id },
            update: {
              theme: preferences.theme,
              notificationsEnabled: preferences.notificationsEnabled,
              goals: preferences.goals,
              interests: preferences.interests,
            },
            create: {
              userId: id,
              theme: preferences.theme ?? 'light',
              notificationsEnabled: preferences.notificationsEnabled ?? true,
              goals: preferences.goals ?? [],
              interests: preferences.interests ?? [],
            },
          });
        }

        return await tx.user.update({
          where: { id },
          data: {
            email: rest.email,
            fullName: rest.fullName,
            passwordHash: rest.passwordHash,
          },
          include: {
            preference: true,
          },
        });
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async deleteUser(id: string): Promise<User> {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updatePreferences(userId: string, data: UserPreferencesDto): Promise<UserPreference> {
    try {
      return await this.prisma.userPreference.upsert({
        where: { userId },
        update: {
          theme: data.theme,
          notificationsEnabled: data.notificationsEnabled,
          goals: data.goals,
          interests: data.interests,
        },
        create: {
          userId,
          theme: data.theme ?? 'light',
          notificationsEnabled: data.notificationsEnabled ?? true,
          goals: data.goals ?? [],
          interests: data.interests ?? [],
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
