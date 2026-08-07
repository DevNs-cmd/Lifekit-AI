"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMissionStore } from "@/stores/mission-store";
import { ROUTES } from "@/constants/routes";

interface GoalInputProps {
  placeholder?: string;
  className?: string;
  size?: "default" | "lg";
}

export function GoalInput({ placeholder = "Describe a goal, challenge or outcome…", className, size = "default" }: GoalInputProps) {
  const router = useRouter();
  const { draftGoalInput, setDraftGoalInput } = useMissionStore();
  const [localValue, setLocalValue] = React.useState(draftGoalInput);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!localValue.trim()) return;
    setDraftGoalInput(localValue.trim());
    router.push(ROUTES.MISSION_NEW);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
  }

  // Auto-resize
  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [localValue]);

  return (
    <form onSubmit={handleSubmit} className={cn("group relative", className)}>
      <div className={cn(
        "flex flex-col rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--shadow-md)] transition-all",
        "focus-within:border-[hsl(var(--primary))] focus-within:shadow-[var(--shadow-purple)]",
        size === "lg" && "rounded-2xl"
      )}>
        <div className="flex items-center gap-2 px-4 pt-3 pb-1">
          <Sparkles className="h-4 w-4 text-[hsl(var(--primary))] shrink-0" aria-hidden />
          <span className="text-xs font-semibold text-[hsl(var(--primary))] uppercase tracking-wider">AI Goal Engine</span>
        </div>
        <textarea
          ref={textareaRef}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          className={cn(
            "w-full resize-none bg-transparent px-4 py-2 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--muted-foreground))]",
            "focus:outline-none min-h-[3rem] max-h-48",
            size === "lg" && "text-base"
          )}
          aria-label="Describe your goal"
        />
        <div className="flex items-center justify-end px-4 pb-3 pt-1">
          <Button
            type="submit"
            size="sm"
            disabled={!localValue.trim()}
            rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
          >
            Create Mission
          </Button>
        </div>
      </div>
    </form>
  );
}
