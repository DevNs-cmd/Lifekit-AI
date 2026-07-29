"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, Clock, Flame, Zap, ListTodo, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatDeadline, formatDuration } from "@/lib/utils";
import type { Task } from "@/types/task";

/* ── Column config ──────────────────────────────────────── */
export type KanbanStatus = "not-started" | "in-progress" | "completed";

export const KANBAN_COLUMNS: {
  id: KanbanStatus;
  label: string;
  color: string;
  bg: string;
  dot: string;
  overBg: string;
  overBorder: string;
}[] = [
  { id: "not-started", label: "Not Started", color: "text-gray-700 dark:text-gray-200",   bg: "bg-gray-100 dark:bg-gray-800/50",   dot: "bg-gray-400",  overBg: "bg-gray-100 dark:bg-gray-800/60",   overBorder: "border-gray-400" },
  { id: "in-progress", label: "In Progress", color: "text-blue-700 dark:text-blue-200",   bg: "bg-blue-100 dark:bg-blue-900/40",   dot: "bg-blue-500",  overBg: "bg-blue-100 dark:bg-blue-900/40",   overBorder: "border-blue-500" },
  { id: "completed",   label: "Completed",   color: "text-green-700 dark:text-green-200", bg: "bg-green-100 dark:bg-green-900/40", dot: "bg-green-500", overBg: "bg-green-100 dark:bg-green-900/40", overBorder: "border-green-500" },
];

const PRIORITY: Record<string, { pill: string; topBorder: string; Icon: typeof Flame }> = {
  low:    { pill: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",        topBorder: "border-t-gray-300",  Icon: ListTodo },
  medium: { pill: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",     topBorder: "border-t-blue-400",  Icon: Zap },
  high:   { pill: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", topBorder: "border-t-amber-400", Icon: Flame },
  urgent: { pill: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",         topBorder: "border-t-red-500",   Icon: Flame },
};

/* ── Draggable card ─────────────────────────────────────── */
function Card({
  task,
  showMission,
  onEdit,
  onDelete,
  isOverlay = false,
}: {
  task: Task;
  showMission: boolean;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const p = PRIORITY[task.priority] ?? PRIORITY.medium;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "rounded-xl border border-[hsl(var(--border))] border-t-[3px] bg-[hsl(var(--card))]",
        "shadow-sm select-none group",
        p.topBorder,
        isDragging && !isOverlay && "opacity-25",
        isOverlay && "shadow-2xl ring-2 ring-[hsl(var(--primary))]/40 rotate-[1.5deg] cursor-grabbing",
      )}
    >
      {/* Entire top area is the drag handle */}
      <div
        {...listeners}
        {...attributes}
        className={cn(
          "px-3 pt-3 pb-2 cursor-grab active:cursor-grabbing",
          isOverlay && "cursor-grabbing",
        )}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-semibold text-[hsl(var(--text-primary))] leading-snug flex-1">
            {task.title}
          </p>
          <span className={cn("shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full", p.pill)}>
            <p.Icon className="h-2.5 w-2.5" />
            <span className="capitalize">{task.priority}</span>
          </span>
        </div>

        <div className="flex flex-col gap-1">
          {showMission && task.missionTitle && (
            <span className="text-xs text-[hsl(var(--text-secondary))] bg-[hsl(var(--muted))] px-2 py-0.5 rounded-full truncate w-fit max-w-full">
              {task.missionTitle}
            </span>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {task.dueDate && (
              <span className="text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDeadline(task.dueDate)}
                {task.dueTime && <span>· {task.dueTime}</span>}
              </span>
            )}
            {task.estimatedDurationMinutes && (
              <span className="text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(task.estimatedDurationMinutes)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action row — mouseDown stops drag from triggering */}
      <div
        className="px-3 pb-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={e => e.stopPropagation()}
        onPointerDown={e => e.stopPropagation()}
      >
        <Button variant="outline" size="xs" onClick={() => onEdit(task)}>
          <Pencil className="h-3 w-3 mr-1" />Edit
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => onDelete(task)}
          className="text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 border-[hsl(var(--destructive))]/30"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

/* ── Droppable column ───────────────────────────────────── */
function Column({
  col,
  tasks,
  showMission,
  onEdit,
  onDelete,
}: {
  col: typeof KANBAN_COLUMNS[number];
  tasks: Task[];
  showMission: boolean;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });

  return (
    <div className="flex flex-col min-w-[280px] flex-1">
      {/* Header */}
      <div className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3", col.bg)}>
        <span className={cn("h-2 w-2 rounded-full shrink-0", col.dot)} />
        <span className={cn("text-sm font-bold", col.color)}>{col.label}</span>
        <span className={cn("ml-auto text-xs font-bold px-2 py-0.5 rounded-full", col.bg, col.color)}>
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-xl min-h-[260px] p-2 flex flex-col gap-2 border-2 border-dashed transition-all duration-150",
          isOver
            ? cn(col.overBg, col.overBorder)
            : "border-transparent bg-[hsl(var(--background-subtle))]",
        )}
      >
        {tasks.map(task => (
          <Card
            key={task.id}
            task={task}
            showMission={showMission}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

        {tasks.length === 0 && (
          <div className={cn(
            "flex items-center justify-center flex-1 rounded-lg text-xs font-medium transition-colors",
            isOver ? cn(col.color, "opacity-80") : "text-[hsl(var(--text-secondary))] opacity-40",
          )}>
            {isOver ? "Release to drop" : "No tasks"}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Board ─────────────────────────────────────────────── */
export interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: KanbanStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  showMission?: boolean;
}

export function KanbanBoard({ tasks, onStatusChange, onEdit, onDelete, showMission = true }: KanbanBoardProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  const [localTasks, setLocalTasks] = React.useState<Task[]>(tasks);
  React.useEffect(() => { setLocalTasks(tasks); }, [tasks]);

  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const byColumn = React.useMemo(() => {
    const map: Record<KanbanStatus, Task[]> = { "not-started": [], "in-progress": [], "completed": [] };
    for (const t of localTasks) {
      const key = t.status as KanbanStatus;
      if (key in map) map[key].push(t);
      else map["not-started"].push(t);
    }
    return map;
  }, [localTasks]);

  function handleDragStart({ active }: DragStartEvent) {
    setActiveTask(localTasks.find(t => t.id === active.id) ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null);
    if (!over) return;

    const toCol = String(over.id) as KanbanStatus;
    if (!KANBAN_COLUMNS.some(c => c.id === toCol)) return;

    const task = localTasks.find(t => t.id === active.id);
    if (!task || task.status === toCol) return;

    setLocalTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: toCol } : t));
    onStatusChange(task.id, toCol);
  }

  // Show skeleton until mounted (avoids React 18 strict-mode hydration mismatch with @dnd-kit)
  if (!mounted) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map(col => (
          <div key={col.id} className="flex flex-col min-w-[280px] flex-1">
            <div className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3", col.bg)}>
              <span className={cn("h-2 w-2 rounded-full", col.dot)} />
              <span className={cn("text-sm font-bold", col.color)}>{col.label}</span>
            </div>
            <div className="rounded-xl min-h-[260px] bg-[hsl(var(--background-subtle))] border-2 border-dashed border-transparent" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTask(null)}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 items-start">
        {KANBAN_COLUMNS.map(col => (
          <Column
            key={col.id}
            col={col}
            tasks={byColumn[col.id]}
            showMission={showMission}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.2,0,0,1)" }}>
        {activeTask && (
          <Card
            task={activeTask}
            showMission={showMission}
            onEdit={onEdit}
            onDelete={onDelete}
            isOverlay
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
