import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { IPreferenceRepository } from "./preference.repository.interface";
import { UserPreference } from "../entities/user-preference.entity";
import { UserPreferencesDto } from "../dto/user-preferences.dto";
import { handlePrismaError } from "../../common/utils/prisma-error.util";

@Injectable()
export class PreferenceRepository implements IPreferenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: number): Promise<UserPreference | null> {
    try {
      const pref = await this.prisma.preferences.findFirst({
        where: { user_id: userId },
      });
      if (!pref) return null;

      const goals = (
        await this.prisma.goals.findMany({ where: { user_id: userId } })
      ).map((g) => g.title);
      const interests = (
        await this.prisma.interests.findMany({ where: { user_id: userId } })
      )
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
        goals,
        interests: interests as string[],
      };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async upsertPreferences(
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

        const goalsList = (
          await tx.goals.findMany({ where: { user_id: userId } })
        ).map((g) => g.title);
        const interestsList = (
          await tx.interests.findMany({ where: { user_id: userId } })
        )
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
        };
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
export { IPreferenceRepository };
