import { post, get } from "./client";
import type { SignInFormData, SignUpFormData } from "../validation/schemas";
import type { User } from "@/types/user";

export interface AuthResult {
  user: {
    id: string;
    email: string;
    fullName: string;
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
  refreshToken: string;
}

export async function login(data: SignInFormData): Promise<AuthResult> {
  return post<AuthResult>("/auth/login", data);
}

export async function register(data: SignUpFormData): Promise<AuthResult> {
  // Extract only variables corresponding to RegisterDto (email, password, fullName)
  const payload = {
    email: data.email,
    password: data.password,
    fullName: data.fullName,
  };
  return post<AuthResult>("/auth/register", payload);
}

export async function logout(refreshToken: string): Promise<void> {
  return post<void>("/auth/logout", { refreshToken });
}

export async function refresh(refreshToken: string): Promise<AuthResult> {
  return post<AuthResult>("/auth/refresh", { refreshToken });
}

export async function getProfile(): Promise<Partial<User>> {
  return get<Partial<User>>("/auth/profile");
}
