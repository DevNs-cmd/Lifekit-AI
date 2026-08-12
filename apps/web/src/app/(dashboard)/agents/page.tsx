"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Briefcase, TrendingUp, Heart, Globe, Building2, Sparkles, type LucideProps } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_AGENTS } from "@/lib/api/ai";
import { ROUTES } from "@/constants/routes";

const DOMAIN_CONFIG: Record<string, { color: string; hex: string; bg: string; icon: React.ComponentType<LucideProps>; tagline: string }> = {
  career:   { color: "dark:text-blue-200",    hex: "#315a9b", bg: "bg-[#edf3ff] dark:bg-blue-900/30",    icon: Briefcase,  tagline: "Career growth · Job search · Interview prep" },
  finance:  { color: "dark:text-emerald-200", hex: "#267052", bg: "bg-[#eaf5ef] dark:bg-emerald-900/30", icon: TrendingUp, tagline: "Savings · Budgeting · Investments" },
  health:   { color: "dark:text-rose-200",    hex: "#9a484d", bg: "bg-[#fff0f0] dark:bg-rose-900/30",    icon: Heart,      tagline: "Fitness · Nutrition · Wellness" },
  travel:   { color: "dark:text-cyan-200",    hex: "#277083", bg: "bg-[#eaf7fa] dark:bg-cyan-900/30",    icon: Globe,      tagline: "Trips · Itineraries · Travel budgets" },
  business: { color: "dark:text-orange-200",  hex: "#925a2f", bg: "bg-[#fff3e9] dark:bg-orange-900/30", icon: Building2,  tagline: "Startup strategy · Market research · Funding" },
};

export default function AgentsPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[hsl(var(--primary))]"><Sparkles className="h-3.5 w-3.5" />Specialist intelligence</div>
          <h1 className="text-3xl font-black tracking-[-0.035em] text-[hsl(var(--text-primary))]">Your AI team</h1>
          <p className="mt-1 text-sm text-[hsl(var(--text-secondary))]">Choose a specialist that understands your goals, missions, and context.</p>
        </div>
        <Badge variant="secondary" className="w-fit px-3 py-1">{MOCK_AGENTS.filter(agent => agent.isAvailable).length} agents ready</Badge>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {MOCK_AGENTS.map((agent, index) => {
          const config = DOMAIN_CONFIG[agent.domain] ?? DOMAIN_CONFIG.career;
          const DomainIcon = config.icon;

          return (
            <Card
              key={agent.id}
              className={`group flex flex-col overflow-hidden hover:border-[hsl(var(--primary))]/30 lg:col-span-2 ${MOCK_AGENTS.length % 3 === 2 && index === MOCK_AGENTS.length - 2 ? "lg:col-start-2" : ""}`}
              onClick={() => router.push(`${ROUTES.AGENTS}/${agent.id}`)}
            >
              <CardContent className="flex min-h-[400px] flex-1 flex-col p-5">
                <div className="mb-4 flex items-start justify-between gap-2">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-black/[0.04] ${config.bg}`}><DomainIcon className={`h-6 w-6 ${config.color}`} style={{ color: config.hex }} /></div>
                  <Badge variant={agent.isAvailable ? "success" : "outline"} className="mt-1 shrink-0">{agent.isAvailable ? "Ready" : "Offline"}</Badge>
                </div>

                <h2 className="text-base font-bold text-[hsl(var(--text-primary))]">{agent.name}</h2>
                <p className={`mb-2 mt-0.5 text-xs font-semibold ${config.color}`} style={{ color: config.hex }}>{config.tagline}</p>
                <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[hsl(var(--text-secondary))] dark:text-gray-300">{agent.description}</p>

                <div className="flex-1">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--text-secondary))] dark:text-gray-400">What I can do</p>
                  <ul className="space-y-1.5">
                    {agent.capabilities.slice(0, 3).map(capability => (
                      <li key={capability} className="flex items-start gap-2 text-xs text-[hsl(var(--text-secondary))] dark:text-gray-300"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--primary))]/50" />{capability}</li>
                    ))}
                    {agent.capabilities.length > 3 && <li className="pl-3.5 text-xs text-[hsl(var(--text-secondary))] dark:text-gray-400">+{agent.capabilities.length - 3} more capabilities</li>}
                  </ul>
                </div>

              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
