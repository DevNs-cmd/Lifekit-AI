import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";

const PLANS = [
  {
    name: "Free", price: "₹0", period: "", badge: null, primary: false, href: ROUTES.SIGN_UP, cta: "Get started free",
    features: [
      { label: "Active missions", value: "Up to 3" },
      { label: "AI planning", value: "Basic" },
      { label: "Marketplace access", value: true },
      { label: "AI Coach", value: "5 messages/day" },
      { label: "Memory", value: false },
      { label: "AI Agents", value: false },
      { label: "Analytics", value: "Basic" },
      { label: "Support", value: "Community" },
    ],
  },
  {
    name: "LifeKit Plus", price: "₹499", period: "/month", badge: "Most Popular", primary: true, href: ROUTES.SIGN_UP, cta: "Start Plus — free 14-day trial",
    features: [
      { label: "Active missions", value: "Up to 10" },
      { label: "AI planning", value: "Advanced" },
      { label: "Marketplace access", value: true },
      { label: "AI Coach", value: "Unlimited" },
      { label: "Memory", value: true },
      { label: "AI Agents", value: "All 5" },
      { label: "Analytics", value: "Advanced" },
      { label: "Support", value: "Priority email" },
    ],
  },
  {
    name: "LifeKit Pro", price: "₹999", period: "/month", badge: null, primary: false, href: ROUTES.SIGN_UP, cta: "Start Pro",
    features: [
      { label: "Active missions", value: "Unlimited" },
      { label: "AI planning", value: "Deep & custom" },
      { label: "Marketplace access", value: true },
      { label: "AI Coach", value: "Unlimited + voice" },
      { label: "Memory", value: "Extended" },
      { label: "AI Agents", value: "All 5 + custom" },
      { label: "Analytics", value: "Full + exports" },
      { label: "Support", value: "Dedicated manager" },
    ],
  },
  {
    name: "Enterprise", price: "Custom", period: "", badge: null, primary: false, href: ROUTES.CONTACT, cta: "Contact sales",
    features: [
      { label: "Active missions", value: "Unlimited" },
      { label: "AI planning", value: "Enterprise AI" },
      { label: "Marketplace access", value: "White-label" },
      { label: "AI Coach", value: "Custom models" },
      { label: "Memory", value: "Org-wide" },
      { label: "AI Agents", value: "Custom agents" },
      { label: "Analytics", value: "BI integration" },
      { label: "Support", value: "SLA + dedicated" },
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="py-16 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-[hsl(var(--text-primary))]">Simple, transparent pricing</h1>
          <p className="mt-4 text-lg text-[hsl(var(--text-secondary))] max-w-xl mx-auto">Start free. Upgrade when you need more power. Cancel any time.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => (
            <Card key={plan.name} className={plan.primary ? "border-[hsl(var(--primary))] shadow-[var(--shadow-purple)] relative" : ""}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge>{plan.badge}</Badge>
                </div>
              )}
              <CardContent className="p-6 flex flex-col h-full">
                <div>
                  <h2 className="font-bold text-[hsl(var(--text-primary))]">{plan.name}</h2>
                  <div className="mt-2 mb-6">
                    <span className="text-4xl font-black text-[hsl(var(--text-primary))]">{plan.price}</span>
                    <span className="text-sm text-[hsl(var(--text-secondary))]">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map(({ label, value }) => (
                      <li key={label} className="flex items-start justify-between gap-2 text-sm">
                        <span className="text-[hsl(var(--text-secondary))]">{label}</span>
                        <span className={value === false ? "text-[hsl(var(--muted-foreground))]" : "font-medium text-[hsl(var(--text-primary))] text-right"}>
                          {value === true ? <CheckCircle className="h-4 w-4 text-[hsl(var(--success))] inline" /> : value === false ? "—" : String(value)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button variant={plan.primary ? "default" : "outline"} className="w-full mt-auto" asChild>
                  <Link href={plan.href}>{plan.cta}<ArrowRight className="h-4 w-4 ml-1" /></Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-[hsl(var(--text-secondary))]">
          All prices in Indian Rupees (INR). GST applicable as per Indian tax laws. Prices shown are per user per month when billed monthly.
        </p>
      </div>
    </div>
  );
}
