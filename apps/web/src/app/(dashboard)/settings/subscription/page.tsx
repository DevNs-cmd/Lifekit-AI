"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, CheckCircle, ArrowLeft, Zap, CreditCard, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { post } from "@/lib/api/client";

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
  const [isUpgrading, setIsUpgrading] = useState(false);

  // States for Sandbox Payment Modal
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [sandboxData, setSandboxData] = useState<{
    orderId: string;
    amount: number;
    planId: string;
  } | null>(null);

  const currentPlan = user?.subscriptionPlan ?? "free";

  async function handleUpgrade(planId: string) {
    if (!user) return;
    setIsUpgrading(true);
    const toastId = toast.loading(`Preparing checkout for ${planId}...`);

    try {
      // 1. Request Order from Backend
      const order: any = await post("/billing/subscription/create-order", { planId });
      toast.dismiss(toastId);

      if (order.isMock) {
        // 2a. Open Sandbox Modal
        setSandboxData({
          orderId: order.orderId,
          amount: order.amount,
          planId,
        });
        setSandboxOpen(true);
      } else {
        // 2b. Open Real Razorpay script checkout
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          toast.error("Failed to load payment gateway checkout script.");
          return;
        }

        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "LifeKit",
          description: `${planId.toUpperCase()} Plan Subscription`,
          order_id: order.orderId,
          handler: async function (response: any) {
            const verifyId = toast.loading("Verifying payment...");
            try {
              await post("/billing/subscription/verify", {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                planId,
                isMock: false,
              });
              updateUser({ subscriptionPlan: planId as any });
              toast.dismiss(verifyId);
              toast.success(`Successfully upgraded to ${planId.toUpperCase()}!`);
            } catch {
              toast.dismiss(verifyId);
              toast.error("Payment verification failed.");
            }
          },
          prefill: {
            name: user?.fullName,
            email: user?.email,
          },
          theme: {
            color: "#8B5CF6",
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(`Checkout failed: ${err.message || "Please try again."}`);
    } finally {
      setIsUpgrading(false);
      setUpgradeTarget(null);
    }
  }

  async function handleCancelSubscription() {
    const toastId = toast.loading("Cancelling subscription...");
    try {
      await post("/billing/subscription/cancel", {});
      updateUser({ subscriptionPlan: "free" });
      toast.dismiss(toastId);
      toast.success("Subscription cancelled. You're now on Free.");
    } catch {
      toast.dismiss(toastId);
      toast.error("Failed to cancel subscription on the server.");
    } finally {
      setCancelOpen(false);
    }
  }

  async function handleSandboxSuccess() {
    if (!sandboxData) return;
    setSandboxOpen(false);
    const toastId = toast.loading("Simulating sandbox payment verification...");
    try {
      // Generate a mock payment ID
      const randomHex = Math.random().toString(36).substring(2, 14);
      const mockPaymentId = `pay_mock_${randomHex}`;
      
      await post("/billing/subscription/verify", {
        orderId: sandboxData.orderId,
        paymentId: mockPaymentId,
        planId: sandboxData.planId,
        isMock: true,
      });
      updateUser({ subscriptionPlan: sandboxData.planId as any });
      toast.dismiss(toastId);
      toast.success(`Successfully upgraded to ${sandboxData.planId.toUpperCase()} (Sandbox)!`);
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(`Verification failed: ${err.message || "Please try again."}`);
    } finally {
      setSandboxData(null);
    }
  }

  function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
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
                    disabled={isUpgrading}
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
        onConfirm={handleCancelSubscription}
        variant="warning"
      />

      <ConfirmationDialog
        open={!!upgradeTarget}
        onOpenChange={v => !v && setUpgradeTarget(null)}
        title={`Switch to ${upgradeTarget} plan?`}
        description="Your plan will be updated immediately. Billing will be handled securely via Razorpay."
        confirmLabel="Confirm change"
        onConfirm={() => { if (upgradeTarget) handleUpgrade(upgradeTarget); }}
        variant="default"
      />

      {/* Sandbox Payment Modal */}
      <Dialog open={sandboxOpen} onOpenChange={(v) => !v && setSandboxOpen(false)}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 mb-2">
              <CreditCard className="h-6 w-6 animate-pulse" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">
              Razorpay Sandbox (Simulation)
            </DialogTitle>
            <DialogDescription>
              We detected that live Razorpay API keys are not configured in your <code className="bg-[hsl(var(--secondary))] px-1.5 py-0.5 rounded text-xs">.env</code>. You can simulate the payment status below.
            </DialogDescription>
          </DialogHeader>

          {/* Payment info card */}
          <div className="my-5 rounded-xl border border-purple-200 dark:border-purple-900/30 bg-purple-50/30 dark:bg-purple-950/10 p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[hsl(var(--text-secondary))]">Selected Plan</span>
                <span className="font-semibold text-purple-700 dark:text-purple-400 capitalize">{sandboxData?.planId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--text-secondary))]">Amount (INR)</span>
                <span className="font-black text-[hsl(var(--text-primary))]">
                  ₹{sandboxData ? sandboxData.amount / 100 : 0}.00
                </span>
              </div>
              <div className="flex justify-between text-xs border-t border-purple-200 dark:border-purple-900/30 pt-2 mt-2">
                <span className="text-[hsl(var(--text-secondary))]">Order ID</span>
                <span className="font-mono text-[hsl(var(--text-secondary))]">{sandboxData?.orderId}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl text-sm font-semibold hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20 dark:hover:text-red-400"
              onClick={() => {
                setSandboxOpen(false);
                setSandboxData(null);
                toast.error("Payment cancelled by user.");
              }}
            >
              Simulate Failure
            </Button>
            <Button
              className="flex-1 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleSandboxSuccess}
            >
              Simulate Success
            </Button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-secondary))] mt-3 justify-center">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>This screen only shows in development mode</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
