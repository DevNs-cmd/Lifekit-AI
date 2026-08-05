"use client";

import * as React from "react";
import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, CheckCircle2, Circle, Clock, Flame, ListTodo, Pencil, PlayCircle, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SideSheet } from "@/components/ui/side-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn, formatDeadline, formatDuration } from "@/lib/utils";
import type { Task } from "@/types/task";
import { toast } from "sonner";

export type KanbanStatus = "not-started" | "in-progress" | "completed";

export const KANBAN_COLUMNS = [
  { id: "not-started" as const, label: "Not Started", Icon: Circle, hex: "#545b57", color: "text-[#545b57] dark:text-gray-200", bg: "bg-[#f1f2ef] dark:bg-gray-800/50", dot: "bg-[#7b837e]", overBg: "bg-[#f1f2ef] dark:bg-gray-800/60", overBorder: "border-[#7b837e]" },
  { id: "in-progress" as const, label: "In Progress", Icon: PlayCircle, hex: "#315a9b", color: "text-[#315a9b] dark:text-blue-200", bg: "bg-[#edf3ff] dark:bg-blue-900/40", dot: "bg-[#4f76b5]", overBg: "bg-[#edf3ff] dark:bg-blue-900/40", overBorder: "border-[#4f76b5]" },
  { id: "completed" as const, label: "Completed", Icon: CheckCircle2, hex: "#267052", color: "text-[#267052] dark:text-green-200", bg: "bg-[#eaf5ef] dark:bg-green-900/40", dot: "bg-[#34825f]", overBg: "bg-[#eaf5ef] dark:bg-green-900/40", overBorder: "border-[#34825f]" },
];

const PRIORITY: Record<string, { pill: string; topBorder: string; Icon: typeof Flame }> = {
  low: { pill: "bg-[#f1f2ef] !text-[#545b57] dark:bg-gray-800 dark:!text-gray-300", topBorder: "border-t-gray-300", Icon: ListTodo },
  medium: { pill: "bg-[#edf3ff] !text-[#315a9b] dark:bg-blue-900/30 dark:!text-blue-300", topBorder: "border-t-[#4f76b5]", Icon: Zap },
  high: { pill: "bg-[#fff3e9] !text-[#925a2f] dark:bg-amber-900/30 dark:!text-amber-300", topBorder: "border-t-[#b37843]", Icon: Flame },
  urgent: { pill: "bg-[#fff0f0] !text-[#9a484d] dark:bg-red-900/30 dark:!text-red-300", topBorder: "border-t-[#b95d62]", Icon: Flame },
};

function TaskCard({ task, onDetails, overlay = false }: { task: Task; onDetails: (task: Task) => void; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const priority = PRIORITY[task.priority] ?? PRIORITY.medium;
  return <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform) }} className={cn(
    "rounded-xl border border-[hsl(var(--border))]/80 border-t-[3px] bg-[hsl(var(--card))] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
    priority.topBorder, isDragging && !overlay && "opacity-25", overlay && "rotate-[1.5deg] cursor-grabbing shadow-2xl ring-2 ring-[hsl(var(--primary))]/30"
  )}>
    <div {...listeners} {...attributes} className="flex cursor-grab items-center gap-2 px-3 py-3 active:cursor-grabbing">
      {overlay ? <p className="min-w-0 flex-1 text-sm font-semibold leading-snug text-[hsl(var(--text-primary))]">{task.title}</p> : <button type="button" onPointerDown={event => event.stopPropagation()} onClick={() => onDetails(task)} className="min-w-0 flex-1 rounded-md text-left text-sm font-semibold leading-snug text-[hsl(var(--text-primary))] hover:text-[hsl(var(--primary))]" aria-label={`View details for ${task.title}`}>{task.title}</button>}
    </div>
  </div>;
}

