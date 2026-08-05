import { User } from "../../users/entities/user.entity";

export interface AuthResult {
  user: Omit<User, "password_hash">;
  accessToken: string;
  refreshToken: string;
}
