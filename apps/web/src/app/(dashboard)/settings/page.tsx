"use client";

import { useRouter } from "next/navigation";
import { Settings, User, Bot, Shield, Lock, Plug, CreditCard, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";

const SETTINGS_SECTIONS = [
  {
    title: "Preferences",
    items: [
      { label: "General",          desc: "Language, theme",      icon: Settings,    href: ROUTES.SETTINGS_GENERAL },
      { label: "Profile",          desc: "Name, phone, location, bio",           icon: User,        href: "/settings/profile" },
      { label: "AI Preferences",   desc: "Response style, planning depth",       icon: Bot,         href: ROUTES.SETTINGS_AI },
    ],
  },
  {
    title: "Privacy & Security",
    items: [
      { label: "Privacy",          desc: "Memory, data export, account deletion",icon: Shield,      href: ROUTES.SETTINGS_PRIVACY },
      { label: "Security",         desc: "Password, active sessions",       icon: Lock,        href: ROUTES.SETTINGS_SECURITY },
    ],
  },
  {
    title: "Billing",
    items: [
      { label: "Subscription",     desc: "Plan details, upgrade or cancel",      icon: CreditCard,  href: ROUTES.SETTINGS_SUBSCRIPTION },
      { label: "Billing & Invoices",desc: "Payment methods, invoice history",    icon: CreditCard,  href: ROUTES.SETTINGS_BILLING },
    ],
  },
  {
    title: "Integrations",
    items: [
      { label: "Integrations",     desc: "Connected apps and services",          icon: Plug,        href: ROUTES.SETTINGS_INTEGRATIONS },
    ],
  },
];

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Settings</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Manage your account, preferences and integrations.</p>
      </div>

      {SETTINGS_SECTIONS.map(section => (
        <div key={section.title} className="space-y-2">
          <p className="text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider px-1">{section.title}</p>
          <Card>
            <CardContent className="p-0 divide-y divide-[hsl(var(--border))]">
              {section.items.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.href)}
                    className="flex w-full items-center gap-4 px-4 py-3.5 hover:bg-[hsl(var(--background-subtle))] transition-colors text-left"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{item.label}</p>
                      <p className="text-xs text-[hsl(var(--text-secondary))] truncate">{item.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[hsl(var(--text-secondary))] shrink-0" />
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
