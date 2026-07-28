"use client";

import * as React from "react";
import { Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

interface UpgradePromptProps {
  feature: string;
  requiredPlan?: "plus" | "pro" | "enterprise";
  className?: string;
  compact?: boolean;
}

const PLAN_LABELS = { plus: "LifeKit Plus", pro: "LifeKit Pro", enterprise: "Enterprise" };

export function UpgradePrompt({ feature, requiredPlan = "plus", className, compact = false }: UpgradePromptProps) {
  const router = useRouter();
  const planLabel = PLAN_LABELS[requiredPlan];

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 rounded-lg border border-[hsl(var(--primary))]/20 bg-[hsl(var(--background-subtle))] px-3 py-2", className)}>
        <Crown className="h-4 w-4 text-[hsl(var(--primary))] shrink-0" />
        <p className="text-xs text-[hsl(var(--text-secondary))] flex-1">
          <span className="font-medium text-[hsl(var(--primary))]">{planLabel}</span> required for {feature}
        </p>
        <Button size="xs" onClick={() => router.push(ROUTES.SETTINGS_SUBSCRIPTION)}>Upgrade</Button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center text-center rounded-xl border border-[hsl(var(--primary))]/20 bg-[hsl(var(--background-subtle))] p-8", className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] mb-4">
        <Sparkles className="h-7 w-7" />
      </div>
      <h3 className="font-semibold text-[hsl(var(--text-primary))]">Upgrade to unlock {feature}</h3>
      <p className="mt-2 text-sm text-[hsl(var(--text-secondary))] max-w-xs">
        This feature is available on {planLabel} and above. Upgrade to access the full LifeKit experience.
      </p>
      <Button className="mt-6" leftIcon={<Crown className="h-4 w-4" />} onClick={() => router.push(ROUTES.SETTINGS_SUBSCRIPTION)}>
        Upgrade to {planLabel}
      </Button>
    </div>
  );
}
