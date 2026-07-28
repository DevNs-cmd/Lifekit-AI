import type { Category, ID, Priority } from "./common";

export type MissionStatus =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "cancelled"
  | "at-risk";

export type MilestoneStatus = "pending" | "in-progress" | "completed" | "skipped";

export interface Resource {
  id: ID;
  title: string;
  type: "course" | "document" | "expert" | "tool" | "product" | "service" | "link";
  url?: string;
  provider?: string;
  cost?: number;
  currency?: string;
  rating?: number;
  description?: string;
  imageUrl?: string;
  addedAt: string;
}

export interface MilestoneTask {
  id: ID;
  title: string;
  status: "not-started" | "in-progress" | "blocked" | "completed" | "skipped";
  priority: Priority;
  dueDate?: string;
  estimatedDurationMinutes?: number;
}

export interface Milestone {
  id: ID;
  missionId: ID;
  title: string;
  description?: string;
  status: MilestoneStatus;
  progress: number; // 0-100
  startDate: string;
  endDate: string;
  tasks: MilestoneTask[];
  resources: Resource[];
  dependencies: ID[];
  order: number;
}

export interface SuccessMetric {
  id: ID;
  description: string;
  measurable: boolean;
  achieved: boolean;
}

export interface RiskItem {
  id: ID;
  description: string;
  severity: "low" | "medium" | "high";
  mitigation?: string;
}

export interface Mission {
  id: ID;
  userId: ID;
  title: string;
  description: string;
  goal: string;
  category: Category;
  status: MissionStatus;
  progress: number; // 0-100
  priority: Priority;

  targetDate?: string;
  estimatedDurationWeeks?: number;
  budgetAmount?: number;
  budgetCurrency?: string;
  weeklyAvailableHours?: number;

  milestones: Milestone[];
  successMetrics: SuccessMetric[];
  risks: RiskItem[];
  resources: Resource[];

  currentMilestoneId?: ID;
  nextTaskId?: ID;
  nextTaskTitle?: string;

  tags: string[];
  isPersonal: boolean; // vs team

  aiGeneratedPlanId?: string;
  lastAiPlanUpdatedAt?: string;

  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface MissionSummary {
  id: ID;
  title: string;
  goal: string;
  category: Category;
  status: MissionStatus;
  progress: number;
  targetDate?: string;
  currentMilestone?: string;
  nextTaskTitle?: string;
  updatedAt: string;
}

export interface CreateMissionInput {
  goal: string;
  category: Category;
  desiredOutcome?: string;
  targetDate?: string;
  budgetAmount?: number;
  budgetCurrency?: string;
  weeklyAvailableHours?: number;
  constraints?: string;
}

export interface AiClarificationQuestion {
  id: ID;
  question: string;
  type: "multiple-choice" | "date" | "number" | "text" | "priority-ranking" | "preference";
  options?: string[];
  required: boolean;
}

export interface GeneratedMissionPlan {
  title: string;
  description: string;
  category: Category;
  goal: string;
  estimatedDurationWeeks: number;
  milestones: (Omit<Milestone, "missionId"> & { missionId?: string })[];
  successMetrics: SuccessMetric[];
  risks: RiskItem[];
  resources: Omit<Resource, "id" | "addedAt">[];
  suggestedSchedule?: string;
}

export interface MissionActivity {
  id: ID;
  missionId: ID;
  type:
    | "task-completed"
    | "mission-edited"
    | "resource-added"
    | "recommendation-accepted"
    | "deadline-changed"
    | "milestone-achieved"
    | "mission-paused"
    | "mission-resumed"
    | "mission-created"
    | "ai-plan-applied";
  description: string;
  metadata?: Record<string, string | number | boolean>;
  userId: ID;
  createdAt: string;
}
