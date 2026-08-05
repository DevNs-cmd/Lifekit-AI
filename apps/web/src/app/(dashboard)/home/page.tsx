"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Bot, CalendarDays, Check, CheckSquare, ChevronRight,
  Clock3, Focus, Play, Sparkles, Target, TrendingUp, WandSparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { MetricCard } from "@/components/shared/metric-card";
import { MissionCardSkeleton, TaskCardSkeleton } from "@/components/shared/loading-skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { GoalInput } from "@/components/navigation/goal-input";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import { MOCK_TASKS, MOCK_RECOMMENDATIONS } from "@/constants/mock-data";
import { ROUTES } from "@/constants/routes";
import { cn, formatDeadline, formatDuration } from "@/lib/utils";
import { useMissionStore } from "@/stores";
import { missionsApi } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const setAiCoachPanelOpen = useUIStore(s => s.setAiCoachPanelOpen);
  const [completed, setCompleted] = React.useState<Set<string>>(new Set());
  const { cachedMissions, setCachedMissions } = useMissionStore();
  const [dataReady, setDataReady] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await missionsApi.getMissions();
        setCachedMissions(data);
      } catch {
        // fail silently on dashboard background fetch
      } finally {
        setDataReady(true);
      }
    }
    load();
  }, [setCachedMissions]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const activeMissions = cachedMissions.filter(m => m.status === "active");
  const activeMission = activeMissions[0];
  const todayTasks = MOCK_TASKS.slice(0, 4);
  const nextTask = todayTasks.find(task => !completed.has(task.id)) ?? todayTasks[0];
  const insight = MOCK_RECOMMENDATIONS[0];
  const completedCount = completed.size;
  const score = 78 + Math.min(completedCount * 3, 12);

  function toggleTask(id: string) {
    setCompleted(previous => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        toast.success("Task completed", { description: "Your daily plan has been updated." });
      }
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 p-4 sm:p-6 lg:p-8">
      <section className="relative overflow-hidden rounded-[28px] border border-[hsl(var(--border))]/90 bg-[hsl(var(--card))] p-5 shadow-[0_24px_80px_rgba(28,45,33,0.07)] dark:border-[hsl(var(--primary))]/15 dark:bg-[hsl(var(--card))]/75 dark:backdrop-blur-xl sm:p-7">
        <div className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-[hsl(var(--primary))]/10 blur-3xl" />
        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-stretch">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[hsl(var(--primary))]">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[hsl(var(--secondary))]"><Sparkles className="h-3.5 w-3.5" /></span>
              YOUR INTELLIGENT WORKSPACE
            </div>
            <h1 className="text-3xl font-black tracking-[-0.04em] text-[hsl(var(--text-primary))] sm:text-4xl">
              {greeting}, {user?.fullName?.split(" ")[0] ?? "there"}.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[hsl(var(--text-secondary))] sm:text-base">
              You have a clear runway today. LifeKit has prioritized your next best actions around your active mission.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setAiCoachPanelOpen(true)} leftIcon={<Bot className="h-4 w-4" />}>Plan with AI</Button>
              <Button onClick={() => router.push(`${ROUTES.TASKS}?create=true`)} leftIcon={<CheckSquare className="h-4 w-4" />}>Add task</Button>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-3xl border border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))] p-5 text-white shadow-[0_18px_45px_hsl(var(--primary)/0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_55px_hsl(var(--primary)/0.28)]">
            <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full border-[24px] border-white/5" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">Next best action</p><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10"><WandSparkles className="h-4 w-4" /></span></div>
              <h2 className="mt-5 text-xl font-black leading-tight tracking-[-0.025em]">{nextTask?.title ?? "Review your mission roadmap"}</h2>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/70">{nextTask?.missionTitle ?? activeMission?.title}</p>
              <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/75"><span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{nextTask?.estimatedDurationMinutes ? formatDuration(nextTask.estimatedDurationMinutes) : "Flexible"}</span><span>Highest impact</span></div>
                <Button size="sm" variant="secondary" className="shrink-0 bg-white text-[hsl(var(--primary))] hover:bg-white/90" onClick={() => router.push(ROUTES.TASKS)} leftIcon={<Play className="h-3.5 w-3.5 fill-current" />}>Start</Button>
              </div>
            </div>
          </div>
        </div>
        <div className="relative mt-6 border-t border-[hsl(var(--border))]/70 pt-5"><p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--text-secondary))]">Turn another goal into a plan</p><GoalInput /></div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard title="Productivity score" value={score} description="Strong momentum" icon={<TrendingUp className="h-5 w-5" />} className="min-h-[132px]" />
        <MetricCard title="Today’s plan" value={todayTasks.length - completedCount} description="Tasks remaining" icon={<CheckSquare className="h-5 w-5" />} className="min-h-[132px]" />
        <MetricCard title="Active missions" value={activeMissions.length} description="All on track" icon={<Target className="h-5 w-5" />} className="min-h-[132px]" />
        <MetricCard title="Focus time" value="3h" description="Protected today" icon={<Focus className="h-5 w-5" />} className="min-h-[132px]" />
      </section>

      {!dataReady ? (
        <div className="grid gap-4 lg:grid-cols-12" aria-label="Loading workspace" aria-busy="true">
          <div className="space-y-4 lg:col-span-8"><TaskCardSkeleton /><TaskCardSkeleton /></div>
          <div className="space-y-4 lg:col-span-4"><MissionCardSkeleton /><TaskCardSkeleton /></div>
        </div>
      ) : (
        <section className="dense-work-surface grid items-start gap-5 lg:grid-cols-12 animate-fade-in">
          <div className="space-y-4 lg:col-span-8">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-[hsl(var(--border))]/70 px-5 py-4">
                  <div>
                    <p className="font-bold text-[hsl(var(--text-primary))]">Today’s execution plan</p>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">AI-prioritized to protect your momentum</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.TASKS)}>Open tasks <ArrowRight className="h-3.5 w-3" /></Button>
                </div>
                <div className="divide-y divide-[hsl(var(--border))]/60">
                  {todayTasks.map((task, index) => {
                    const done = completed.has(task.id);
                    return (
                      <div key={task.id} className={cn("group flex items-center gap-3 px-5 py-3.5 transition-all duration-200 hover:bg-[hsl(var(--background-subtle))]/70", done && "opacity-55")}>
                        <span className="w-5 text-center text-[10px] font-bold text-[hsl(var(--text-secondary))]">{done ? <Check className="h-4 w-4 text-[hsl(var(--success))]" /> : index + 1}</span>
                        <Checkbox checked={done} onCheckedChange={() => toggleTask(task.id)} aria-label={`Mark ${task.title} complete`} />
                        <button onClick={() => router.push(ROUTES.TASKS)} className="min-w-0 flex-1 text-left">
                          <p className={cn("truncate text-sm font-semibold text-[hsl(var(--text-primary))]", done && "line-through")}>{task.title}</p>
                          <p className="mt-0.5 truncate text-xs text-[hsl(var(--text-secondary))]">{task.missionTitle}</p>
                        </button>
                        <span className="hidden items-center gap-1 text-xs text-[hsl(var(--text-secondary))] sm:flex"><Clock3 className="h-3 w-3" />{task.estimatedDurationMinutes ? formatDuration(task.estimatedDurationMinutes) : "Flexible"}</span>
                        <ChevronRight className="h-4 w-4 text-[hsl(var(--text-secondary))] opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="premium-surface overflow-hidden border-[hsl(var(--primary))]/15">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl lifekit-gradient text-white ai-glow"><WandSparkles className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><p className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--primary))]">AI insight</p><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--success))]" /></div>
                  <p className="mt-1 font-semibold text-[hsl(var(--text-primary))]">{insight?.title ?? "Protect a focused block for your highest-impact task"}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[hsl(var(--text-secondary))]">{insight?.reasons?.[0] ?? "Based on your recent pace and upcoming deadlines."}</p>
                </div>
                <Button size="sm" onClick={() => setAiCoachPanelOpen(true)}>Explore with AI</Button>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4 lg:col-span-4">
            {activeMission && (
              <Card onClick={() => router.push(ROUTES.MISSION_DETAIL(activeMission.id))} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div><p className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--text-secondary))]">Primary mission</p><h2 className="mt-1 font-bold text-[hsl(var(--text-primary))]">{activeMission.title}</h2></div>
                    <StatusBadge status={activeMission.status} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[hsl(var(--text-secondary))]">{activeMission.goal}</p>
                  <div className="mt-5 flex items-end justify-between"><span className="text-xs text-[hsl(var(--text-secondary))]">Mission progress</span><span className="text-2xl font-black tabular-nums">{activeMission.progress}%</span></div>
                  <Progress value={activeMission.progress} className="mt-2 h-2" />
                  <div className="mt-4 flex items-center justify-between border-t border-[hsl(var(--border))]/70 pt-3 text-xs text-[hsl(var(--text-secondary))]">
                    <span>Next: {activeMission.nextTaskTitle ?? "Review roadmap"}</span><ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between"><div><p className="font-bold text-[hsl(var(--text-primary))]">Today’s rhythm</p><p className="text-xs text-[hsl(var(--text-secondary))]">Your protected schedule</p></div><CalendarDays className="h-5 w-5 text-[hsl(var(--primary))]" /></div>
                <div className="mt-4 space-y-2">
                  {[{ time: "09:30", title: "Deep work", tone: "bg-[hsl(var(--primary))]" }, { time: "12:00", title: "Admin & messages", tone: "bg-blue-400" }, { time: "15:00", title: "Mission review", tone: "bg-amber-400" }].map(block => (
                    <div key={block.time} className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-[hsl(var(--background-subtle))]">
                      <span className="w-10 text-[11px] font-semibold tabular-nums text-[hsl(var(--text-secondary))]">{block.time}</span><span className={cn("h-8 w-1 rounded-full", block.tone)} /><span className="flex-1 text-sm font-medium">{block.title}</span><Play className="h-3.5 w-3.5 text-[hsl(var(--text-secondary))]" />
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => router.push(ROUTES.TASKS)}>Optimize my day</Button>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between px-1 text-xs text-[hsl(var(--text-secondary))]"><span>Next mission deadline</span><span className="font-semibold text-[hsl(var(--text-primary))]">{activeMission?.targetDate ? formatDeadline(activeMission.targetDate) : "No deadline"}</span></div>
          </aside>
        </section>
      )}
    </div>
  );
}
