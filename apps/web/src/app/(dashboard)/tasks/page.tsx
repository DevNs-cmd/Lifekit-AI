"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckSquare, Plus, X, Pencil, Trash2, MoreHorizontal, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { FormField } from "@/components/shared/form-field";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MOCK_TASKS, MOCK_MISSIONS } from "@/constants/mock-data";
import { ROUTES } from "@/constants/routes";
import { formatDeadline, formatDuration, cn } from "@/lib/utils";
import { createTaskSchema, type CreateTaskFormData } from "@/lib/validation/schemas";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Task } from "@/types/task";

const PRIORITY_COLORS: Record<string, string> = {
  low:    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  medium: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
  high:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export default function TasksPage() {
  const router = useRouter();
  const params = useSearchParams();

  const preselectedMissionId = params.get("missionId") ?? "";
  const shouldOpenCreate = params.get("create") === "true";

  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  useEffect(() => {
    if (shouldOpenCreate) {
      setCreateOpen(true);
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

  function toggle(id: string) {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast("Task uncompleted"); }
      else { next.add(id); toast.success("Task complete! ✓"); }
      return next;
    });
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

  async function onCreateTask(data: CreateTaskFormData) {
    await new Promise(r => setTimeout(r, 300));
    const mission = MOCK_MISSIONS.find(m => m.id === data.missionId);
    const newTask: Task = {
      id: `task-${Date.now()}`,
      userId: "user-1",
      missionId: data.missionId,
      missionTitle: mission?.title ?? "",
      title: data.title,
      description: data.description,
      status: "not-started",
      priority: data.priority ?? "medium",
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      estimatedDurationMinutes: data.estimatedDurationMinutes,
      dependencies: [], notes: [], resources: [], tags: [],
      order: tasks.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask]);
    setCreateOpen(false);
    createForm.reset({ missionId: preselectedMissionId, priority: "medium" });
    toast.success(`Task "${newTask.title}" created!`);
  }

  async function onEditTask(data: CreateTaskFormData) {
    if (!editTarget) return;
    await new Promise(r => setTimeout(r, 300));
    const mission = MOCK_MISSIONS.find(m => m.id === data.missionId);
    setTasks(prev => prev.map(t => t.id === editTarget.id
      ? { ...t, ...data, missionTitle: mission?.title ?? t.missionTitle, updatedAt: new Date().toISOString() }
      : t
    ));
    setEditTarget(null);
    toast.success("Task updated.");
  }

  function deleteTask() {
    if (!deleteTarget) return;
    setTasks(prev => prev.filter(t => t.id !== deleteTarget.id));
    setCompleted(prev => { const n = new Set(prev); n.delete(deleteTarget.id); return n; });
    toast("Task deleted.");
    setDeleteTarget(null);
  }

  const filteredTasks = preselectedMissionId
    ? tasks.filter(t => t.missionId === preselectedMissionId)
    : tasks;

  const missionContext = preselectedMissionId
    ? MOCK_MISSIONS.find(m => m.id === preselectedMissionId)
    : null;

  const completedList = filteredTasks.filter(t => completed.has(t.id));

  function TaskRow({ task, showMission = true }: { task: Task; showMission?: boolean }) {
    const done = completed.has(task.id);
    return (
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--background-subtle))] transition-colors group",
        done && "opacity-60"
      )}>
        <Checkbox
          checked={done}
          onCheckedChange={() => toggle(task.id)}
          aria-label={`Mark "${task.title}" ${done ? "incomplete" : "complete"}`}
        />
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-medium text-[hsl(var(--text-primary))] truncate", done && "line-through")}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {showMission && task.missionTitle && (
              <span className="text-xs text-[hsl(var(--text-secondary))] truncate">{task.missionTitle}</span>
            )}
            {task.dueDate && (
              <span className="text-xs text-[hsl(var(--text-secondary))] flex items-center gap-0.5">
                <Calendar className="h-3 w-3" />{formatDeadline(task.dueDate)}
              </span>
            )}
            {task.estimatedDurationMinutes && (
              <span className="text-xs text-[hsl(var(--text-secondary))] flex items-center gap-0.5 hidden sm:flex">
                <Clock className="h-3 w-3" />{formatDuration(task.estimatedDurationMinutes)}
              </span>
            )}
          </div>
        </div>

        {/* Priority badge */}
        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full hidden sm:inline capitalize", PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.medium)}>
          {task.priority}
        </span>

        <StatusBadge status={done ? "completed" : task.status} />

        {/* Actions — visible on hover */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => openEdit(task)}
            aria-label="Edit task"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="More actions">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEdit(task)}>
                <Pencil className="h-4 w-4 mr-2" />Edit task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggle(task.id)}>
                <CheckSquare className="h-4 w-4 mr-2" />
                {done ? "Mark incomplete" : "Mark complete"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onClick={() => setDeleteTarget(task)}>
                <Trash2 className="h-4 w-4 mr-2" />Delete task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  function TaskDialog({ mode }: { mode: "create" | "edit" }) {
    const isEdit = mode === "edit";
    const form = isEdit ? editForm : createForm;
    const onSubmit = isEdit ? onEditTask : onCreateTask;
    const isOpen = isEdit ? !!editTarget : createOpen;
    const setOpen = isEdit
      ? (v: boolean) => { if (!v) setEditTarget(null); }
      : (v: boolean) => { setCreateOpen(v); if (!v) createForm.reset({ missionId: preselectedMissionId, priority: "medium" }); };

    return (
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit task" : "Add a task"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField label="Task title" htmlFor={`${mode}-title`} required error={form.formState.errors.title?.message}>
              <Input id={`${mode}-title`} placeholder="e.g. Complete React advanced patterns module"
                autoFocus {...form.register("title")} error={!!form.formState.errors.title} />
            </FormField>

            <FormField label="Mission" htmlFor={`${mode}-mission`} required error={form.formState.errors.missionId?.message}>
              <Select
                defaultValue={isEdit ? editTarget?.missionId : (preselectedMissionId || undefined)}
                onValueChange={v => form.setValue("missionId", v)}
              >
                <SelectTrigger id={`${mode}-mission`} error={!!form.formState.errors.missionId}>
                  <SelectValue placeholder="Select a mission" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_MISSIONS.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Priority" htmlFor={`${mode}-priority`}>
                <Select
                  defaultValue={isEdit ? (editTarget?.priority ?? "medium") : "medium"}
                  onValueChange={v => form.setValue("priority", v as CreateTaskFormData["priority"])}
                >
                  <SelectTrigger id={`${mode}-priority`}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Due date" htmlFor={`${mode}-due`}>
                <Input id={`${mode}-due`} type="date" {...form.register("dueDate")} />
              </FormField>
            </div>

            <FormField label="Est. duration (minutes)" htmlFor={`${mode}-duration`}>
              <Input id={`${mode}-duration`} type="number" min={1} placeholder="e.g. 60"
                {...form.register("estimatedDurationMinutes")} />
            </FormField>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" loading={form.formState.isSubmitting}>
                {isEdit ? "Save changes" : "Create task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Tasks</h1>
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
            <p className="text-sm text-[hsl(var(--text-secondary))]">
              {tasks.length} tasks · hover a task to edit
            </p>
          )}
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
          Add Task
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">My Day</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="done">
            Completed {completedList.length > 0 && <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">{completedList.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* My Day */}
        <TabsContent value="today" className="mt-4">
          {filteredTasks.filter(t => !completed.has(t.id)).length === 0 ? (
            <EmptyState icon={<CheckSquare className="h-8 w-8" />}
              title={completedList.length > 0 ? "All tasks complete! 🎉" : "No tasks yet"}
              description={missionContext ? `No tasks for "${missionContext.title}" yet.` : "Add tasks to your missions to see them here."}
              action={completedList.length === 0 ? { label: "Add a task", onClick: () => setCreateOpen(true), icon: <Plus className="h-4 w-4" /> } : undefined}
              compact />
          ) : (
            <Card>
              <CardContent className="p-0 divide-y divide-[hsl(var(--border))]">
                {filteredTasks.filter(t => !completed.has(t.id)).map(task => (
                  <TaskRow key={task.id} task={task} showMission={!missionContext} />
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Upcoming */}
        <TabsContent value="upcoming" className="mt-4">
          {filteredTasks.filter(t => t.dueDate && !completed.has(t.id)).length === 0 ? (
            <EmptyState icon={<Calendar className="h-7 w-7" />} title="No upcoming tasks" description="Tasks with due dates will appear here." compact />
          ) : (
            <Card>
              <CardContent className="p-0 divide-y divide-[hsl(var(--border))]">
                {filteredTasks.filter(t => t.dueDate && !completed.has(t.id)).map(task => (
                  <TaskRow key={task.id} task={task} showMission={!missionContext} />
                ))}
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
                {filteredTasks.map(task => (
                  <TaskRow key={task.id} task={task} showMission={!missionContext} />
                ))}
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
                {completedList.map(task => (
                  <TaskRow key={task.id} task={task} showMission={!missionContext} />
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <TaskDialog mode="create" />
      <TaskDialog mode="edit" />

      <ConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={v => !v && setDeleteTarget(null)}
        title="Delete this task?"
        description={`"${deleteTarget?.title}" will be permanently removed.`}
        confirmLabel="Delete task"
        onConfirm={deleteTask}
      />
    </div>
  );
}
