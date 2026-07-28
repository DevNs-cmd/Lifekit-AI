import type { Category, ID } from "./common";
import type { GeneratedMissionPlan, Mission, Milestone } from "./mission";
import type { Task } from "./task";

export type AgentDomain = "career" | "finance" | "travel" | "health" | "business";

export interface Agent {
  id: ID;
  name: string;
  domain: AgentDomain;
  description: string;
  capabilities: string[];
  avatarUrl?: string;
  isAvailable: boolean;
  relatedCategories: Category[];
}

export type MessageRole = "user" | "assistant" | "system";

export interface ConversationMessage {
  id: ID;
  role: MessageRole;
  content: string;
  timestamp: string;
  metadata?: {
    missionContext?: string;
    memoryUsed?: boolean;
    structuredResult?: AgentStructuredResult;
    suggestedActions?: AgentAction[];
    loading?: boolean;
  };
}

export interface AgentAction {
  id: ID;
  label: string;
  type:
    | "create-task"
    | "update-mission"
    | "add-resource"
    | "create-plan"
    | "apply-plan"
    | "save-memory"
    | "find-opportunity"
    | "navigate";
  payload?: Record<string, unknown>;
  requiresConfirmation: boolean;
}

export interface AgentStructuredResult {
  type: "plan" | "checklist" | "recommendation-list" | "comparison" | "resource-list" | "mission-update" | "tasks";
  title: string;
  items?: string[];
  plan?: Partial<GeneratedMissionPlan>;
  tasks?: Partial<Task>[];
  missions?: Partial<Mission>[];
  milestones?: Partial<Milestone>[];
  comparison?: {
    current: Record<string, unknown>;
    suggested: Record<string, unknown>;
    changes: PlanChange[];
  };
}

export interface PlanChange {
  type: "added" | "removed" | "changed";
  field: string;
  description: string;
  before?: string | number;
  after?: string | number;
}

export interface AgentSession {
  id: ID;
  agentId: ID;
  userId: ID;
  missionId?: ID;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface CoachContext {
  currentMissionId?: ID;
  currentMissionTitle?: string;
  currentTaskId?: ID;
  currentTaskTitle?: string;
  memoryActive: boolean;
  relevantResources: { title: string; url?: string }[];
}

export interface AiRecommendation {
  id: ID;
  userId: ID;
  title: string;
  description: string;
  category: Category;
  type: "career" | "learning" | "finance" | "health" | "travel" | "business" | "product" | "service" | "expert" | "opportunity";
  provider?: string;
  relatedMissionId?: ID;
  relatedMissionTitle?: string;
  matchScore: number; // 0-100
  cost?: number;
  currency?: string;
  rating?: number;
  imageUrl?: string;
  url?: string;
  reasons: string[];
  isSaved: boolean;
  isDismissed: boolean;
  createdAt: string;
}

export interface SuggestedPrompt {
  id: ID;
  label: string;
  prompt: string;
  context?: string;
}
