import type { ID } from "./common";

export type MemoryCategory =
  | "goal"
  | "preference"
  | "decision"
  | "feedback"
  | "achievement"
  | "constraint"
  | "context";

export type MemorySource = "user" | "ai" | "system";

export type MemoryImportance = "low" | "medium" | "high" | "critical";

export interface Memory {
  id: ID;
  userId: ID;
  content: string;
  category: MemoryCategory;
  relatedMissionId?: ID;
  relatedMissionTitle?: string;
  source: MemorySource;
  importance: MemoryImportance;
  isPinned: boolean;
  isArchived: boolean;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface CreateMemoryInput {
  content: string;
  category: MemoryCategory;
  relatedMissionId?: ID;
  importance?: MemoryImportance;
  tags?: string[];
}

export interface MemorySearchFilters {
  category?: MemoryCategory;
  relatedMissionId?: ID;
  importance?: MemoryImportance;
  isPinned?: boolean;
  isArchived?: boolean;
  dateFrom?: string;
  dateTo?: string;
  query?: string;
}
