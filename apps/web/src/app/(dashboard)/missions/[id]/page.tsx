"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Pause, Play, MoreHorizontal, Target,
  Calendar, Clock, CheckCircle, Plus, PauseCircle, Pencil,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { CategoryBadge } from "@/components/shared/category-badge";
import { ProgressRing } from "@/components/shared/progress-ring";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { ROUTES } from "@/constants/routes";
import { formatDeadline, formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { MissionStatus } from "@/types/mission";
import { missionsApi } from "@/lib/api";
import { useMissionStore } from "@/stores";

export default function MissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [mission, setMission] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [completedMilestones, setCompletedMilestones] = React.useState<Set<string>>(new Set());
  const [celebratingMilestone, setCelebratingMilestone] = React.useState<string | null>(null);
  const [pauseDialogOpen, setPauseDialogOpen] = React.useState(false);

  // Edit mission state
  const [editOpen, setEditOpen] = React.useState(false);
  const [editFields, setEditFields] = React.useState({
    title: "",
    goal: "",
    targetDate: "",
    weeklyAvailableHours: "",
    budgetAmount: "",
  });

  const { updateCachedMission } = useMissionStore();

  React.useEffect(() => {
    async function load() {
      try {
        const data = await missionsApi.getMission(id);
        setMission({
          ...data,
          milestones: data.milestones || [],
          successMetrics: data.successMetrics || [],
          risks: data.risks || [],
          resources: data.resources || [],
        });
        setEditFields({
          title: data.title,
          goal: data.goal || data.description || "",
          targetDate: data.targetDate ? data.targetDate.split("T")[0] : "",
          weeklyAvailableHours: data.weeklyAvailableHours?.toString() ?? "",
          budgetAmount: data.budgetAmount?.toString() ?? "",
        });
      } catch {
        // fail silently or handle in render
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const isPaused = mission?.status === "paused";

  async function handleSaveEdit() {
    if (!mission) return;
    try {
      const updated = await missionsApi.updateMission(id, {
        title: editFields.title.trim() || mission.title,
        description: editFields.goal.trim() || mission.goal,
        targetDate: editFields.targetDate || undefined,
      });
      setMission((prev: any) => ({ ...prev, ...updated }));
      updateCachedMission(String(id), updated);
      setEditOpen(false);
      toast.success("Mission updated.");
    } catch {
      toast.error("Failed to update mission.");
    }
  }

  async function handlePause() {
    if (!mission) return;
    try {
      updateCachedMission(String(id), { status: "paused" });
      setMission((prev: any) => prev ? { ...prev, status: "paused" } : null);
      toast.success("Mission paused.");
    } catch {
      toast.error("Failed to pause mission.");
    }
  }

  async function handleResume() {
    if (!mission) return;
    try {
      updateCachedMission(String(id), { status: "active" });
      setMission((prev: any) => prev ? { ...prev, status: "active" } : null);
      toast.success("Mission resumed.");
    } catch {
      toast.error("Failed to resume mission.");
    }
  }

  // Navigate to Tasks page pre-filtered to this mission, and open create dialog
  function handleAddTask() {
    if (!mission) return;
    router.push(`${ROUTES.TASKS}?missionId=${mission.id}&create=true`);
  }

  if (loading) {
    return <div className="p-6 text-center text-sm text-[hsl(var(--text-secondary))]">Loading mission details…</div>;
  }

  if (!mission) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Target className="h-8 w-8" />}
          title="Mission not found"
          description="This mission doesn't exist or has been removed."
          action={{ label: "Back to Missions", onClick: () => router.push(ROUTES.MISSIONS) }}
        />
      </div>
    );
  }

  const isActive = mission.status === "active";

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">

      {/* ── Paused banner ── */}
      {isPaused && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 px-4 py-3">
          <PauseCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              This mission is paused
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              No tasks are scheduled. Resume the mission to continue making progress.
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleResume}
            leftIcon={<Play className="h-4 w-4" />}
            className="shrink-0"
          >
            Resume Mission
          </Button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push(ROUTES.MISSIONS)} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <CategoryBadge category={mission.category} size="sm" />
            <StatusBadge status={mission.status} showDot />
          </div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] leading-tight">
            {mission.title}
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1 line-clamp-2">
            {mission.goal}
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[hsl(var(--text-secondary))]">
            {mission.targetDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDeadline(mission.targetDate)}
              </span>
            )}
            {mission.weeklyAvailableHours && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {mission.weeklyAvailableHours}h/week
              </span>
            )}
            {mission.budgetAmount && (
              <span>
                Budget: ₹{mission.budgetAmount.toLocaleString("en-IN")} {mission.budgetCurrency}
              </span>
            )}
          </div>
        </div>

        {/* Progress ring + action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <ProgressRing value={mission.progress} size={56} />
          <div className="flex gap-1">
            {isActive ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPauseDialogOpen(true)}
                leftIcon={<Pause className="h-4 w-4" />}
              >
                Pause
              </Button>
            ) : isPaused ? (
              <Button
                size="sm"
                onClick={handleResume}
                leftIcon={<Play className="h-4 w-4" />}
              >
                Resume
              </Button>
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="More actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  setEditFields({
                    title: mission.title,
                    goal: mission.goal,
                    targetDate: mission.targetDate ?? "",
                    weeklyAvailableHours: mission.weeklyAvailableHours?.toString() ?? "",
                    budgetAmount: mission.budgetAmount?.toString() ?? "",
                  });
                  setEditOpen(true);
                }}>
                  <Pencil className="h-4 w-4 mr-2" />Edit Mission
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full overflow-x-auto justify-start">
          {["overview", "timeline", "tasks", "resources", "progress", "memory", "activity"].map((tab) => (
            <TabsTrigger key={tab} value={tab} className="capitalize shrink-0">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Overview tab ── */}
        <TabsContent value="overview" className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: goal + metrics + risks */}
            <div className="lg:col-span-2 space-y-5">
              <Card>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-[hsl(var(--primary))] uppercase tracking-wide mb-2">
                      Mission Goal
                    </p>
                    <p className="text-sm text-[hsl(var(--text-primary))] leading-relaxed">
                      {mission.goal}
                    </p>
                  </div>
                  {mission.description && (
                    <div>
                      <p className="text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide mb-2">
                        Description
                      </p>
                      <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                        {mission.description}
                      </p>
                    </div>
                  )}
                  {mission.successMetrics.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide mb-2">
                        Success Metrics
                      </p>
                      <ul className="space-y-1.5">
                        {mission.successMetrics.map((m: any, i: number) => (
                          <li key={m.id ?? i} className="flex items-start gap-2 text-sm">
                            <CheckCircle
                              className={cn(
                                "h-4 w-4 mt-0.5 shrink-0",
                                m.achieved
                                  ? "text-[hsl(var(--success))]"
                                  : "text-[hsl(var(--border))]"
                              )}
                            />
                            <span
                              className={
                                m.achieved
                                  ? "line-through text-[hsl(var(--text-secondary))]"
                                  : "text-[hsl(var(--text-primary))]"
                              }
                            >
                              {m.description}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Risks */}
              {mission.risks.length > 0 && (
                <Card>
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide mb-3">
                      Risks & Blockers
                    </p>
                    <div className="space-y-2">
                      {mission.risks.map((r: any, i: number) => (
                        <div
                          key={r.id ?? i}
                          className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3"
                        >
                          <Badge variant="warning" className="shrink-0 mt-0.5 capitalize">
                            {r.severity}
                          </Badge>
                          <div>
                            <p className="text-sm text-[hsl(var(--text-primary))]">{r.description}</p>
                            {r.mitigation && (
                              <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">
                                Mitigation: {r.mitigation}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right: stats + next action */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-5 space-y-3">
                  <p className="text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide">
                    Mission Stats
                  </p>
                  <div className="space-y-2 text-sm">
                    {[
                      {
                        label: "Status",
                        value: (
                          <StatusBadge status={mission.status} />
                        ),
                      },
                      {
                        label: "Milestones",
                        value: `${mission.milestones.filter((m: any) => m.status === "completed").length}/${mission.milestones.length}`,
                      },
                      { label: "Created", value: formatDate(mission.createdAt) },
                      ...(mission.targetDate
                        ? [{ label: "Target", value: formatDate(mission.targetDate) }]
                        : []),
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="text-[hsl(var(--text-secondary))]">{label}</span>
                        <span className="font-medium text-[hsl(var(--text-primary))]">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Next action card — hidden when paused */}
              {mission.nextTaskTitle && !isPaused && (
                <Card className="border-[hsl(var(--primary))]/30 bg-[hsl(var(--background-subtle))]">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-[hsl(var(--primary))] uppercase tracking-wide mb-1">
                      Next Action
                    </p>
                    <p className="text-sm font-medium text-[hsl(var(--text-primary))]">
                      {mission.nextTaskTitle}
                    </p>
                    <Button
                      size="sm"
                      className="mt-3 w-full"
                      leftIcon={<CheckCircle className="h-4 w-4" />}
                      onClick={handleAddTask}
                    >
                      Start task
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* When paused: show resume nudge instead */}
              {isPaused && (
                <Card className="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10">
                  <CardContent className="p-4 text-center">
                    <PauseCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                      Mission is paused
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
                      Resume to start adding and completing tasks.
                    </p>
                    <Button size="sm" className="w-full" onClick={handleResume} leftIcon={<Play className="h-4 w-4" />}>
                      Resume Mission
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Add task button — only visible when active */}
              {isActive && (
                <Button
                  variant="outline"
                  className="w-full"
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={handleAddTask}
                >
                  Add a task
                </Button>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── Timeline tab ── */}
        <TabsContent value="timeline" className="space-y-4">
          {mission.milestones.length === 0 ? (
            <EmptyState
              icon={<Target className="h-7 w-7" />}
              title="No milestones yet"
              description="Milestones will appear here once your mission plan is generated."
              compact
            />
          ) : (
            <div className="relative space-y-0">
              <div
                className="absolute left-5 top-8 bottom-0 w-0.5 bg-[hsl(var(--border))]"
                aria-hidden
              />
              {mission.milestones.map((ms: any, i: number) => (
                <div key={ms.id ?? i} className="relative flex gap-4 pl-0 pb-6 animate-slide-up-fade" style={{ animationDelay: `${Math.min(i * 55, 275)}ms`, animationFillMode: "both" }}>
                  <button
                    type="button"
                    aria-label={`Mark ${ms.title} complete`}
                    onClick={() => {
                      const milestoneId = String(ms.id ?? i);
                      if (ms.status === "completed" || completedMilestones.has(milestoneId)) return;
                      setCompletedMilestones(current => new Set([...current, milestoneId]));
                      setCelebratingMilestone(milestoneId);
                      window.setTimeout(() => setCelebratingMilestone(null), 330);
                      toast.success(`Milestone completed: ${ms.title}`, { action: { label: "Undo", onClick: () => setCompletedMilestones(current => { const next = new Set(current); next.delete(milestoneId); return next; }) } });
                    }}
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 z-10 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95",
                      celebratingMilestone === String(ms.id ?? i) && "celebrate-pop",
                      ms.status === "completed" || completedMilestones.has(String(ms.id ?? i))
                        ? "border-[hsl(var(--success))] bg-[hsl(var(--success))] text-white"
                        : ms.status === "in-progress"
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"
                        : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--text-secondary))]"
                    )}
                  >
                    {ms.status === "completed" || completedMilestones.has(String(ms.id ?? i)) ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-bold">{i + 1}</span>
                    )}
                  </button>
                  <Card
                    className={cn(
                      "flex-1",
                      ms.status === "in-progress" && "border-[hsl(var(--primary))]/40"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-sm text-[hsl(var(--text-primary))]">
                            {ms.title}
                          </h3>
                          {ms.description && (
                            <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">
                              {ms.description}
                            </p>
                          )}
                        </div>
                        <StatusBadge
                          status={
                            ms.status === "completed" || completedMilestones.has(String(ms.id ?? i))
                              ? "completed"
                              : ms.status === "in-progress"
                              ? "in-progress"
                              : "not-started"
                          }
                        />
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-[hsl(var(--text-secondary))] mb-1">
                          <span>
                            {formatDate(ms.startDate)} – {formatDate(ms.endDate)}
                          </span>
                          <span>{ms.progress}%</span>
                        </div>
                        <Progress value={ms.progress} className="h-1.5" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Tasks tab ── */}
        <TabsContent value="tasks">
          {isPaused ? (
            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 p-8 text-center">
              <PauseCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
              <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                Mission is paused
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">
                Tasks cannot be added or started while the mission is paused.
              </p>
              <Button onClick={handleResume} leftIcon={<Play className="h-4 w-4" />}>
                Resume Mission
              </Button>
            </div>
          ) : (
            <EmptyState
              icon={<CheckCircle className="h-7 w-7" />}
              title="Manage tasks for this mission"
              description="Add and track tasks directly from the Tasks page. All tasks linked to this mission will appear there."
              action={{
                label: "Go to Tasks",
                onClick: () => router.push(`${ROUTES.TASKS}?missionId=${mission.id}`),
                icon: <CheckCircle className="h-4 w-4" />,
              }}
              secondaryAction={{
                label: "Add a task",
                onClick: handleAddTask,
              }}
              compact
            />
          )}
        </TabsContent>

        {/* ── Other tabs ── */}
        {["resources", "progress", "memory", "activity"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <EmptyState
              icon={<Target className="h-7 w-7" />}
              title={`${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
              description="This section will show detailed information once you have more mission activity."
              compact
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* ── Pause confirmation dialog ── */}
      <ConfirmationDialog
        open={pauseDialogOpen}
        onOpenChange={setPauseDialogOpen}
        title="Pause this mission?"
        description="Tasks won't be scheduled and reminders will stop. You can resume at any time — your progress is saved."
        confirmLabel="Pause mission"
        cancelLabel="Keep active"
        onConfirm={handlePause}
        variant="warning"
      />

      {/* ── Edit mission dialog ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4" /> Edit Mission
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <FormField label="Title" htmlFor="edit-title" required>
              <Input
                id="edit-title"
                value={editFields.title}
                onChange={e => setEditFields(p => ({ ...p, title: e.target.value }))}
                placeholder="Mission title"
              />
            </FormField>
            <FormField label="Goal" htmlFor="edit-goal" required>
              <Input
                id="edit-goal"
                value={editFields.goal}
                onChange={e => setEditFields(p => ({ ...p, goal: e.target.value }))}
                placeholder="What do you want to achieve?"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Target date" htmlFor="edit-date">
                <Input
                  id="edit-date"
                  type="date"
                  value={editFields.targetDate}
                  onChange={e => setEditFields(p => ({ ...p, targetDate: e.target.value }))}
                />
              </FormField>
              <FormField label="Hours / week" htmlFor="edit-hours">
                <Input
                  id="edit-hours"
                  type="number"
                  min={1}
                  max={168}
                  placeholder="e.g. 10"
                  value={editFields.weeklyAvailableHours}
                  onChange={e => setEditFields(p => ({ ...p, weeklyAvailableHours: e.target.value }))}
                />
              </FormField>
            </div>
            <FormField label="Budget (INR)" htmlFor="edit-budget">
              <Input
                id="edit-budget"
                type="number"
                min={0}
                placeholder="e.g. 25000"
                value={editFields.budgetAmount}
                onChange={e => setEditFields(p => ({ ...p, budgetAmount: e.target.value }))}
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
