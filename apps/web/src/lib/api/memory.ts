/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post, patch, del } from "./client";
import type { Memory } from "@/types/memory";

function mapBackendMemoryToFrontend(m: any): Memory {
  // The backend serialises content as JSON: { text, metadata, contextInfo }
  // Try to parse it; fall back to treating content as a plain string.
  let contentText = m.content || "";
  try {
    const parsed = JSON.parse(m.content || "{}");
    if (parsed && typeof parsed.text === "string") {
      contentText = parsed.text;
    }
  } catch {
    // raw string — use as-is
  }

  // Map backend memory_type back to a frontend display category
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
  // The API returns { data: Memory[], total, page, limit, totalPages }
  // after the client unwraps the outer { success, data } envelope.
  const res = await get<any>("/memories");
  // Handle both paginated shape { data: [] } and plain array
  const list: any[] = Array.isArray(res) ? res : (res?.data ?? []);
  return list.map(mapBackendMemoryToFrontend);
}

/**
 * Maps the frontend category values (goal, preference, decision, feedback,
 * achievement, constraint, context) to the backend MemoryType enum
 * (JOURNAL | EVENT | INSIGHT | DOCUMENT | CONVERSATION).
 */
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
  // importance_score is optional in the DB; we derive the display value on
  // read from importance_score, so we don't need to send it on create.
  // Sending it was triggering a DTO validation error on the API side.
  const body: Record<string, unknown> = {
    content: payload.content,
    type: toBackendMemoryType(payload.category),
  };

  if (payload.relatedMissionId) {
    body.relatedMissionId = Number(payload.relatedMissionId);
  }

  const data = await post<any>("/memories", body);
  return mapBackendMemoryToFrontend(data);
}

export async function updateMemory(
  id: string | number,
  patchData: Partial<Memory>
): Promise<Memory> {
  const payload: any = {};
  if (patchData.content !== undefined) payload.content = patchData.content;
  if (patchData.category !== undefined)
    payload.type = toBackendMemoryType(patchData.category);
  // importanceScore omitted — not sending it avoids DTO validation issues
  // and importance_score is nullable in the DB

  const data = await patch<any>(`/memories/${id}`, payload);
  return mapBackendMemoryToFrontend(data);
}

export async function deleteMemory(id: string | number): Promise<void> {
  await del<void>(`/memories/${id}`);
}
