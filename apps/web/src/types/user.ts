import type { Category, ID } from "./common";

export type UserType = "professional" | "student" | "founder" | "family";

export type LearningStyle = "visual" | "reading" | "hands-on" | "collaborative";

export interface UserPreferences {
  learningStyle?: LearningStyle;
  weeklyAvailableHours?: number;
  budgetRange?: { min: number; max: number; currency: string };
  notificationPreference: "all" | "important" | "none";
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  dateFormat: string;
  aiResponseStyle: "concise" | "detailed" | "balanced";
  recommendationFrequency: "daily" | "weekly" | "monthly";
  planningDepth: "basic" | "standard" | "deep";
  memoryEnabled: boolean;
}

export interface UserSkill {
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface UserCareerInfo {
  currentRole?: string;
  company?: string;
  industry?: string;
  yearsOfExperience?: number;
  education?: string;
}

export interface User {
  id: ID;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  userType: UserType;
  location?: string;
  bio?: string;
  focusAreas: Category[];
  skills: UserSkill[];
  interests: string[];
  careerInfo?: UserCareerInfo;
  preferences: UserPreferences;
  personalGoals: string[];
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  role: "user" | "provider";
  subscriptionPlan: "free" | "plus" | "pro" | "enterprise";
  onboardingCompleted: boolean;
}

export interface Session {
  id: ID;
  userId: ID;
  device: string;
  browser: string;
  location?: string;
  ipAddress: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}
