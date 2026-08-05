import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { IUserRepository } from "./user.repository.interface";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { UserPreferencesDto } from "../dto/user-preferences.dto";
import { User } from "../entities/user.entity";
import { UserPreference } from "../entities/user-preference.entity";
import { handlePrismaError } from "../../common/utils/prisma-error.util";

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(
    data: CreateUserDto & { passwordHash: string },
  ): Promise<User> {
    try {
      const createdPrismaUser = await this.prisma.$transaction(async (tx) => {
        const u = await tx.users.create({
          data: {
            email: data.email,
            full_name: data.fullName,
            password_hash: data.passwordHash,
          },
        });

        // Create default preferences
        const theme = data.preferences?.theme ?? "light";
        const notification_enabled =
          data.preferences?.notificationsEnabled ?? true;
        await tx.preferences.create({
          data: {
            user_id: u.user_id,
            theme,
            notification_enabled,
          },
        });

        // Create interests if any
        if (
          data.preferences?.interests &&
          data.preferences.interests.length > 0
        ) {
          await tx.interests.createMany({
            data: data.preferences.interests.map((name) => ({
              user_id: u.user_id,
              interest_name: name,
            })),
          });
        }

        // Create goals if any
        if (data.preferences?.goals && data.preferences.goals.length > 0) {
          await tx.goals.createMany({
            data: data.preferences.goals.map((title) => ({
              user_id: u.user_id,
              title,
              status: "In Progress",
              progress: 0,
            })),
          });
        }

        return tx.users.findUnique({
          where: { user_id: u.user_id },
          include: {
            user_preferences: true,
            interests: true,
            goals: true,
          },
        });
      });

      return mapPrismaUserToEntity(createdPrismaUser)!;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findById(id: number): Promise<User | null> {
    try {
      const u = await this.prisma.users.findUnique({
        where: { user_id: id },
        include: {
          user_preferences: true,
          interests: true,
          goals: true,
        },
      });
      return mapPrismaUserToEntity(u);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const u = await this.prisma.users.findUnique({
        where: { email },
        include: {
          user_preferences: true,
          interests: true,
          goals: true,
        },
      });
      return mapPrismaUserToEntity(u);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updateUser(
    id: number,
    data: UpdateUserDto & { passwordHash?: string },
  ): Promise<User> {
    try {
      const { preferences, ...rest } = data;

      const updated = await this.prisma.$transaction(async (tx) => {
        // If there are preferences to update, do it alongside user updates
        if (preferences) {
          const existingPref = await tx.preferences.findFirst({
            where: { user_id: id },
          });

          if (existingPref) {
            await tx.preferences.update({
              where: { preference_id: existingPref.preference_id },
              data: {
                theme: preferences.theme,
                notification_enabled: preferences.notificationsEnabled,
              },
            });
          } else {
            await tx.preferences.create({
              data: {
                user_id: id,
                theme: preferences.theme ?? "light",
                notification_enabled: preferences.notificationsEnabled ?? true,
              },
            });
          }

          if (preferences.interests !== undefined) {
            // Delete and recreate interests
            await tx.interests.deleteMany({
              where: { user_id: id },
            });
            if (preferences.interests.length > 0) {
              await tx.interests.createMany({
                data: preferences.interests.map((name) => ({
                  user_id: id,
                  interest_name: name,
                })),
              });
            }
          }

          if (preferences.goals !== undefined) {
            // Delete and recreate goals
            await tx.goals.deleteMany({
              where: { user_id: id },
            });
            if (preferences.goals.length > 0) {
              await tx.goals.createMany({
                data: preferences.goals.map((title) => ({
                  user_id: id,
                  title,
                  status: "In Progress",
                  progress: 0,
                })),
              });
            }
          }
        }

        const updatePayload: any = {};
        if (rest.email !== undefined) updatePayload.email = rest.email;
        if (rest.fullName !== undefined)
          updatePayload.full_name = rest.fullName;
        if (rest.passwordHash !== undefined)
          updatePayload.password_hash = rest.passwordHash;
        if (rest.phone !== undefined) updatePayload.phone = rest.phone;
        if (rest.profession !== undefined)
          updatePayload.profession = rest.profession;
        if (rest.profilePhoto !== undefined)
          updatePayload.profile_photo = rest.profilePhoto;
        if (rest.dateOfBirth !== undefined)
          updatePayload.date_of_birth = rest.dateOfBirth
            ? new Date(rest.dateOfBirth)
            : null;

        await tx.users.update({
          where: { user_id: id },
          data: updatePayload,
        });

        return tx.users.findUnique({
          where: { user_id: id },
          include: {
            user_preferences: true,
            interests: true,
            goals: true,
          },
        });
      });

      return mapPrismaUserToEntity(updated)!;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async deleteUser(id: number): Promise<User> {
    try {
      const u = await this.prisma.users.findUnique({
        where: { user_id: id },
        include: {
          user_preferences: true,
          interests: true,
          goals: true,
        },
      });
      if (u) {
        await this.prisma.users.delete({
          where: { user_id: id },
        });
      }
      return mapPrismaUserToEntity(u)!;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updatePreferences(
    userId: number,
    data: UserPreferencesDto,
  ): Promise<UserPreference> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const existingPref = await tx.preferences.findFirst({
          where: { user_id: userId },
        });

        let pref;
        if (existingPref) {
          pref = await tx.preferences.update({
            where: { preference_id: existingPref.preference_id },
            data: {
              theme: data.theme,
              notification_enabled: data.notificationsEnabled,
            },
          });
        } else {
          pref = await tx.preferences.create({
            data: {
              user_id: userId,
              theme: data.theme ?? "light",
              notification_enabled: data.notificationsEnabled ?? true,
            },
          });
        }

        if (data.interests !== undefined) {
          await tx.interests.deleteMany({ where: { user_id: userId } });
          if (data.interests.length > 0) {
            await tx.interests.createMany({
              data: data.interests.map((name) => ({
                user_id: userId,
                interest_name: name,
              })),
            });
          }
        }

        if (data.goals !== undefined) {
          await tx.goals.deleteMany({ where: { user_id: userId } });
          if (data.goals.length > 0) {
            await tx.goals.createMany({
              data: data.goals.map((title) => ({
                user_id: userId,
                title,
                status: "In Progress",
                progress: 0,
              })),
            });
          }
        }

        const goalsList =
          data.goals ??
          (await tx.goals.findMany({ where: { user_id: userId } })).map(
            (g) => g.title,
          );
        const interestsList =
          data.interests ??
          (await tx.interests.findMany({ where: { user_id: userId } }))
            .map((i) => i.interest_name)
            .filter(Boolean);

        return {
          preference_id: pref.preference_id,
          user_id: pref.user_id,
          theme: pref.theme,
          language: pref.language,
          notification_enabled: pref.notification_enabled ?? true,
          reminder_time: pref.reminder_time,
          timezone: pref.timezone,
          goals: goalsList,
          interests: interestsList as string[],
        } as UserPreference;
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

function mapPrismaUserToEntity(prismaUser: any): User | null {
  if (!prismaUser) return null;
  const rawPref = prismaUser.user_preferences?.[0];
  const preference: UserPreference | null = rawPref
    ? {
        preference_id: rawPref.preference_id,
        user_id: rawPref.user_id,
        theme: rawPref.theme,
        language: rawPref.language,
        notification_enabled: rawPref.notification_enabled ?? true,
        reminder_time: rawPref.reminder_time,
        timezone: rawPref.timezone,
        goals: prismaUser.goals?.map((g: any) => g.title) ?? [],
        interests:
          prismaUser.interests
            ?.map((i: any) => i.interest_name)
            .filter(Boolean) ?? [],
      }
    : null;

  return {
    user_id: prismaUser.user_id,
    email: prismaUser.email,
    full_name: prismaUser.full_name,
    password_hash: prismaUser.password_hash,
    phone: prismaUser.phone,
    date_of_birth: prismaUser.date_of_birth,
    profession: prismaUser.profession,
    profile_photo: prismaUser.profile_photo,
    created_at: prismaUser.created_at,
    updated_at: prismaUser.updated_at,
    preference,
  } as unknown as User;
}
