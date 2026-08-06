"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/user";

const DEFAULT_USER_VALUES = {
  phone: "",
  avatarUrl: undefined,
  userType: "professional" as const,
  location: "",
  bio: "",
  focusAreas: [],
  skills: [],
  interests: [],
  careerInfo: {
    currentRole: "",
    company: "",
    industry: "",
    yearsOfExperience: 0,
    education: "",
  },
  preferences: {
    notificationPreference: "important" as const,
    theme: "light" as const,
    language: "en",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    aiResponseStyle: "balanced" as const,
    recommendationFrequency: "weekly" as const,
    planningDepth: "standard" as const,
    memoryEnabled: true,
  },
  personalGoals: [],
  isEmailVerified: true,
  isTwoFactorEnabled: false,
  role: "user" as const,
  subscriptionPlan: "free" as const,
  onboardingCompleted: true,
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setIsLoading: (v: boolean) => void;
  login: (user: Partial<User> | null, accessToken?: string | null, refreshToken?: string | null) => void;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) =>
        set({ user, isAuthenticated: user !== null }),

      setIsLoading: (v) => set({ isLoading: v }),

      login: (user, accessToken, refreshToken) => {
        const rawUser = user as { id?: string; userId?: string; user_id?: string; fullName?: string; full_name?: string; email?: string };
        const mergedUser = user
          ? {
              ...DEFAULT_USER_VALUES,
              ...user,
              id: String(rawUser.id ?? rawUser.userId ?? rawUser.user_id ?? ""),
              fullName: rawUser.fullName ?? rawUser.full_name ?? "",
              email: rawUser.email ?? "",
            } as User
          : null;
        set({
          user: mergedUser,
          accessToken: accessToken ?? null,
          refreshToken: refreshToken ?? null,
          isAuthenticated: !!accessToken,
          isLoading: false,
        });
      },

      logout: () => {
        const rToken = useAuthStore.getState().refreshToken;
        if (rToken && rToken !== "mock-refresh-token") {
          const API_BASE_URL =
            process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
          fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken: rToken }),
          }).catch(() => {});
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      updateUser: (patch) =>
        set((s) => ({
          user: s.user ? { ...s.user, ...patch } : null,
        })),
    }),
    {
      name: "lifekit-auth",
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
