"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, RefreshCw, ArrowLeft, CheckCircle, Plus, Minus, TrendingDown, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMissionStore } from "@/stores";
import { missionsApi } from "@/lib/api";
import { useEffect } from "react";

type PlanAction = "generate" | "optimise" | "reduce" | "accelerate";

const PLAN_CHANGES = [
  { type: "added" as const, description: "Added daily 30-minute coding practice task", field: "task" },
  { type: "changed" as const, description: "Moved ML milestone from Month 3 to Month 2", field: "timeline", before: "Month 3", after: "Month 2" },
  { type: "removed" as const, description: "Removed redundant 'Read documentation' tasks (replaced by project-based learning)", field: "task" },
  { type: "changed" as const, description: "Increased weekly focus from 15h to 18h to hit deadline", field: "hours", before: "15h/week", after: "18h/week" },
];

export default function AIPlannerPage() {
  const router = useRouter();
  const { cachedMissions, setCachedMissions } = useMissionStore();
  const [selectedMission, setSelectedMission] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await missionsApi.getMissions();
        setCachedMissions(data);
        if (data.length > 0 && !selectedMission) {
          setSelectedMission(data[0].id);
        }
      } catch {
        // ignore
      }
    }
    load();
  }, [setCachedMissions, selectedMission]);

  const mission = cachedMissions.find(m => m.id === selectedMission);

  async function runAction(action: PlanAction) {
    setIsGenerating(true);
    setShowComparison(false);
    await new Promise(r => setTimeout(r, 2000));
    setIsGenerating(false);
    setShowComparison(true);
    toast.success("New plan generated. Review the changes below.");
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push(ROUTES.AI_COACH)} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
            <Zap className="h-6 w-6 text-[hsl(var(--primary))]" /> AI Planner
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">Generate, optimise and compare mission execution plans.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left panel — mission selector + actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Select Mission</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedMission} onValueChange={setSelectedMission}>
                <SelectTrigger><SelectValue placeholder="Choose a mission" /></SelectTrigger>
                <SelectContent>
                  {cachedMissions.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {mission && (
                <div className="rounded-lg bg-[hsl(var(--secondary))] p-3 text-xs space-y-1">
                  <p className="font-semibold text-[hsl(var(--text-primary))]">{mission.progress}% complete</p>
                  <p className="text-[hsl(var(--text-secondary))]">{mission.milestones.length} milestones</p>
                  <Progress value={mission.progress} className="h-1 mt-1" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Planner Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { id: "generate" as PlanAction, label: "Generate Plan", icon: Zap, desc: "Build a full plan from scratch" },
                { id: "optimise" as PlanAction, label: "Optimise Timeline", icon: Clock, desc: "Balance workload and deadlines" },
                { id: "reduce" as PlanAction, label: "Reduce Workload", icon: TrendingDown, desc: "Remove non-essential tasks" },
                { id: "accelerate" as PlanAction, label: "Accelerate Goal", icon: TrendingUp, desc: "Push for an earlier target date" },
              ].map(({ id, label, icon: Icon, desc }) => (
                <button
                  key={id}
                  onClick={() => runAction(id)}
                  disabled={!selectedMission || isGenerating}
                  className="flex w-full items-start gap-3 rounded-lg border border-[hsl(var(--border))] p-3 text-left hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--secondary))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[hsl(var(--text-primary))]">{label}</p>
                    <p className="text-[10px] text-[hsl(var(--text-secondary))]">{desc}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main panel */}
        <div className="lg:col-span-2 space-y-4">
          {isGenerating ? (
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl lifekit-gradient">
                  <RefreshCw className="h-8 w-8 text-white animate-spin" />
                </div>
                <h3 className="font-semibold text-[hsl(var(--text-primary))]">AI is analysing your plan…</h3>
                {["Reading current milestones", "Calculating optimal timeline", "Identifying improvements", "Generating comparison"].map((s, i) => (
                  <div key={s} className="flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))] justify-center">
                    <RefreshCw className="h-3 w-3 animate-spin" />{s}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : showComparison ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Plan Comparison</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">Current Plan</Badge>
                    <Badge>Suggested Plan</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {PLAN_CHANGES.map((change, i) => (
                  <div key={i} className={cn(
                    "flex items-start gap-3 rounded-lg p-3 text-sm",
                    change.type === "added" ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" :
                    change.type === "removed" ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" :
                    "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                  )}>
                    {change.type === "added" ? <Plus className="h-4 w-4 text-green-600 shrink-0 mt-0.5" /> :
                     change.type === "removed" ? <Minus className="h-4 w-4 text-red-600 shrink-0 mt-0.5" /> :
                     <RefreshCw className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />}
                    <div>
                      <p className={cn("font-medium",
                        change.type === "added" ? "text-green-700 dark:text-green-300" :
                        change.type === "removed" ? "text-red-700 dark:text-red-300" :
                        "text-blue-700 dark:text-blue-300"
                      )}>
                        {change.type === "added" ? "Added" : change.type === "removed" ? "Removed" : "Changed"}
                      </p>
                      <p className="text-[hsl(var(--text-secondary))]">{change.description}</p>
                      {change.before && change.after && (
                        <p className="text-xs mt-1 text-[hsl(var(--text-secondary))]">
                          <span className="line-through">{change.before}</span> → <strong>{change.after}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => setApplyOpen(true)} className="flex-1">Apply Changes</Button>
                  <Button variant="outline" onClick={() => setShowComparison(false)}>Discard</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] mb-4">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-[hsl(var(--text-primary))]">Select a mission and run a planner action</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] mt-2 max-w-xs mx-auto">
                  The AI Planner will analyse your current plan and suggest optimisations to help you hit your goals.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Current milestones */}
          {mission && !isGenerating && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Current Roadmap — {mission.title}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {mission.milestones.length === 0 ? (
                  <p className="text-sm text-[hsl(var(--text-secondary))]">No milestones yet. Generate a plan to get started.</p>
                ) : (
                  mission.milestones.map((ms, i) => (
                    <div key={ms.id} className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                        ms.status === "completed" ? "border-green-400 bg-green-400 text-white" :
                        ms.status === "in-progress" ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]" :
                        "border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]"
                      )}>
                        {ms.status === "completed" ? <CheckCircle className="h-4 w-4" /> : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[hsl(var(--text-primary))] truncate">{ms.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex-1 h-1 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                            <div className="h-full bg-[hsl(var(--primary))] rounded-full" style={{ width: `${ms.progress}%` }} />
                          </div>
                          <span className="text-[10px] text-[hsl(var(--text-secondary))] shrink-0">{ms.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right panel — risks + suggestions */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">AI Analysis</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {mission ? (
                <>
                  <div className="rounded-lg bg-[hsl(var(--background-subtle))] border border-[hsl(var(--border))] p-3">
                    <p className="font-semibold text-[hsl(var(--text-primary))] mb-1">Overall assessment</p>
                    <p className="text-[hsl(var(--text-secondary))] text-xs leading-relaxed">
                      Your mission is <strong>{mission.progress}% complete</strong>. At the current pace, you&apos;ll reach your goal approximately on time. Consider increasing weekly focus to reduce risk.
                    </p>
                  </div>
                  {mission.risks.map(risk => (
                    <div key={risk.id} className="flex items-start gap-2">
                      <span className={cn("mt-0.5 h-2 w-2 rounded-full shrink-0",
                        risk.severity === "high" ? "bg-red-500" :
                        risk.severity === "medium" ? "bg-amber-500" : "bg-green-500"
                      )} />
                      <div>
                        <p className="text-xs font-medium text-[hsl(var(--text-primary))] capitalize">{risk.severity} risk</p>
                        <p className="text-xs text-[hsl(var(--text-secondary))]">{risk.description}</p>
                        {risk.mitigation && <p className="text-xs text-[hsl(var(--primary))] mt-0.5">{risk.mitigation}</p>}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-[hsl(var(--text-secondary))] text-xs">Select a mission to see AI analysis.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmationDialog
        open={applyOpen}
        onOpenChange={setApplyOpen}
        title="Apply AI plan changes?"
        description="The suggested changes will be applied to your mission. Your current plan will be backed up and can be viewed in the Activity tab."
        confirmLabel="Apply changes"
        variant="default"
        onConfirm={() => { setShowComparison(false); toast.success("Plan updated successfully!"); }}
      />
    </div>
  );
}
