"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Target, CheckSquare, TrendingUp, Award, ArrowRight,
  Calendar, Clock, Sparkles, Bot, Bookmark, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { MetricCard } from "@/components/shared/metric-card";
import { CategoryBadge } from "@/components/shared/category-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { GoalInput } from "@/components/navigation/goal-input";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuthStore } from "@/stores/auth-store";
import { MOCK_MISSIONS, MOCK_TASKS, MOCK_RECOMMENDATIONS } from "@/constants/mock-data";
import { ROUTES } from "@/constants/routes";
import { formatDeadline, formatDuration, cn } from "@/lib/utils";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [completedTasks, setCompletedTasks] = React.useState<Set<string>>(new Set());
  const [dismissedRecs, setDismissedRecs] = React.useState<Set<string>>(new Set());

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const activeMissions = MOCK_MISSIONS.filter(m => m.status === "active");
  const activeMission = activeMissions[0] ?? null;
  const todayTasks = MOCK_TASKS.slice(0, 4);
  const deadlineMissions = MOCK_MISSIONS.filter(m => m.targetDate);
  const recommendations = MOCK_RECOMMENDATIONS.filter(r => !dismissedRecs.has(r.id));

  function handleCompleteTask(id: string) {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        toast.success("Task marked complete!");
      }
      return next;
    });
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))]">
          {greeting}, {user?.fullName?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="mt-1 text-[hsl(var(--text-secondary))]">What would you like to achieve today?</p>
      </div>

      {/* Goal input */}
      <GoalInput />

      {/* Summary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard title="Active Missions" value={activeMissions.length} icon={<Target className="h-5 w-5" />} accent />
        <MetricCard title="Tasks Due Today" value={todayTasks.length} icon={<CheckSquare className="h-5 w-5" />} />
        <MetricCard title="Completed This Week" value={12} icon={<Award className="h-5 w-5" />} trend={{ value: 20, label: "vs last week" }} />
        <MetricCard title="Overall Progress" value="42%" icon={<TrendingUp className="h-5 w-5" />} description="Across all missions" />
      </div>

      {/* 2×2 card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Card 1 — Active Mission */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-[hsl(var(--primary))]" />
                Active Mission
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => router.push(ROUTES.MISSIONS)}
              >
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            {!activeMission ? (
              <EmptyState
                icon={<Target className="h-6 w-6" />}
                title="No active missions"
                description="Create a mission to get started."
                action={{ label: "Create mission", onClick: () => router.push(ROUTES.MISSION_NEW) }}
              />
            ) : (
              <div
                className="cursor-pointer group"
                onClick={() => router.push(ROUTES.MISSION_DETAIL(activeMission.id))}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))] truncate">
                      {activeMission.title}
                    </p>
                    <p className="text-xs text-[hsl(var(--text-secondary))] truncate mt-0.5">
                      {activeMission.goal}
                    </p>
                  </div>
                  <CategoryBadge category={activeMission.category} size="sm" showIcon={false} />
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[hsl(var(--text-secondary))]">Progress</span>
                    <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">
                      {activeMission.progress}%
                    </span>
                  </div>
                  <Progress value={activeMission.progress} className="h-1.5" />
                </div>
                {activeMission.nextTaskTitle && (
                  <p className="text-xs text-[hsl(var(--text-secondary))] mb-3 truncate">
                    <span className="font-medium">Next:</span> {activeMission.nextTaskTitle}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <StatusBadge status={activeMission.status} />
                  {activeMission.targetDate && (
                    <span className="text-xs text-[hsl(var(--text-secondary))]">
                      {formatDeadline(activeMission.targetDate)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 2 — Today's Execution Plan */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-[hsl(var(--primary))]" />
                Today's Execution Plan
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => router.push(ROUTES.TASKS)}
              >
                All tasks <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-[hsl(var(--border))]">
              {todayTasks.map(task => {
                const done = completedTasks.has(task.id);
                return (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 hover:bg-[hsl(var(--background-subtle))] transition-colors",
                      done && "opacity-50"
                    )}
                  >
                    <Checkbox
                      checked={done}
                      onCheckedChange={() => handleCompleteTask(task.id)}
                      id={`task-${task.id}`}
                      aria-label={`Mark "${task.title}" complete`}
                    />
                    <label
                      htmlFor={`task-${task.id}`}
                      className={cn("flex-1 min-w-0 cursor-pointer", done && "line-through")}
                    >
                      <p className="text-sm font-medium text-[hsl(var(--text-primary))] truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-[hsl(var(--text-secondary))] truncate">
                        {task.missionTitle}
                      </p>
                    </label>
                    <div className="flex items-center gap-2 shrink-0">
                      {task.dueTime && (
                        <span className="text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1">
                          <Clock className="h-3 w-3" />{task.dueTime}
                        </span>
                      )}
                      {task.estimatedDurationMinutes && (
                        <span className="text-xs text-[hsl(var(--text-secondary))]">
                          {formatDuration(task.estimatedDurationMinutes)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Card 3 — Upcoming Deadlines */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[hsl(var(--primary))]" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-2.5">
              {deadlineMissions.map(m => (
                <div key={m.id} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-[hsl(var(--text-primary))] truncate flex-1">
                    {m.title}
                  </span>
                  <span className="text-xs text-[hsl(var(--text-secondary))] shrink-0">
                    {m.targetDate ? formatDeadline(m.targetDate) : ""}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card 4 — AI Suggestions */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot className="h-4 w-4 text-[hsl(var(--primary))]" />
              AI Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            {recommendations.length === 0 ? (
              <p className="text-sm text-[hsl(var(--text-secondary))]">No suggestions right now.</p>
            ) : (
              recommendations.slice(0, 3).map(rec => (
                <div
                  key={rec.id}
                  className="rounded-lg border border-[hsl(var(--border))] p-3 hover:border-[hsl(var(--primary))]/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--primary))] shrink-0" />
                      <span className="text-xs font-semibold text-[hsl(var(--primary))] capitalize">{rec.type}</span>
                    </div>
                    <button
                      onClick={() => setDismissedRecs(p => new Set([...p, rec.id]))}
                      aria-label="Dismiss"
                      className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-[hsl(var(--text-primary))] leading-tight mb-1">
                    {rec.title}
                  </p>
                  {rec.reasons[0] && (
                    <p className="text-xs text-[hsl(var(--text-secondary))] mb-2">{rec.reasons[0]}</p>
                  )}
                  <div className="flex gap-1.5">
                    <Button size="xs" onClick={() => toast.success("Saved!")}>
                      <Bookmark className="h-3 w-3 mr-1" />Save
                    </Button>
                    <Button size="xs" variant="outline">View</Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
