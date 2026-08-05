import { UserPreference } from "../entities/user-preference.entity";
import { UserPreferencesDto } from "../dto/user-preferences.dto";

export interface IPreferenceRepository {
  findByUserId(userId: number): Promise<UserPreference | null>;
  upsertPreferences(
    userId: number,
    data: UserPreferencesDto,
  ): Promise<UserPreference>;
}
