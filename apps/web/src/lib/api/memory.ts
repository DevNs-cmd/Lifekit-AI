/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post, patch, del } from "./client";
import type { Memory } from "@/types/memory";

const MEMORIES_STORAGE_KEY = "lifekit_local_memories";

const INITIAL_MOCK_MEMORIES: Memory[] = [
  {
    id: "mem_1",
    userId: "1",
    content: "Targeting career growth in Full Stack and AI Engineering.",
    category: "goal",
    source: "user",
    importance: "high",
    isPinned: true,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ["career", "ai"],
  },
  {
    id: "mem_2",
    userId: "1",
    content: "Prefers morning execution blocks for deep work and coding.",
    category: "preference",
    source: "user",
    importance: "medium",
    isPinned: false,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ["routine", "productivity"],
  },
];

function getStoredLocalMemories(): Memory[] {
  if (typeof window === "undefined") return INITIAL_MOCK_MEMORIES;
  try {
    const raw = localStorage.getItem(MEMORIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_MEMORIES));
      return INITIAL_MOCK_MEMORIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOCK_MEMORIES;
  }
}

function saveStoredLocalMemories(list: Memory[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

function mapBackendMemoryToFrontend(m: any): Memory {
  let contentText = m.content || "";
  try {
    const parsed = JSON.parse(m.content || "{}");
    if (parsed && typeof parsed.text === "string") {
      contentText = parsed.text;
    }
  } catch {
    // raw string — use as-is
  }

  const typeMap: Record<string, string> = {
    INSIGHT:      "goal",
    EVENT:        "achievement",
    JOURNAL:      "context",
    DOCUMENT:     "context",
    CONVERSATION: "preference",
  };
  const rawType = (m.memory_type || m.type || "JOURNAL").toUpperCase();
  const mappedCategory: any = typeMap[rawType] ?? "context";

  let importance: any = "medium";
  if (m.importance_score !== undefined && m.importance_score !== null) {
    if (m.importance_score > 0.7) importance = "high";
    else if (m.importance_score < 0.4) importance = "low";
  }

  return {
    id: String(m.memory_id || m.id),
    userId: String(m.user_id || m.userId || "1"),
    content: contentText,
    category: mappedCategory,
    relatedMissionId: m.relatedMissionId || undefined,
    source: "user",
    importance: importance,
    isPinned: false,
    isArchived: false,
    createdAt: m.created_at || m.createdAt,
    updatedAt: m.updated_at || m.updatedAt,
    tags: m.tags || [],
  };
}

export async function getMemories(): Promise<Memory[]> {
  try {
    const res = await get<any>("/memories");
    const list: any[] = Array.isArray(res) ? res : (res?.data ?? []);
    if (list.length === 0) return getStoredLocalMemories();
    return list.map(mapBackendMemoryToFrontend);
  } catch {
    return getStoredLocalMemories();
  }
}

function toBackendMemoryType(category: string): string {
  const map: Record<string, string> = {
    goal:         "INSIGHT",
    preference:   "INSIGHT",
    decision:     "INSIGHT",
    feedback:     "JOURNAL",
    achievement:  "EVENT",
    constraint:   "JOURNAL",
    context:      "JOURNAL",
  };
  return map[category.toLowerCase()] ?? "JOURNAL";
}

export async function createMemory(payload: {
  content: string;
  category: string;
  importance?: string;
  relatedMissionId?: string;
  tags?: string[];
}): Promise<Memory> {
  try {
    const body: Record<string, unknown> = {
      content: payload.content,
      type: toBackendMemoryType(payload.category),
    };

    if (payload.relatedMissionId) {
      body.relatedMissionId = Number(payload.relatedMissionId);
    }

    const data = await post<any>("/memories", body);
    return mapBackendMemoryToFrontend(data);
  } catch {
    // Fallback: save locally when backend API is offline / in mock mode
    const localMemory: Memory = {
      id: `mem_local_${Date.now()}`,
      userId: "1",
      content: payload.content,
      category: payload.category as any,
      relatedMissionId: payload.relatedMissionId,
      source: "user",
      importance: (payload.importance as any) || "medium",
      isPinned: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: payload.tags || [],
    };
    const list = getStoredLocalMemories();
    const updated = [localMemory, ...list];
    saveStoredLocalMemories(updated);
    return localMemory;
  }
}

export async function updateMemory(
  id: string | number,
  patchData: Partial<Memory>
): Promise<Memory> {
  try {
    const payload: any = {};
    if (patchData.content !== undefined) payload.content = patchData.content;
    if (patchData.category !== undefined)
      payload.type = toBackendMemoryType(patchData.category);

    const data = await patch<any>(`/memories/${id}`, payload);
    return mapBackendMemoryToFrontend(data);
  } catch {
    const list = getStoredLocalMemories();
    let updatedMem: Memory | null = null;
    const updated = list.map(m => {
      if (m.id === String(id)) {
        updatedMem = { ...m, ...patchData, updatedAt: new Date().toISOString() };
        return updatedMem;
      }
      return m;
    });
    saveStoredLocalMemories(updated);
    return updatedMem || (patchData as Memory);
  }
}

export async function deleteMemory(id: string | number): Promise<void> {
  try {
    await del<void>(`/memories/${id}`);
  } catch {
    const list = getStoredLocalMemories();
    const updated = list.filter(m => m.id !== String(id));
    saveStoredLocalMemories(updated);
  }
}
