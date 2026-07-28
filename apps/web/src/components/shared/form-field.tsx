"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  description?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ label, htmlFor, required, description, error, className, children }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} required={required}>{label}</Label>
      {description && <p className="text-xs text-[hsl(var(--text-secondary))]">{description}</p>}
      {children}
      {error && (
        <p className="text-xs text-[hsl(var(--destructive))] flex items-center gap-1" role="alert">
          <span aria-hidden>⚠</span> {error}
        </p>
      )}
    </div>
  );
}
