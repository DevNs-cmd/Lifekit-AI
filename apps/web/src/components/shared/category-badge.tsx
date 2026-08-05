import * as React from "react";
import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/constants/categories";
import type { Category } from "@/types/common";
import { LucideProps } from "lucide-react";
import * as Icons from "lucide-react";

type LucideIcon = React.ComponentType<LucideProps>;

interface CategoryBadgeProps {
  category: Category;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md";
}

export function CategoryBadge({ category, className, showIcon = true, size = "md" }: CategoryBadgeProps) {
  const config = getCategoryConfig(category);
  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[config.icon];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        "border border-[hsl(var(--primary))]/12 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      {showIcon && IconComponent && <IconComponent className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />}
      {config.label}
    </span>
  );
}
