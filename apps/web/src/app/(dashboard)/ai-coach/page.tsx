"use client";

import { Bot, Brain, Target, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AICoachPanel } from "@/components/ai/ai-coach-panel";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";

export default function AICoachPage() {
  const router = useRouter();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-black tracking-[-0.035em] text-[hsl(var(--text-primary))] flex items-center gap-2">
          <Bot className="h-7 w-7 text-[hsl(var(--primary))]" /> AI Coach
        </h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Your personal AI guide for goal execution, planning and decision-making.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-4 items-start">
        {/* Chat panel */}
        <div className="h-[500px] rounded-2xl border border-[hsl(var(--border))]/80 overflow-hidden shadow-[var(--shadow-md)] bg-[hsl(var(--card))]">
          <AICoachPanel />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
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
