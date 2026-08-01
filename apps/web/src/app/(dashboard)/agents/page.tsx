"use client";

import { useRouter } from "next/navigation";
import { Bot, ArrowRight, Briefcase, TrendingUp, Heart, Globe, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_AGENTS } from "@/lib/api/ai";
import { MOCK_MISSIONS } from "@/constants/mock-data";
import { ROUTES } from "@/constants/routes";
import { LucideProps } from "lucide-react";
import * as React from "react";

const DOMAIN_CONFIG: Record<string, {
  color: string;
  bg: string;
  icon: React.ComponentType<LucideProps>;
  tagline: string;
}> = {
  career:   { color: "text-blue-700 dark:text-blue-300",   bg: "bg-blue-100 dark:bg-blue-900/30",   icon: Briefcase,  tagline: "Career growth · Job search · Interview prep" },
  finance:  { color: "text-green-700 dark:text-green-300", bg: "bg-green-100 dark:bg-green-900/30", icon: TrendingUp, tagline: "Savings · Budgeting · Investments" },
  health:   { color: "text-red-700 dark:text-red-300",     bg: "bg-red-100 dark:bg-red-900/30",     icon: Heart,      tagline: "Fitness · Nutrition · Wellness" },
  travel:   { color: "text-cyan-700 dark:text-cyan-300",   bg: "bg-cyan-100 dark:bg-cyan-900/30",   icon: Globe,      tagline: "Trips · Itineraries · Travel budgets" },
  business: { color: "text-orange-700 dark:text-orange-300",bg: "bg-orange-100 dark:bg-orange-900/30",icon: Building2, tagline: "Startup strategy · Market research · Funding" },
};

export default function AgentsPage() {
  const router = useRouter();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
          <Bot className="h-7 w-7 text-[hsl(var(--primary))]" /> Specialist AI Agents
        </h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Each agent is an expert in their domain — they use your mission context and memory to give personalised guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {MOCK_AGENTS.map((agent) => {
          const cfg = DOMAIN_CONFIG[agent.domain] ?? DOMAIN_CONFIG.career;
          const DomainIcon = cfg.icon;

          // Find missions related to this agent's categories
          const relatedMissions = MOCK_MISSIONS.filter(m =>
            agent.relatedCategories.includes(m.category) && m.status === "active"
          );

          return (
            <Card
              key={agent.id}
              className="hover:border-[hsl(var(--primary))]/40 hover:shadow-md transition-all group cursor-pointer flex flex-col"
              onClick={() => router.push(`${ROUTES.AGENTS}/${agent.id}`)}
            >
              <CardContent className="p-5 flex flex-col flex-1">
                {/* Agent avatar + status */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${cfg.bg}`}>
                    <DomainIcon className={`h-7 w-7 ${cfg.color}`} />
                  </div>
                  <Badge variant={agent.isAvailable ? "success" : "outline"} className="shrink-0 mt-1">
                    {agent.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </div>

                {/* Name + tagline */}
                <h3 className="font-bold text-base text-[hsl(var(--text-primary))] mb-0.5">{agent.name}</h3>
                <p className={`text-xs font-medium mb-2 ${cfg.color}`}>{cfg.tagline}</p>
                <p className="text-sm text-[hsl(var(--text-secondary))] mb-4 line-clamp-2 leading-relaxed">
                  {agent.description}
                </p>

                {/* Capabilities */}
                <div className="mb-4 flex-1">
                  <p className="text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide mb-2">
                    What I can do
                  </p>
                  <ul className="space-y-1.5">
                    {agent.capabilities.slice(0, 4).map((cap) => (
                      <li key={cap} className="flex items-start gap-2 text-xs text-[hsl(var(--text-secondary))]">
                        <span className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${cfg.bg} ${cfg.color}`} aria-hidden />
                        {cap}
                      </li>
                    ))}
                    {agent.capabilities.length > 4 && (
                      <li className="text-xs text-[hsl(var(--text-secondary))] pl-3.5">
                        +{agent.capabilities.length - 4} more
                      </li>
                    )}
                  </ul>
                </div>

                {/* Related missions */}
                {relatedMissions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide mb-1.5">
                      Active missions
                    </p>
                    <div className="flex flex-col gap-1">
                      {relatedMissions.slice(0, 2).map(m => (
                        <div key={m.id} className={`rounded-md px-2 py-1 text-xs font-medium truncate ${cfg.bg} ${cfg.color}`}>
                          {m.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <Button
                  size="sm"
                  className="w-full mt-auto"
                  disabled={!agent.isAvailable}
                  rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`${ROUTES.AGENTS}/${agent.id}`);
                  }}
                >
                  Start interaction
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background-subtle))] p-4 flex items-start gap-3">
        <Bot className="h-4 w-4 text-[hsl(var(--primary))] mt-0.5 shrink-0" />
        <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
          <span className="font-semibold text-[hsl(var(--text-primary))]">How agents work:</span> Each agent has full access to your active missions and Life Memory. Responses are always in context — not generic advice. Any changes to your missions require your explicit confirmation.
        </p>
      </div>
    </div>
  );
}
