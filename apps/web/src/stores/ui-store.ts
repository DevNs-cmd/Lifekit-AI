"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeMode } from "@/types/common";

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  sidebarOpen: boolean; // mobile drawer
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarOpen: (v: boolean) => void;

  // Theme
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;

  // Command menu
  commandMenuOpen: boolean;
  setCommandMenuOpen: (v: boolean) => void;
  toggleCommandMenu: () => void;

  // AI Coach panel
  aiCoachPanelOpen: boolean;
  setAiCoachPanelOpen: (v: boolean) => void;
  toggleAiCoachPanel: () => void;

  // Quick create
  quickCreateOpen: boolean;
  setQuickCreateOpen: (v: boolean) => void;

  // Toast / notification badge
  unreadNotificationCount: number;
  setUnreadNotificationCount: (n: number) => void;
  incrementUnreadCount: () => void;
  clearUnreadCount: () => void;

  // Page loading overlay
  pageLoading: boolean;
  setPageLoading: (v: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarOpen: false,
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleSidebarCollapsed: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarOpen: (v) => set({ sidebarOpen: v }),

      theme: "system",
      setTheme: (t) => set({ theme: t }),

      commandMenuOpen: false,
      setCommandMenuOpen: (v) => set({ commandMenuOpen: v }),
      toggleCommandMenu: () =>
        set((s) => ({ commandMenuOpen: !s.commandMenuOpen })),

      aiCoachPanelOpen: false,
      setAiCoachPanelOpen: (v) => set({ aiCoachPanelOpen: v }),
      toggleAiCoachPanel: () =>
        set((s) => ({ aiCoachPanelOpen: !s.aiCoachPanelOpen })),

      quickCreateOpen: false,
      setQuickCreateOpen: (v) => set({ quickCreateOpen: v }),

      unreadNotificationCount: 0,
      setUnreadNotificationCount: (n) => set({ unreadNotificationCount: n }),
      incrementUnreadCount: () =>
        set((s) => ({ unreadNotificationCount: s.unreadNotificationCount + 1 })),
      clearUnreadCount: () => set({ unreadNotificationCount: 0 }),

      pageLoading: false,
      setPageLoading: (v) => set({ pageLoading: v }),
    }),
    {
      name: "lifekit-ui",
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        theme: s.theme,
      }),
    }
  )
);
