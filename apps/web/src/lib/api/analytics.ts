/* eslint-disable @typescript-eslint/no-explicit-any */
import { get } from "./client";
import { getMissions } from "./missions";
import { getTasks } from "./tasks";
import type { UserAnalytics, WeeklyActivity, CategoryProgress, TaskStatusDistribution } from "@/types/analytics";

/** Attempt to fetch a dedicated analytics endpoint; fall back to deriving
 *  analytics from missions + tasks if the endpoint doesn't exist yet. */
export async function getAnalytics(): Promise<UserAnalytics> {
  // Try the dedicated endpoint first
  try {
    const data = await get<any>("/analytics/summary");
    if (data && typeof data.taskCompletionRate === "number") {
      return data as UserAnalytics;
    }
  } catch {
    // endpoint not yet available — derive from missions/tasks below
  }

  return deriveAnalytics();
}

async function deriveAnalytics(): Promise<UserAnalytics> {
  const [missions, allTasksNested] = await Promise.all([
    getMissions().catch(() => [] as any[]),
    Promise.all(
      (await getMissions().catch(() => [] as any[])).map((m) =>
        getTasks(m.id).catch(() => [] as any[])
      )
    ).catch(() => [] as any[][]),
  ]);

  const allTasks = allTasksNested.flat();

  // Mission stats
  const activeMissions = missions.filter(
    (m: any) => m.status === "active" || m.status === "in-progress"
  ).length;
  const completedMissions = missions.filter(
    (m: any) => m.status === "completed" || m.status === "done"
  ).length;
  const totalMissions = missions.length;
  const missionCompletionRate = totalMissions
    ? Math.round((completedMissions / totalMissions) * 100)
    : 0;

  // Task stats
  const completedTasks = allTasks.filter((t: any) => t.status === "completed");
  const inProgressTasks = allTasks.filter(
    (t: any) => t.status === "in-progress"
  );
  const notStartedTasks = allTasks.filter(
    (t: any) => t.status === "not-started"
  );
  const taskCompletionRate = allTasks.length
    ? Math.round((completedTasks.length / allTasks.length) * 100)
    : 0;

  // Category progress
  const categoryMap: Record<
    string,
    { active: number; completed: number; total: number }
  > = {};
  for (const m of missions) {
    const cat = (m.category || "other").toLowerCase();
    if (!categoryMap[cat]) categoryMap[cat] = { active: 0, completed: 0, total: 0 };
    categoryMap[cat].total++;
    if (m.status === "completed") categoryMap[cat].completed++;
    else categoryMap[cat].active++;
  }
  const categoryProgress: CategoryProgress[] = Object.entries(categoryMap)
    .slice(0, 6)
    .map(([category, v]) => ({
      category: category as any,
      activeMissions: v.active,
      completedMissions: v.completed,
      completionRate: v.total ? Math.round((v.completed / v.total) * 100) : 0,
    }));

  // Weekly activity — last 7 days from completed tasks
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyMap: Record<string, { tasks: number; minutes: number }> = {};
  days.forEach((d) => (weeklyMap[d] = { tasks: 0, minutes: 0 }));
  const now = new Date();
  for (const task of completedTasks) {
    const completed = task.completedAt || task.updatedAt || task.createdAt;
    if (!completed) continue;
    const d = new Date(completed);
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    if (diff <= 7) {
      const day = days[d.getDay()];
      weeklyMap[day].tasks++;
      weeklyMap[day].minutes += task.estimatedDurationMinutes || 30;
    }
  }
  const weeklyProductivity: WeeklyActivity[] = days.map((day) => ({
    day,
    tasksCompleted: weeklyMap[day].tasks,
    minutesWorked: weeklyMap[day].minutes,
  }));

  // Task status distribution
  const taskStatusDistribution: TaskStatusDistribution = {
    notStarted: notStartedTasks.length,
    inProgress: inProgressTasks.length,
    blocked: allTasks.filter((t: any) => t.status === "blocked").length,
    completed: completedTasks.length,
    skipped: allTasks.filter((t: any) => t.status === "skipped").length,
  };

  // Progress over time — simple 5-point spread over last 30 days
  const progressOverTime = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (4 - i) * 7);
    const dateStr = d.toISOString().slice(0, 10);
    const completedByThen = completedTasks.filter((t: any) => {
      const ca = t.completedAt || t.updatedAt;
      return ca && ca.slice(0, 10) <= dateStr;
    }).length;
    return { date: dateStr, planned: allTasks.length, actual: completedByThen };
  });

  return {
    missionCompletionRate,
    taskCompletionRate,
    activeMissions,
    completedMissions,
    completedMilestones: completedTasks.length,
    totalTasksCompleted: completedTasks.length,
    weeklyProductivity,
    progressOverTime,
    categoryProgress,
    taskStatusDistribution,
    milestoneTimeline: [],
    currentStreak: 0,
    longestStreak: 0,
    averageDelayDays: 0,
    recommendedFocusAreas: [],
  };
}
