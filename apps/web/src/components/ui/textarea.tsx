"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm",
        "placeholder:text-[hsl(var(--muted-foreground))] resize-y",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:border-[hsl(var(--primary))]",
        "disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-150",
        error && "border-[hsl(var(--destructive))] focus-visible:ring-[hsl(var(--destructive))]",
        className
      )}
      ref={ref}
      aria-invalid={error ? "true" : undefined}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
