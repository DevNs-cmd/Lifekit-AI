import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-8 px-4" : "py-16 px-6",
        className
      )}
      role="status"
      aria-label={title}
    >
      {icon && (
        <div className={cn(
          "flex items-center justify-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] mb-4",
          compact ? "h-12 w-12" : "h-16 w-16"
        )}>
          {icon}
        </div>
      )}
      <h3 className={cn("font-semibold text-[hsl(var(--text-primary))]", compact ? "text-base" : "text-lg")}>
        {title}
      </h3>
      {description && (
        <p className={cn("mt-2 text-[hsl(var(--text-secondary))] max-w-sm", compact ? "text-xs" : "text-sm")}>
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className={cn("flex flex-wrap items-center justify-center gap-2", compact ? "mt-4" : "mt-6")}>
          {action && (
            <Button onClick={action.onClick} size={compact ? "sm" : "default"} leftIcon={action.icon}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick} size={compact ? "sm" : "default"}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
