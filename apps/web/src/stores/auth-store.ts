"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/user";
import { MOCK_USER } from "@/constants/mock-data";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setIsLoading: (v: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Pre-populated with mock user so the app works without a real backend
      user: MOCK_USER,
      isAuthenticated: true,
      isLoading: false,

      setUser: (user) =>
        set({ user, isAuthenticated: user !== null }),

      setIsLoading: (v) => set({ isLoading: v }),

      login: (user) =>
        set({ user, isAuthenticated: true, isLoading: false }),

      logout: () =>
        set({ user: null, isAuthenticated: false }),

      updateUser: (patch) =>
        set((s) => ({
          user: s.user ? { ...s.user, ...patch } : null,
        })),
    }),
    {
      name: "lifekit-auth",
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);
