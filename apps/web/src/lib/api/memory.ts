/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post, patch, del } from "./client";
import type { Memory } from "@/types/memory";

function mapBackendMemoryToFrontend(m: any): Memory {
  let mappedCategory: any = (m.memory_type || m.type || "context").toLowerCase();
  if (mappedCategory === "journal") mappedCategory = "context";

  const score = m.importance_score ?? m.importanceScore;
  let importance: any = "medium";
  if (score !== undefined && score !== null) {
    if (score > 0.7) importance = "high";
    else if (score < 0.4) importance = "low";
  }

  let contentText = m.content || "";
  let relatedMissionId = m.relatedMissionId;
  try {
    const parsed = typeof m.content === "string" ? JSON.parse(m.content) : m.content;
    if (parsed && typeof parsed === "object") {
      if (parsed.text) contentText = parsed.text;
      if (parsed.relatedMissionId) relatedMissionId = parsed.relatedMissionId;
    }
  } catch {
    // raw string content
  }

  return {
    id: String(m.memory_id || m.id),
    userId: String(m.user_id || m.userId || "1"),
    content: contentText,
    category: mappedCategory,
    relatedMissionId: relatedMissionId ? String(relatedMissionId) : undefined,
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
  const res = await get<{ data: any[] } | any[]>("/memories");
  const list = Array.isArray(res) ? res : res?.data || [];
  return list.map(mapBackendMemoryToFrontend);
}

export async function createMemory(payload: {
  content: string;
  category: string;
  importance?: string;
  relatedMissionId?: string;
  tags?: string[];
}): Promise<Memory> {
  let score = 0.5;
  if (payload.importance === "high") score = 0.9;
  else if (payload.importance === "low") score = 0.2;

  const typeVal = payload.category.toUpperCase();
  const data = await post<any>("/memories", {
    content: payload.content,
    type: typeVal,
    memoryType: typeVal,
    importanceScore: score,
    relatedMissionId: payload.relatedMissionId
      ? Number(payload.relatedMissionId)
      : undefined,
  });
  return mapBackendMemoryToFrontend(data);
}

export async function updateMemory(
  id: string | number,
  patchData: Partial<Memory>
): Promise<Memory> {
  const payload: any = {};
  if (patchData.content !== undefined) payload.content = patchData.content;
  if (patchData.category !== undefined) {
    const typeVal = patchData.category.toUpperCase();
    payload.type = typeVal;
    payload.memoryType = typeVal;
  }
  if (patchData.importance !== undefined) {
    let score = 0.5;
    if (patchData.importance === "high") score = 0.9;
    else if (patchData.importance === "low") score = 0.2;
    payload.importanceScore = score;
  }

  const data = await patch<any>(`/memories/${id}`, payload);
  return mapBackendMemoryToFrontend(data);
}

export async function deleteMemory(id: string | number): Promise<void> {
  await del<void>(`/memories/${id}`);
}

