"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ConversationMessage } from "@/types/ai";

export interface StoredChatSession {
  id: string;
  agentId: string;
  title: string;
  preview: string;
  timestamp: string;
  updatedAt: number;
  messages: ConversationMessage[];
  agentName?: string;
}

interface ChatHistoryState {
  sessions: Record<string, StoredChatSession>;
  activeSessionIdByAgent: Record<string, string>;

  // Actions
  getSessionsForAgent: (agentId: string) => StoredChatSession[];
  getActiveSessionId: (agentId: string) => string | undefined;
  setActiveSessionId: (agentId: string, sessionId: string) => void;
  createSession: (agentId: string, initialTitle?: string, agentName?: string) => StoredChatSession;
  addMessageToSession: (sessionId: string, message: ConversationMessage) => void;
  updateMessageInSession: (sessionId: string, messageId: string, updated: Partial<ConversationMessage>) => void;
  removeMessageFromSession: (sessionId: string, messageId: string) => void;
  deleteSession: (sessionId: string) => void;
  clearSessionMessages: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
}

export function formatChatTimestamp(date: Date = new Date()): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 2) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const isToday = now.toDateString() === date.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (yesterday.toDateString() === date.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export const useChatHistoryStore = create<ChatHistoryState>()(
  persist(
    (set, get) => ({
      sessions: {},
      activeSessionIdByAgent: {},

      getSessionsForAgent: (agentId: string) => {
        const allSessions = Object.values(get().sessions);
        return allSessions
          .filter((s) => s.agentId === agentId)
          .sort((a, b) => b.updatedAt - a.updatedAt);
      },

      getActiveSessionId: (agentId: string) => {
        return get().activeSessionIdByAgent[agentId];
      },

      setActiveSessionId: (agentId: string, sessionId: string) => {
        set((state) => ({
          activeSessionIdByAgent: {
            ...state.activeSessionIdByAgent,
            [agentId]: sessionId,
          },
        }));
      },

      createSession: (agentId: string, initialTitle?: string, agentName?: string) => {
        const now = Date.now();
        const id = `session-${agentId}-${now}`;
        const newSession: StoredChatSession = {
          id,
          agentId,
          title: initialTitle || "New chat",
          preview: "Start a conversation…",
          timestamp: formatChatTimestamp(new Date(now)),
          updatedAt: now,
          messages: [],
          agentName,
        };

        set((state) => ({
          sessions: {
            ...state.sessions,
            [id]: newSession,
          },
          activeSessionIdByAgent: {
            ...state.activeSessionIdByAgent,
            [agentId]: id,
          },
        }));

        return newSession;
      },

      addMessageToSession: (sessionId: string, message: ConversationMessage) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return state;

          const updatedMessages = [...session.messages, message];
          const now = Date.now();

          // Auto-generate title from first user message if current title is generic
          let title = session.title;
          const isGenericTitle = !title || title === "New chat" || title === "First session";
          if (isGenericTitle && message.role === "user" && message.content.trim()) {
            const raw = message.content.trim();
            title = raw.length > 32 ? `${raw.slice(0, 32)}…` : raw;
          }

          let preview = session.preview;
          if (message.content && !message.metadata?.loading) {
            const content = message.content.trim();
            preview = content.length > 45 ? `${content.slice(0, 45)}…` : content;
          }

          const updatedSession: StoredChatSession = {
            ...session,
            title,
            preview,
            timestamp: formatChatTimestamp(new Date(now)),
            updatedAt: now,
            messages: updatedMessages,
          };

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: updatedSession,
            },
          };
        });
      },

      updateMessageInSession: (sessionId: string, messageId: string, updated: Partial<ConversationMessage>) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return state;

          const updatedMessages = session.messages.map((m) =>
            m.id === messageId ? { ...m, ...updated } : m
          );

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: updatedMessages,
              },
            },
          };
        });
      },

      removeMessageFromSession: (sessionId: string, messageId: string) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return state;

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: session.messages.filter((m) => m.id !== messageId),
              },
            },
          };
        });
      },

      deleteSession: (sessionId: string) => {
        set((state) => {
          const { [sessionId]: deleted, ...remainingSessions } = state.sessions;
          if (!deleted) return state;

          const agentId = deleted.agentId;
          const updatedActive = { ...state.activeSessionIdByAgent };

          if (updatedActive[agentId] === sessionId) {
            const agentSessions = Object.values(remainingSessions)
              .filter((s) => s.agentId === agentId)
              .sort((a, b) => b.updatedAt - a.updatedAt);
            if (agentSessions.length > 0) {
              updatedActive[agentId] = agentSessions[0].id;
            } else {
              delete updatedActive[agentId];
            }
          }

          return {
            sessions: remainingSessions,
            activeSessionIdByAgent: updatedActive,
          };
        });
      },

      clearSessionMessages: (sessionId: string) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return state;

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: [],
                preview: "Start a conversation…",
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      updateSessionTitle: (sessionId: string, title: string) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return state;

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                title,
                updatedAt: Date.now(),
              },
            },
          };
        });
      },
    }),
    {
      name: "lifekit-chat-history",
      partialize: (s) => ({
        sessions: s.sessions,
        activeSessionIdByAgent: s.activeSessionIdByAgent,
      }),
    }
  )
);
