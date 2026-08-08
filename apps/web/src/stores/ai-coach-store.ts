"use client";

import { create } from "zustand";
import type { ConversationMessage, CoachContext, SuggestedPrompt } from "@/types/ai";

interface AICoachStore {
  // Panel state
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  toggle: () => void;

  // Context
  context: CoachContext;
  setContext: (ctx: Partial<CoachContext>) => void;
  clearContext: () => void;

  // Conversation
  messages: ConversationMessage[];
  addMessage: (msg: ConversationMessage) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;

  // Loading
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;

  // Suggested prompts
  suggestedPrompts: SuggestedPrompt[];
  setSuggestedPrompts: (prompts: SuggestedPrompt[]) => void;

  // Active agent session
  activeAgentId: string | null;
  setActiveAgentId: (id: string | null) => void;
}

const DEFAULT_CONTEXT: CoachContext = {
  currentMissionId: undefined,
  currentMissionTitle: undefined,
  currentTaskId: undefined,
  currentTaskTitle: undefined,
  memoryActive: true,
  relevantResources: [],
};

const DEFAULT_PROMPTS: SuggestedPrompt[] = [
  { id: "p1", label: "What should I do next?", prompt: "What should I focus on next to make progress on my active missions?", context: "missions" },
  { id: "p2", label: "Re-plan my week", prompt: "Help me re-plan my week given my current tasks and missions.", context: "tasks" },
  { id: "p3", label: "Find resources", prompt: "Find relevant resources, courses or experts for my current mission.", context: "resources" },
  { id: "p4", label: "Identify blockers", prompt: "Are there any blockers or risks in my current missions I should address?", context: "analysis" },
  { id: "p5", label: "Review my progress", prompt: "Give me a comprehensive review of my progress across all active missions.", context: "analytics" },
];

export const useAICoachStore = create<AICoachStore>((set) => ({
  isOpen: false,
  setIsOpen: (v) => set({ isOpen: v }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),

  context: DEFAULT_CONTEXT,
  setContext: (ctx) =>
    set((s) => ({ context: { ...s.context, ...ctx } })),
  clearContext: () => set({ context: DEFAULT_CONTEXT }),

  messages: [],
  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),
  removeMessage: (id) =>
    set((s) => ({ messages: s.messages.filter((m) => m.id !== id) })),
  clearMessages: () => set({ messages: [] }),

  isGenerating: false,
  setIsGenerating: (v) => set({ isGenerating: v }),

  suggestedPrompts: DEFAULT_PROMPTS,
  setSuggestedPrompts: (prompts) => set({ suggestedPrompts: prompts }),

  activeAgentId: null,
  setActiveAgentId: (id) => set({ activeAgentId: id }),
}));
