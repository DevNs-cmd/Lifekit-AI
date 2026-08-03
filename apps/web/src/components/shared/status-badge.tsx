import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MissionStatus } from "@/types/mission";
import type { TaskStatus } from "@/types/task";

type Status = MissionStatus | TaskStatus | "active" | "inactive";

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "info" | "outline" | "secondary" | "purple" }> = {
  // Mission
  draft:      { label: "Draft",      variant: "outline" },
  active:     { label: "Active",     variant: "success" },
  paused:     { label: "Paused",     variant: "warning" },
  completed:  { label: "Completed",  variant: "purple" },
  cancelled:  { label: "Cancelled",  variant: "destructive" },
  "at-risk":  { label: "At Risk",    variant: "warning" },
  // Task
  "not-started":  { label: "Not Started",  variant: "outline" },
  "in-progress":  { label: "In Progress",  variant: "info" },
  blocked:        { label: "Blocked",      variant: "destructive" },
  skipped:        { label: "Skipped",      variant: "secondary" },
  // Generic
  inactive:   { label: "Inactive",   variant: "secondary" },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, className, showDot = false }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: "outline" as const };
  const statusClasses: Partial<Record<Status, string>> = {
    "not-started": "status-not-started",
    "in-progress": "status-in-progress",
    completed: "status-completed",
    active: "status-active",
    paused: "status-paused",
  };
  const statusClass = statusClasses[status];
  return (
    <Badge variant={config.variant} className={cn("gap-1.5", statusClass, className)}>
      {showDot && (
        <span
          className={cn("inline-block h-1.5 w-1.5 rounded-full", {
            "bg-green-500": config.variant === "success",
            "bg-yellow-500": config.variant === "warning",
            "bg-red-500": config.variant === "destructive",
            "bg-blue-500": config.variant === "info",
            "bg-purple-500": config.variant === "purple",
            "bg-gray-400": config.variant === "outline" || config.variant === "secondary",
          })}
          aria-hidden
        />
      )}
      {config.label}
    </Badge>
  );
}
