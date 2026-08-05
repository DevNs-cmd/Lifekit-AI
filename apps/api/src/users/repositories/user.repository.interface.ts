import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { UserPreferencesDto } from "../dto/user-preferences.dto";
import { User } from "../entities/user.entity";
import { UserPreference } from "../entities/user-preference.entity";

export interface IUserRepository {
  createUser(data: CreateUserDto & { passwordHash: string }): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  updateUser(
    id: number,
    data: UpdateUserDto & { passwordHash?: string },
  ): Promise<User>;
  deleteUser(id: number): Promise<User>;
  updatePreferences(
    userId: number,
    data: UserPreferencesDto,
  ): Promise<UserPreference>;
}
