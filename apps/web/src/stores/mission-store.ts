"use client";

import { create } from "zustand";
import type { Mission, GeneratedMissionPlan, CreateMissionInput } from "@/types/mission";

interface MissionStore {
  // Active context
  activeMissionId: string | null;
  setActiveMissionId: (id: string | null) => void;

  // Mission creation draft
  draftGoalInput: string;
  setDraftGoalInput: (v: string) => void;

  draftMissionInput: Partial<CreateMissionInput> | null;
  setDraftMissionInput: (v: Partial<CreateMissionInput> | null) => void;

  generatedPlan: GeneratedMissionPlan | null;
  setGeneratedPlan: (plan: GeneratedMissionPlan | null) => void;

  planGenerating: boolean;
  setPlanGenerating: (v: boolean) => void;

  // Creation wizard step
  creationStep: number;
  setCreationStep: (n: number) => void;
  nextCreationStep: () => void;
  prevCreationStep: () => void;
  resetCreation: () => void;

  // Cached list (client-side optimistic cache)
  cachedMissions: Mission[];
  setCachedMissions: (missions: Mission[]) => void;
  updateCachedMission: (id: string, patch: Partial<Mission>) => void;
  removeCachedMission: (id: string) => void;

  /**
   * Timestamp (ms) set whenever a mission is successfully created.
   * Marketplace and Opportunities pages watch this to know they must
   * re-fetch because the backend is regenerating their AI content.
   * Consumers call clearMissionCreatedFlag() after they start a refresh.
   */
  missionCreatedAt: number | null;
  markMissionCreated: () => void;
  clearMissionCreatedFlag: () => void;
}

export const useMissionStore = create<MissionStore>((set) => ({
  activeMissionId: null,
  setActiveMissionId: (id) => set({ activeMissionId: id }),

  draftGoalInput: "",
  setDraftGoalInput: (v) => set({ draftGoalInput: v }),

  draftMissionInput: null,
  setDraftMissionInput: (v) => set({ draftMissionInput: v }),

  generatedPlan: null,
  setGeneratedPlan: (plan) => set({ generatedPlan: plan }),

  planGenerating: false,
  setPlanGenerating: (v) => set({ planGenerating: v }),

  creationStep: 1,
  setCreationStep: (n) => set({ creationStep: n }),
  nextCreationStep: () => set((s) => ({ creationStep: s.creationStep + 1 })),
  prevCreationStep: () =>
    set((s) => ({ creationStep: Math.max(1, s.creationStep - 1) })),
  resetCreation: () =>
    set({
      creationStep: 1,
      draftGoalInput: "",
      draftMissionInput: null,
      generatedPlan: null,
      planGenerating: false,
    }),

  cachedMissions: [],
  setCachedMissions: (missions) => set({ cachedMissions: missions }),
  updateCachedMission: (id, patch) =>
    set((s) => ({
      cachedMissions: s.cachedMissions.map((m) =>
        m.id === id ? { ...m, ...patch } : m
      ),
    })),
  removeCachedMission: (id) =>
    set((s) => ({
      cachedMissions: s.cachedMissions.filter((m) => m.id !== id),
    })),

  missionCreatedAt: null,
  markMissionCreated: () => set({ missionCreatedAt: Date.now() }),
  clearMissionCreatedFlag: () => set({ missionCreatedAt: null }),
}));
