"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, CheckCircle, ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "free" as const,
    name: "Free",
    price: "₹0",
    period: "",
    features: ["3 active missions", "Basic AI planning", "Marketplace access", "5 AI Coach messages/day"],
    popular: false,
  },
  {
    id: "plus" as const,
    name: "LifeKit Plus",
    price: "₹499",
    period: "/month",
    features: ["10 active missions", "Advanced AI planning", "All 5 AI Agents", "Unlimited AI Coach", "Memory & personalisation", "Priority support"],
    popular: true,
  },
  {
    id: "pro" as const,
    name: "LifeKit Pro",
    price: "₹999",
    period: "/month",
    features: ["Unlimited missions", "Deep AI planning", "All AI Agents + custom", "Unlimited AI Coach + voice", "Extended memory", "Advanced analytics", "API access"],
    popular: false,
  },
  {
    id: "enterprise" as const,
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: ["Everything in Pro", "Team workspaces", "SSO & compliance", "Custom integrations", "SLA guarantee", "Dedicated manager"],
    popular: false,
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState<string | null>(null);

  const currentPlan = user?.subscriptionPlan ?? "free";

  function handleUpgrade(planId: string) {
    if (!user) return;
    updateUser({ subscriptionPlan: planId as typeof user.subscriptionPlan });
    setUpgradeTarget(null);
    toast.success(`Upgraded to ${planId} plan!`);
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push(ROUTES.SETTINGS)} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
            <Crown className="h-6 w-6 text-[hsl(var(--primary))]" /> Subscription
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            Current plan: <span className="font-semibold text-[hsl(var(--primary))] capitalize">{currentPlan}</span>
          </p>
        </div>
      </div>

      {/* Current plan banner */}
      <Card className="border-[hsl(var(--primary))]/30 bg-[hsl(var(--background-subtle))]">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl lifekit-gradient">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[hsl(var(--text-primary))] capitalize">{currentPlan} Plan</p>
            <p className="text-sm text-[hsl(var(--text-secondary))]">
              {currentPlan === "free" ? "Upgrade to unlock more features" : "Active subscription"}
            </p>
          </div>
          {currentPlan !== "free" && (
            <Button variant="outline" size="sm" onClick={() => setCancelOpen(true)}>
              Cancel plan
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Plan grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map(plan => {
          const isCurrent = currentPlan === plan.id;
          return (
            <Card key={plan.id} className={cn(
              "relative",
              plan.popular && "border-[hsl(var(--primary))] shadow-[var(--shadow-purple)]",
              isCurrent && "border-green-400"
            )}>
              {plan.popular && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>Popular</Badge>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="success">Current</Badge>
                </div>
              )}
              <CardContent className="p-5">
                <h3 className="font-bold text-[hsl(var(--text-primary))]">{plan.name}</h3>
                <div className="my-3">
                  <span className="text-3xl font-black text-[hsl(var(--text-primary))]">{plan.price}</span>
                  <span className="text-sm text-[hsl(var(--text-secondary))]">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-[hsl(var(--text-secondary))]">
                      <CheckCircle className="h-3.5 w-3.5 text-[hsl(var(--success))] shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                ) : plan.id === "enterprise" ? (
                  <Button variant="outline" className="w-full" onClick={() => router.push(ROUTES.CONTACT)}>Contact Sales</Button>
                ) : (
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setUpgradeTarget(plan.id)}
                  >
                    {PLANS.findIndex(p => p.id === currentPlan) > PLANS.findIndex(p => p.id === plan.id) ? "Downgrade" : "Upgrade"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ConfirmationDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel your subscription?"
        description="You'll keep access until the end of your billing period, then be downgraded to the Free plan."
        confirmLabel="Yes, cancel"
        onConfirm={() => { updateUser({ subscriptionPlan: "free" }); toast("Subscription cancelled. You're now on Free."); }}
        variant="warning"
      />

      <ConfirmationDialog
        open={!!upgradeTarget}
        onOpenChange={v => !v && setUpgradeTarget(null)}
        title={`Switch to ${upgradeTarget} plan?`}
        description="Your plan will be updated immediately. Billing will be prorated."
        confirmLabel="Confirm change"
        onConfirm={() => { if (upgradeTarget) handleUpgrade(upgradeTarget); }}
        variant="default"
      />
    </div>
  );
}
