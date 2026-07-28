"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightIcon, error, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 flex items-center pointer-events-none text-[hsl(var(--text-secondary))]">
            {leftIcon}
          </span>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border bg-transparent px-3 py-2 text-sm",
            "border-[hsl(var(--input))] placeholder:text-[hsl(var(--muted-foreground))]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-0 focus-visible:border-[hsl(var(--primary))]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors duration-150",
            error && "border-[hsl(var(--destructive))] focus-visible:ring-[hsl(var(--destructive))]",
            leftIcon && "pl-9",
            rightIcon && "pr-9",
            className
          )}
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 flex items-center pointer-events-none text-[hsl(var(--text-secondary))]">
            {rightIcon}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
