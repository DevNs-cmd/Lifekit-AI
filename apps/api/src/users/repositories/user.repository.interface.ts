import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserPreferencesDto } from '../dto/user-preferences.dto';
import { User } from '../entities/user.entity';
import { UserPreference } from '../entities/user-preference.entity';

export interface IUserRepository {
  createUser(data: CreateUserDto & { passwordHash: string }): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  updateUser(id: string, data: UpdateUserDto & { passwordHash?: string }): Promise<User>;
  deleteUser(id: string): Promise<User>;
  updatePreferences(userId: string, data: UserPreferencesDto): Promise<UserPreference>;
}
