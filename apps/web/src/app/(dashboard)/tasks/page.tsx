/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckSquare, Plus, X, Pencil, Trash2, MoreHorizontal,
  Calendar, Clock, Flame, Zap, ListTodo, CheckCircle2, PlayCircle,
  LayoutList, LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { FormField } from "@/components/shared/form-field";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { KanbanBoard, type KanbanStatus } from "@/components/tasks/kanban-board";
import { ROUTES } from "@/constants/routes";
import { formatDeadline, formatDuration, cn } from "@/lib/utils";
import { tasksApi } from "@/lib/api";
import { createTaskSchema, type CreateTaskFormData } from "@/lib/validation/schemas";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useMissionStore } from "@/stores";
import { missionsApi } from "@/lib/api";
import type { Task } from "@/types/task";

type ViewMode = "list" | "Board";

const PRIORITY_CONFIG: Record<string, { label: string; pill: string; border: string; icon: typeof Flame }> = {
  low:    { label: "Low",    pill: "priority-low",    border: "border-l-gray-300",  icon: ListTodo },
  medium: { label: "Medium", pill: "priority-medium", border: "border-l-blue-400",  icon: Zap },
  high:   { label: "High",   pill: "priority-high",   border: "border-l-amber-400", icon: Flame },
  urgent: { label: "Urgent", pill: "priority-urgent", border: "border-l-red-500",   icon: Flame },
};

