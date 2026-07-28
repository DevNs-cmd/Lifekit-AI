import type { Category } from "./common";

export interface ProgressDataPoint {
  date: string;
  planned: number;
  actual: number;
}

export interface CategoryProgress {
  category: Category;
  completedMissions: number;
  activeMissions: number;
  completionRate: number;
}

export interface WeeklyActivity {
  day: string;
  tasksCompleted: number;
  minutesWorked: number;
}

export interface TaskStatusDistribution {
  notStarted: number;
  inProgress: number;
  blocked: number;
  completed: number;
  skipped: number;
}

export interface MilestoneTimeline {
  milestoneTitle: string;
  missionTitle: string;
  plannedDate: string;
  actualDate?: string;
  status: "completed" | "on-track" | "at-risk" | "overdue";
}

export interface UserAnalytics {
  missionCompletionRate: number;
  taskCompletionRate: number;
  activeMissions: number;
  completedMissions: number;
  completedMilestones: number;
  totalTasksCompleted: number;
  weeklyProductivity: WeeklyActivity[];
  progressOverTime: ProgressDataPoint[];
  categoryProgress: CategoryProgress[];
  taskStatusDistribution: TaskStatusDistribution;
  milestoneTimeline: MilestoneTimeline[];
  currentStreak: number;
  longestStreak: number;
  averageDelayDays: number;
  recommendedFocusAreas: string[];
}
