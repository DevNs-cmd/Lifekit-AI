import { get, patch } from "./client";

export interface UpdateProfileInput {
  fullName?: string;
  phone?: string;
  profession?: string;
  profilePhoto?: string;
  dateOfBirth?: string;
}

export interface UpdatePreferencesInput {
  theme?: "light" | "dark" | "system";
  notificationsEnabled?: boolean;
  goals?: string[];
  interests?: string[];
}

export interface ChangePasswordInput {
  currentPassword?: string;
  newPassword?: string;
}

export interface UserProfileResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  profession: string | null;
  profilePhoto: string | null;
  preferences: {
    theme: string;
    notificationsEnabled: boolean;
    goals: string[];
    interests: string[];
  } | null;
  createdAt: string;
}

export async function getMe(): Promise<UserProfileResponse> {
  return get<UserProfileResponse>("/users/me");
}

export async function updateMe(
  data: UpdateProfileInput
): Promise<UserProfileResponse> {
  return patch<UserProfileResponse>("/users/me", data);
}

export async function updatePreferences(
  data: UpdatePreferencesInput
): Promise<unknown> {
  return patch<unknown>("/users/preferences", data);
}

export async function changePassword(
  data: ChangePasswordInput
): Promise<{ success: boolean; message: string }> {
  return patch<{ success: boolean; message: string }>(
    "/users/change-password",
    data
  );
}
