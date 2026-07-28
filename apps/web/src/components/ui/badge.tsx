import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[hsl(var(--primary))] text-white",
        secondary: "border-transparent bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]",
        outline: "border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]",
        success: "border-transparent bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]",
        warning: "border-transparent bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]",
        destructive: "border-transparent bg-[hsl(var(--destructive))]/15 text-[hsl(var(--destructive))]",
        info: "border-transparent bg-[hsl(var(--info))]/15 text-[hsl(var(--info))]",
        purple: "border-transparent bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
