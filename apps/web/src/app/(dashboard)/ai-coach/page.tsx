"use client";

import { Bot, Brain, Target, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AICoachPanel } from "@/components/ai/ai-coach-panel";
import { useAICoachStore } from "@/stores/ai-coach-store";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";

const AGENT_QUICK_LINKS = [
  { label: "Career Agent",  desc: "Job search & career planning",   href: ROUTES.AGENTS + "/agent-career",   color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  { label: "Finance Agent", desc: "Savings, budgeting & investing",  href: ROUTES.AGENTS + "/agent-finance",  color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  { label: "Health Agent",  desc: "Fitness & wellness planning",     href: ROUTES.AGENTS + "/agent-health",   color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
  { label: "Travel Agent",  desc: "Trip planning & travel goals",    href: ROUTES.AGENTS + "/agent-travel",   color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300" },
  { label: "Business Agent",desc: "Startup & business strategy",     href: ROUTES.AGENTS + "/agent-business", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
];

export default function AICoachPage() {
  const router = useRouter();
  const { addMessage } = useAICoachStore();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
          <Bot className="h-7 w-7 text-[hsl(var(--primary))]" /> AI Coach
        </h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Your personal AI guide for goal execution, planning and decision-making.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat panel */}
        <div className="lg:col-span-2 h-[600px] rounded-xl border border-[hsl(var(--border))] overflow-hidden">
          <AICoachPanel />
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* AI Planner link */}
          <Card className="border-[hsl(var(--primary))]/30 bg-[hsl(var(--background-subtle))]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-[hsl(var(--primary))]" />
                <p className="text-sm font-semibold text-[hsl(var(--primary))]">AI Planner</p>
              </div>
              <p className="text-xs text-[hsl(var(--text-secondary))] mb-3">Generate and compare full mission execution plans with the AI Planner.</p>
              <Button size="sm" variant="outline" className="w-full" onClick={() => router.push(ROUTES.AI_PLANNER)}>
                Open AI Planner
              </Button>
            </CardContent>
          </Card>

          {/* Context indicators */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-[hsl(var(--primary))]" />
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">Active Context</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 px-2.5 py-1 w-fit">
                  <Brain className="h-3 w-3 text-purple-600 dark:text-purple-300" />
                  <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">Memory active</span>
                </div>
                <p className="text-xs text-[hsl(var(--text-secondary))]">3 missions in context · 2 memories loaded</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