function Column({ column, tasks, pulse, onDetails }: { column: typeof KANBAN_COLUMNS[number]; tasks: Task[]; pulse: boolean; onDetails: (task: Task) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return <div className="flex min-w-[270px] flex-1 flex-col">
    <div className="mb-3 flex items-center gap-2 rounded-xl border border-[hsl(var(--border))]/80 bg-[hsl(var(--card))] px-3 py-2.5 shadow-[var(--shadow-xs)]">
      <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", column.bg)}><column.Icon className="h-4 w-4" style={{ color: column.hex }} /></span>
      <span className="text-sm font-bold text-[hsl(var(--text-primary))]">{column.label}</span>
      <span className={cn("ml-auto rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-xs font-bold text-[hsl(var(--text-secondary))]", pulse && "animate-badge-pop")}>{tasks.length}</span>
    </div>
    <div ref={setNodeRef} className={cn("flex min-h-[260px] flex-1 flex-col gap-2 rounded-xl border-2 border-dashed p-2 transition-all duration-200", isOver ? cn(column.overBg, column.overBorder, "scale-[1.012] shadow-inner ring-4 ring-[hsl(var(--primary))]/10") : "border-transparent bg-[hsl(var(--background-subtle))]/75")}>
      {tasks.map(task => <TaskCard key={task.id} task={task} onDetails={onDetails} />)}
      {tasks.length === 0 && <div className={cn("flex flex-1 items-center justify-center rounded-lg text-xs font-medium", isOver ? column.color : "text-[hsl(var(--text-secondary))]/50")}>{isOver ? "Release to drop" : "No tasks"}</div>}
    </div>
  </div>;
}

export interface KanbanBoardProps { tasks: Task[]; onStatusChange: (taskId: string, newStatus: KanbanStatus) => void; onEdit: (task: Task) => void; onDelete: (task: Task) => void; showMission?: boolean }

export function KanbanBoard({ tasks, onStatusChange, onEdit, onDelete, showMission = true }: KanbanBoardProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { const frame = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(frame); }, []);
  const [localTasks, setLocalTasks] = React.useState(tasks);
  React.useEffect(() => { const frame = requestAnimationFrame(() => setLocalTasks(tasks)); return () => cancelAnimationFrame(frame); }, [tasks]);
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);
  const [detailsTask, setDetailsTask] = React.useState<Task | null>(null);
  const [pulseColumn, setPulseColumn] = React.useState<KanbanStatus | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const byColumn = React.useMemo(() => {
    const grouped: Record<KanbanStatus, Task[]> = { "not-started": [], "in-progress": [], "completed": [] };
    for (const task of localTasks) (grouped[task.status as KanbanStatus] ?? grouped["not-started"]).push(task);
    return grouped;
  }, [localTasks]);

  function dragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null);
    if (!over) return;
    const status = String(over.id) as KanbanStatus;
    const task = localTasks.find(item => item.id === active.id);
    if (!task || !KANBAN_COLUMNS.some(column => column.id === status) || task.status === status) return;
    setLocalTasks(current => current.map(item => item.id === task.id ? { ...item, status } : item));
    setPulseColumn(status);
    window.setTimeout(() => setPulseColumn(null), 320);
    onStatusChange(task.id, status);
    toast.success(`Moved to ${KANBAN_COLUMNS.find(column => column.id === status)?.label}.`, { action: { label: "Undo", onClick: () => { const previous = task.status as KanbanStatus; setLocalTasks(current => current.map(item => item.id === task.id ? { ...item, status: previous } : item)); onStatusChange(task.id, previous); } } });
  }

  if (!mounted) return <div className="flex gap-4 overflow-x-auto pb-4">{KANBAN_COLUMNS.map(column => <div key={column.id} className="min-w-[270px] flex-1"><div className={cn("mb-3 h-10 rounded-xl animate-shimmer", column.bg)} /><div className="min-h-[260px] rounded-xl bg-[hsl(var(--background-subtle))]" /></div>)}</div>;

  return <>
    <DndContext sensors={sensors} onDragStart={({ active }: DragStartEvent) => setActiveTask(localTasks.find(task => task.id === active.id) ?? null)} onDragEnd={dragEnd} onDragCancel={() => setActiveTask(null)}>
      <div className="dense-work-surface flex items-start gap-4 overflow-x-auto pb-4">{KANBAN_COLUMNS.map(column => <Column key={column.id} column={column} tasks={byColumn[column.id]} pulse={pulseColumn === column.id} onDetails={setDetailsTask} />)}</div>
      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.2,0,0,1)" }}>{activeTask && <TaskCard task={activeTask} onDetails={setDetailsTask} overlay />}</DragOverlay>
    </DndContext>

    <SideSheet open={!!detailsTask} onOpenChange={open => !open && setDetailsTask(null)} title={detailsTask?.title ?? "Task"} description={detailsTask?.description || "Task details and scheduling information."} footer={<><Button variant="outline" className="text-[hsl(var(--destructive))]" onClick={() => { if (detailsTask) onDelete(detailsTask); setDetailsTask(null); }} leftIcon={<Trash2 className="h-4 w-4" />}>Delete</Button><Button onClick={() => { if (detailsTask) onEdit(detailsTask); setDetailsTask(null); }} leftIcon={<Pencil className="h-4 w-4" />}>Edit task</Button></>}>
        {detailsTask && <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2"><StatusBadge status={detailsTask.status} /><span className={cn("rounded-full px-2.5 py-1 text-xs font-bold capitalize", (PRIORITY[detailsTask.priority] ?? PRIORITY.medium).pill)}>{detailsTask.priority} priority</span></div>
          {showMission && detailsTask.missionTitle && <div className="rounded-xl bg-[hsl(var(--background-subtle))] p-3"><p className="text-[11px] font-bold uppercase tracking-wide text-[hsl(var(--text-secondary))]">Mission</p><p className="mt-0.5 text-sm font-medium">{detailsTask.missionTitle}</p></div>}
          <div className="flex flex-wrap gap-4 text-sm text-[hsl(var(--text-secondary))]">{detailsTask.dueDate && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDeadline(detailsTask.dueDate)}{detailsTask.dueTime ? ` · ${detailsTask.dueTime}` : ""}</span>}{detailsTask.estimatedDurationMinutes && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{formatDuration(detailsTask.estimatedDurationMinutes)}</span>}</div>
        </div>}
    </SideSheet>
  </>;
}
