import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string; positive?: boolean };
  className?: string;
  accent?: boolean;
}

export function MetricCard({ title, value, description, icon, trend, className, accent }: MetricCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", accent && "border-[hsl(var(--primary))]/20 bg-[hsl(var(--background-subtle))]", className)}>
      {accent && (
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))]/5 to-transparent pointer-events-none" />
      )}
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[hsl(var(--text-secondary))] truncate">{title}</p>
            <p className="mt-1 text-2xl font-bold text-[hsl(var(--text-primary))] tabular-nums">{value}</p>
            {description && (
              <p className="mt-0.5 text-xs text-[hsl(var(--text-secondary))] truncate">{description}</p>
            )}
            {trend && (
              <p className={cn("mt-1.5 text-xs font-medium flex items-center gap-1",
                trend.positive !== false ? "text-[hsl(var(--success))]" : "text-[hsl(var(--destructive))]"
              )}>
                <span>{trend.positive !== false ? "↑" : "↓"}</span>
                <span>{trend.value}% {trend.label}</span>
              </p>
            )}
          </div>
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
