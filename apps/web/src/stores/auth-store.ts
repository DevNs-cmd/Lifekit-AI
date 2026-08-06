"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/user";
import { MOCK_USER } from "@/constants/mock-data";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setIsLoading: (v: boolean) => void;
  login: (user: Partial<User> | null, accessToken?: string, refreshToken?: string) => void;
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
              ...MOCK_USER,
              ...user,
              id: rawUser.id ?? rawUser.userId ?? rawUser.user_id ?? MOCK_USER.id,
              fullName: rawUser.fullName ?? rawUser.full_name ?? MOCK_USER.fullName,
              email: rawUser.email ?? MOCK_USER.email,
            }
          : null;
        set({
          user: mergedUser,
          accessToken: accessToken ?? "mock-access-token",
          refreshToken: refreshToken ?? "mock-refresh-token",
          isAuthenticated: true,
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
