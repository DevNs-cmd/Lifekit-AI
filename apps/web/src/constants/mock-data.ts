// ============================================================
// LifeKit Mock Data – all lists are empty; APIs are live.
// MOCK_ANALYTICS is kept as a zero-value export so any
// residual import compiles without changes.
// ============================================================
import type { Mission } from "@/types/mission";
import type { Task } from "@/types/task";
import type { AiRecommendation } from "@/types/ai";
import type { Opportunity } from "@/types/opportunity";
import type { Memory } from "@/types/memory";
import type { Notification } from "@/types/notification";
import type { MarketplaceListing } from "@/types/marketplace";
import type { UserAnalytics } from "@/types/analytics";

export const MOCK_MISSIONS: Mission[] = [];
export const MOCK_TASKS: Task[] = [];
export const MOCK_RECOMMENDATIONS: AiRecommendation[] = [];
export const MOCK_OPPORTUNITIES: Opportunity[] = [];
export const MOCK_MEMORIES: Memory[] = [];
export const MOCK_NOTIFICATIONS: Notification[] = [];
export const MOCK_MARKETPLACE_LISTINGS: MarketplaceListing[] = [];

/** @deprecated Use analyticsApi.getAnalytics() instead. */
export const MOCK_ANALYTICS: UserAnalytics = {
  missionCompletionRate: 0,
  taskCompletionRate: 0,
  activeMissions: 0,
  completedMissions: 0,
  completedMilestones: 0,
  totalTasksCompleted: 0,
  weeklyProductivity: [],
  progressOverTime: [],
  categoryProgress: [],
  taskStatusDistribution: {
    notStarted: 0,
    inProgress: 0,
    blocked: 0,
    completed: 0,
    skipped: 0,
  },
  milestoneTimeline: [],
  currentStreak: 0,
  longestStreak: 0,
  averageDelayDays: 0,
  recommendedFocusAreas: [],
};
