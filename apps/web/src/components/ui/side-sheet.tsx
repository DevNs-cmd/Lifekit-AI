"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface SideSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function SideSheet({ open, onOpenChange, title, description, children, footer, className }: SideSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("side-sheet left-auto right-0 top-0 h-[100dvh] max-w-lg translate-x-0 translate-y-0 rounded-none border-y-0 border-r-0 p-0", className)}>
        <div className="flex h-full flex-col">
          <DialogHeader className="border-b border-[hsl(var(--border))] p-6 pr-12">
            <DialogTitle className="text-xl">{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>
          {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-[hsl(var(--border))] bg-[hsl(var(--background-subtle))] p-4">{footer}</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