type TaskRowProps = {
  task: Task;
  showMission?: boolean;
  completed: Set<string>;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

function TaskRow({ task, showMission = true, completed, onToggle, onEdit, onDelete }: TaskRowProps) {
  const done  = completed.has(task.id);
  const pcfg  = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;
  const PIcon = pcfg.icon;

  return (
    <div className={cn(
      "relative flex items-start gap-3 px-4 py-4 border-l-[3px] transition-all duration-200 group animate-slide-up-fade",
      "hover:bg-[hsl(var(--background-subtle))]",
      done ? "border-l-[hsl(var(--border))] opacity-60" : pcfg.border,
    )}>
      <Checkbox
        checked={done}
        onCheckedChange={() => onToggle(task.id)}
        className="mt-0.5 shrink-0"
        aria-label={`Mark "${task.title}" ${done ? "incomplete" : "complete"}`}
      />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold text-[hsl(var(--text-primary))] leading-snug", done && "line-through")}>
          {task.title}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {showMission && task.missionTitle && (
            <span className="text-xs text-[hsl(var(--text-secondary))] bg-[hsl(var(--muted))] px-2 py-0.5 rounded-full truncate max-w-[160px]">
              {task.missionTitle}
            </span>
          )}
          {task.dueDate && (
            <span className="text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1">
              <Calendar className="h-3 w-3" />{formatDeadline(task.dueDate)}
              {task.dueTime && <span>· {task.dueTime}</span>}
            </span>
          )}
          {task.estimatedDurationMinutes && (
            <span className="text-xs text-[hsl(var(--text-secondary))] items-center gap-1 hidden sm:flex">
              <Clock className="h-3 w-3" />{formatDuration(task.estimatedDurationMinutes)}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 pt-0.5">
        <span className={cn("hidden sm:flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full", pcfg.pill)}>
          <PIcon className="h-2.5 w-2.5" />{pcfg.label}
        </span>
        <StatusBadge status={done ? "completed" : task.status} />
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon-sm" onClick={() => onEdit(task)} aria-label="Edit task">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="More actions">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Pencil className="h-4 w-4 mr-2" />Edit task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggle(task.id)}>
                <CheckSquare className="h-4 w-4 mr-2" />
                {done ? "Mark incomplete" : "Mark complete"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onClick={() => onDelete(task)}>
                <Trash2 className="h-4 w-4 mr-2" />Delete task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

type TaskDialogProps = { mode: "create" | "edit"; form: UseFormReturn<CreateTaskFormData>; open: boolean; editTarget?: Task | null; preselectedMissionId: string; onOpenChange: (open: boolean) => void; onSubmit: (data: CreateTaskFormData) => Promise<void>; missions: any[] };

function TaskDialog({ mode, form, open, editTarget, preselectedMissionId, onOpenChange, onSubmit, missions }: TaskDialogProps) {
  const isEdit = mode === "edit";
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>{isEdit ? "Edit task" : "Add a task"}</DialogTitle></DialogHeader>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Task title" htmlFor={`${mode}-title`} required error={form.formState.errors.title?.message}><Input id={`${mode}-title`} placeholder="e.g. Complete React advanced patterns module" autoFocus {...form.register("title")} error={!!form.formState.errors.title} /></FormField>
      <FormField label="Mission" htmlFor={`${mode}-mission`} required error={form.formState.errors.missionId?.message}><Select defaultValue={isEdit ? editTarget?.missionId : (preselectedMissionId || undefined)} onValueChange={v => form.setValue("missionId", v)}><SelectTrigger id={`${mode}-mission`} error={!!form.formState.errors.missionId}><SelectValue placeholder="Select a mission" /></SelectTrigger><SelectContent>{missions.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}</SelectContent></Select></FormField>
      <div className="grid grid-cols-2 gap-3"><FormField label="Priority" htmlFor={`${mode}-priority`}><Select defaultValue={isEdit ? (editTarget?.priority ?? "medium") : "medium"} onValueChange={v => form.setValue("priority", v as CreateTaskFormData["priority"])}><SelectTrigger id={`${mode}-priority`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select></FormField><FormField label="Due date" htmlFor={`${mode}-due`}><Input id={`${mode}-due`} type="date" {...form.register("dueDate")} /></FormField></div>
      <FormField label="Est. duration (minutes)" htmlFor={`${mode}-duration`}><Input id={`${mode}-duration`} type="number" min={1} placeholder="e.g. 60" {...form.register("estimatedDurationMinutes")} /></FormField>
      <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" loading={form.formState.isSubmitting}>{isEdit ? "Save changes" : "Create task"}</Button></DialogFooter>
    </form>
  </DialogContent></Dialog>;
}

export default function TasksPage() {
  const router = useRouter();
  const params = useSearchParams();

  const preselectedMissionId = params.get("missionId") ?? "";
  const shouldOpenCreate = params.get("create") === "true";
  const { cachedMissions, setCachedMissions } = useMissionStore();
  const [tasks, setTasks]           = useState<Task[]>([]);
  const [completed, setCompleted]   = useState<Set<string>>(new Set());
  const [view, setView]             = useState<ViewMode>("list");
  const [createOpen, setCreateOpen] = useState(shouldOpenCreate);
  const [editTarget, setEditTarget] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const missionsData = await missionsApi.getMissions();
        setCachedMissions(missionsData);
        if (preselectedMissionId) {
          const list = await tasksApi.getTasks(preselectedMissionId);
          setTasks(list);
          const doneSet = new Set(list.filter(t => t.status === "completed").map(t => t.id));
          setCompleted(doneSet);
        } else {
          const lists = await Promise.all(
            missionsData.map(m => tasksApi.getTasks(m.id).catch(() => []))
          );
          const all = lists.flat();
          setTasks(all);
          const doneSet = new Set(all.filter(t => t.status === "completed").map(t => t.id));
          setCompleted(doneSet);
        }
      } catch {
        toast.error("Failed to load tasks.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [preselectedMissionId, setCachedMissions]);

  useEffect(() => {
    if (shouldOpenCreate) {
      const url = new URL(window.location.href);
      url.searchParams.delete("create");
      window.history.replaceState({}, "", url.toString());
    }
  }, [shouldOpenCreate]);

  const createForm = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: { missionId: preselectedMissionId, priority: "medium" },
  });

  const editForm = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
  });

  async function toggle(id: string) {
    const targetTask = tasks.find(t => t.id === id);
    if (!targetTask) return;
    const nextStatus = targetTask.status === "completed" ? "not-started" : "completed";
    const backendStatus = nextStatus === "completed" ? "COMPLETED" : "PENDING";
    try {
      const updated = await tasksApi.updateTaskStatus(id, backendStatus);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      if (nextStatus === "completed") {
        setCompleted(prev => new Set([...prev, id]));
        toast.success("Task complete! ✓");
      } else {
        setCompleted(prev => { const n = new Set(prev); n.delete(id); return n; });
        toast("Task uncompleted");
      }
    } catch {
      toast.error("Failed to toggle task.");
    }
  }

  function openEdit(task: Task) {
    setEditTarget(task);
    editForm.reset({
      title: task.title,
      missionId: task.missionId,
      priority: task.priority,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      estimatedDurationMinutes: task.estimatedDurationMinutes,
      description: task.description,
    });
  }

  async function handleKanbanStatusChange(taskId: string, newStatus: KanbanStatus) {
    let backendStatus = "PENDING";
    if (newStatus === "in-progress") backendStatus = "IN_PROGRESS";
    else if (newStatus === "completed") backendStatus = "COMPLETED";

    try {
      const updated = await tasksApi.updateTaskStatus(taskId, backendStatus);
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      if (newStatus === "completed") {
        setCompleted(prev => new Set([...prev, taskId]));
      } else {
        setCompleted(prev => { const n = new Set(prev); n.delete(taskId); return n; });
      }
    } catch {
      toast.error("Failed to update status.");
    }
  }

  async function onCreateTask(data: CreateTaskFormData) {
    try {
      const newTask = await tasksApi.createTask({
        missionId: data.missionId,
        title: data.title,
        description: data.description || "",
        priority: data.priority || "medium",
        dueDate: data.dueDate,
        dueTime: data.dueTime,
        estimatedDurationMinutes: data.estimatedDurationMinutes,
      });
      setTasks(prev => [...prev, newTask]);
      setCreateOpen(false);
      createForm.reset({ missionId: preselectedMissionId, priority: "medium" });
      toast.success(`Task "${newTask.title}" created!`);
    } catch {
      toast.error("Failed to create task.");
    }
  }

  async function onEditTask(data: CreateTaskFormData) {
    if (!editTarget) return;
    try {
      const updatedTask = await tasksApi.updateTask(editTarget.id, {
        title: data.title,
        description: data.description || "",
        priority: data.priority || "medium",
        dueDate: data.dueDate,
        dueTime: data.dueTime,
        estimatedDurationMinutes: data.estimatedDurationMinutes,
      });
      setTasks(prev => prev.map(t => t.id === editTarget.id ? updatedTask : t));
      setEditTarget(null);
      toast.success("Task updated.");
    } catch {
      toast.error("Failed to update task.");
    }
  }

  async function deleteTask(task?: Task) {
    const target = task ?? deleteTarget;
    if (!target) return;
    try {
      await tasksApi.deleteTask(target.id);
      setTasks(prev => prev.filter(t => t.id !== target.id));
      setCompleted(prev => { const n = new Set(prev); n.delete(target.id); return n; });
      toast.success("Task deleted.");
    } catch {
      toast.error("Failed to delete task.");
    }
    setDeleteTarget(null);
  }

  const filteredTasks = preselectedMissionId
    ? tasks.filter(t => t.missionId === preselectedMissionId)
    : tasks;

  const missionContext = preselectedMissionId
    ? cachedMissions.find(m => m.id === preselectedMissionId)
    : null;

  const completedList  = filteredTasks.filter(t => completed.has(t.id));
  const inProgressList = filteredTasks.filter(t => t.status === "in-progress" && !completed.has(t.id));
  const todayList      = filteredTasks.filter(t => !completed.has(t.id));
  const urgentCount    = filteredTasks.filter(t => (t.priority === "urgent" || t.priority === "high") && !completed.has(t.id)).length;




  return (
    <div className={cn("p-4 sm:p-6 lg:p-8 space-y-6 mx-auto", view === "Board" ? "max-w-full" : "max-w-6xl")}>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.035em] text-[hsl(var(--text-primary))]">Tasks</h1>
          {missionContext ? (
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-sm text-[hsl(var(--text-secondary))]">
                Filtered by: <span className="font-medium text-[hsl(var(--primary))]">{missionContext.title}</span>
              </p>
              <button onClick={() => router.push(ROUTES.TASKS)}
                className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--destructive))]"
                aria-label="Clear filter">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-0.5">
              {tasks.length} tasks · {view === "list" ? "hover a task to edit" : "drag cards to change status"}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-[hsl(var(--border))] p-0.5 bg-[hsl(var(--background-subtle))]">
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all",
                view === "list"
                  ? "bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-sm"
                  : "text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
              )}
            >
              <LayoutList className="h-3.5 w-3.5" /> List
            </button>
            <button
              onClick={() => setView("Board")}
              aria-label="Kanban view"
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all",
                view === "Board"
                  ? "bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-sm"
                  : "text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Board
            </button>
          </div>

          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Add Task
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-center text-sm text-[hsl(var(--text-secondary))]">Loading tasks...</div>
      ) : (
        <>
          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total", value: filteredTasks.length, icon: <ListTodo className="h-4 w-4" />, tone: "task-tone-total" },
              { label: "In progress", value: inProgressList.length, icon: <PlayCircle className="h-4 w-4" />, tone: "task-tone-progress" },
              { label: "High priority", value: urgentCount, icon: <Flame className="h-4 w-4" />, tone: "task-tone-high" },
              { label: "Completed", value: completedList.length, icon: <CheckCircle2 className="h-4 w-4" />, tone: "task-tone-complete" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl bg-[hsl(var(--card))] p-3.5 flex items-center gap-3 border border-[hsl(var(--border))]/80 shadow-[var(--shadow-xs)]">
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", s.tone)}>{s.icon}</div>
                <div>
                  <p className="text-xl font-black leading-none tabular-nums text-[hsl(var(--text-primary))]"><AnimatedNumber value={s.value} /></p>
                  <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Kanban view ── */}
          {view === "Board" && (
            <KanbanBoard
              tasks={filteredTasks}
              onStatusChange={handleKanbanStatusChange}
              onEdit={openEdit}
              onDelete={t => setDeleteTarget(t)}
              showMission={!missionContext}
            />
          )}

      {/* ── List view ── */}
      {view === "list" && (
        <Tabs defaultValue="today">
          <TabsList>
            <TabsTrigger value="today">My Day</TabsTrigger>
            <TabsTrigger value="inprogress">
              In Progress
              {inProgressList.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">{inProgressList.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="done">
              Completed
              {completedList.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">{completedList.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* My Day */}
          <TabsContent value="today" className="mt-4">
            {todayList.length === 0 ? (
              <EmptyState icon={<CheckSquare className="h-8 w-8" />}
                title={completedList.length > 0 ? "All tasks complete! 🎉" : "No tasks yet"}
                description={missionContext ? `No tasks for "${missionContext.title}" yet.` : "Add tasks to your missions to see them here."}
                action={completedList.length === 0 ? { label: "Add a task", onClick: () => setCreateOpen(true), icon: <Plus className="h-4 w-4" /> } : undefined}
                compact />
            ) : (
              <Card>
                <CardContent className="p-0 divide-y divide-[hsl(var(--border))]">
                  {todayList.map(task => <TaskRow key={task.id} task={task} showMission={!missionContext} completed={completed} onToggle={toggle} onEdit={openEdit} onDelete={t => setDeleteTarget(t)} />)}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* In Progress */}
          <TabsContent value="inprogress" className="mt-4">
            {inProgressList.length === 0 ? (
              <EmptyState icon={<PlayCircle className="h-7 w-7" />}
                title="No in-progress tasks"
                description="Tasks you've started will appear here."
                compact />
            ) : (
              <Card>
                <CardContent className="p-0 divide-y divide-[hsl(var(--border))]">
                  {inProgressList.map(task => <TaskRow key={task.id} task={task} showMission={!missionContext} completed={completed} onToggle={toggle} onEdit={openEdit} onDelete={t => setDeleteTarget(t)} />)}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* All tasks */}
          <TabsContent value="all" className="mt-4">
            {filteredTasks.length === 0 ? (
              <EmptyState icon={<CheckSquare className="h-7 w-7" />} title="No tasks yet"
                action={{ label: "Add a task", onClick: () => setCreateOpen(true) }} compact />
            ) : (
              <Card>
                <CardContent className="p-0 divide-y divide-[hsl(var(--border))]">
                  {filteredTasks.map(task => <TaskRow key={task.id} task={task} showMission={!missionContext} completed={completed} onToggle={toggle} onEdit={openEdit} onDelete={t => setDeleteTarget(t)} />)}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Completed */}
          <TabsContent value="done" className="mt-4">
            {completedList.length === 0 ? (
              <EmptyState icon={<CheckSquare className="h-7 w-7" />} title="No completed tasks yet"
                description="Completed tasks will appear here. Start checking things off!" compact />
            ) : (
              <Card>
                <CardContent className="p-0 divide-y divide-[hsl(var(--border))]">
                  {completedList.map(task => <TaskRow key={task.id} task={task} showMission={!missionContext} completed={completed} onToggle={toggle} onEdit={openEdit} onDelete={t => setDeleteTarget(t)} />)}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
        </>
      )}

      <TaskDialog mode="create" form={createForm} open={createOpen} preselectedMissionId={preselectedMissionId} onOpenChange={setCreateOpen} onSubmit={onCreateTask} missions={cachedMissions} />
      <TaskDialog mode="edit" form={editForm} open={!!editTarget} editTarget={editTarget} preselectedMissionId={preselectedMissionId} onOpenChange={open => !open && setEditTarget(null)} onSubmit={onEditTask} missions={cachedMissions} />

      <ConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={v => !v && setDeleteTarget(null)}
        title="Delete this task?"
        description={`"${deleteTarget?.title}" will be permanently removed.`}
        confirmLabel="Delete task"
        onConfirm={() => deleteTask()}
      />
    </div>
  );
}
