"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Target, CheckSquare, TrendingUp, Award, ArrowRight, Calendar, Clock, Bot, Sparkles, X, Bookmark } from "lucide-react";
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
  const todayTasks = MOCK_TASKS.slice(0, 4);
  const recommendations = MOCK_RECOMMENDATIONS.filter(r => !dismissedRecs.has(r.id));

  function handleCompleteTask(id: string) {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); toast.success("Task marked complete!"); }
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Active missions */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[hsl(var(--text-primary))]">Active Missions</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.MISSIONS)} rightIcon={<ArrowRight className="h-4 w-4" />}>View all</Button>
          </div>

          {activeMissions.length === 0 ? (
            <EmptyState
              icon={<Target className="h-8 w-8" />}
              title="No active missions yet"
              description="A Life Mission is a structured execution plan for your goal — with milestones, tasks, and AI support."
              action={{ label: "Create your first mission", onClick: () => router.push(ROUTES.MISSION_NEW) }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeMissions.map(mission => (
                <Card key={mission.id} className="hover:border-[hsl(var(--primary))]/30 hover:shadow-md transition-all group cursor-pointer" onClick={() => router.push(ROUTES.MISSION_DETAIL(mission.id))}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-[hsl(var(--text-primary))] truncate">{mission.title}</h3>
                        <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5 truncate">{mission.goal}</p>
                      </div>
                      <CategoryBadge category={mission.category} size="sm" showIcon={false} />
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[hsl(var(--text-secondary))]">Progress</span>
                        <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">{mission.progress}%</span>
                      </div>
                      <Progress value={mission.progress} className="h-1.5" />
                    </div>
                    {mission.nextTaskTitle && (
                      <p className="text-xs text-[hsl(var(--text-secondary))] mb-3 truncate">
                        <span className="font-medium">Next:</span> {mission.nextTaskTitle}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <StatusBadge status={mission.status} />
                      {mission.targetDate && (
                        <span className="text-xs text-[hsl(var(--text-secondary))]">{formatDeadline(mission.targetDate)}</span>
                      )}
                    </div>
                    <Button size="sm" className="w-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => { e.stopPropagation(); router.push(ROUTES.MISSION_DETAIL(mission.id)); }}>
                      Continue
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Today's tasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-[hsl(var(--text-primary))]">Today's Execution Plan</h2>
              <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.TASKS)} rightIcon={<ArrowRight className="h-4 w-4" />}>All tasks</Button>
            </div>
            <Card>
              <CardContent className="p-0 divide-y divide-[hsl(var(--border))]">
                {todayTasks.map(task => {
                  const done = completedTasks.has(task.id);
                  return (
                    <div key={task.id} className={cn("flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--background-subtle))] transition-colors", done && "opacity-50")}>
                      <Checkbox checked={done} onCheckedChange={() => handleCompleteTask(task.id)} id={`task-${task.id}`} aria-label={`Mark "${task.title}" complete`} />
                      <label htmlFor={`task-${task.id}`} className={cn("flex-1 min-w-0 cursor-pointer", done && "line-through")}>
                        <p className="text-sm font-medium text-[hsl(var(--text-primary))] truncate">{task.title}</p>
                        <p className="text-xs text-[hsl(var(--text-secondary))] truncate">{task.missionTitle}</p>
                      </label>
                      <div className="flex items-center gap-2 shrink-0">
                        {task.dueTime && <span className="text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1"><Clock className="h-3 w-3" />{task.dueTime}</span>}
                        {task.estimatedDurationMinutes && <span className="text-xs text-[hsl(var(--text-secondary))]">{formatDuration(task.estimatedDurationMinutes)}</span>}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* AI recommendations */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bot className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h2 className="text-lg font-bold text-[hsl(var(--text-primary))]">AI Suggestions</h2>
            </div>
            <div className="space-y-3">
              {recommendations.slice(0, 3).map(rec => (
                <Card key={rec.id} className="hover:border-[hsl(var(--primary))]/30 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--primary))] shrink-0" />
                        <p className="text-xs font-semibold text-[hsl(var(--primary))]">{rec.type}</p>
                      </div>
                      <Button variant="ghost" size="icon-sm" className="h-5 w-5" onClick={() => setDismissedRecs(p => new Set([...p, rec.id]))} aria-label="Dismiss">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm font-medium text-[hsl(var(--text-primary))] leading-tight mb-1">{rec.title}</p>
                    {rec.reasons[0] && <p className="text-xs text-[hsl(var(--text-secondary))]">{rec.reasons[0]}</p>}
                    <div className="flex gap-1 mt-2">
                      <Button size="xs" onClick={() => toast.success("Saved!")}>
                        <Bookmark className="h-3 w-3 mr-1" />Save
                      </Button>
                      <Button size="xs" variant="outline">View</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Upcoming deadlines */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-[hsl(var(--primary))]" />Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="p-0 px-5 pb-4">
              <div className="space-y-2">
                {MOCK_MISSIONS.filter(m => m.targetDate).map(m => (
                  <div key={m.id} className="flex items-center justify-between text-sm">
                    <span className="text-[hsl(var(--text-primary))] truncate flex-1">{m.title}</span>
                    <span className="text-xs text-[hsl(var(--text-secondary))] shrink-0 ml-2">{m.targetDate ? formatDeadline(m.targetDate) : ""}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
