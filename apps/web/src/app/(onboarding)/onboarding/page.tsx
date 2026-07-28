"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Zap, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/stores/auth-store";
import { generateMissionPlan } from "@/lib/api/missions";
import { CATEGORIES } from "@/constants/categories";
import { ROUTES } from "@/constants/routes";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Category } from "@/types/common";
import type { UserType } from "@/types/user";

const TOTAL_STEPS = 7;

interface OnboardingState {
  userType: UserType | null;
  focusAreas: Category[];
  primaryGoal: string;
  timeline: string;
  weeklyHours: number;
  notificationPreference: "all" | "important" | "none";
}

const USER_TYPES: { value: UserType; label: string; emoji: string; desc: string }[] = [
  { value: "professional", label: "Young Professional", emoji: "💼", desc: "Career growth, upskilling, financial planning" },
  { value: "student",      label: "Student",            emoji: "🎓", desc: "Learning, internships, certifications" },
  { value: "founder",      label: "Founder",            emoji: "🚀", desc: "Business planning, startup execution" },
  { value: "family",       label: "Family",             emoji: "👨‍👩‍👧", desc: "Health, travel, shared goals" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [step, setStep] = React.useState(1);
  const [state, setState] = React.useState<OnboardingState>({
    userType: null, focusAreas: [], primaryGoal: "", timeline: "6 months", weeklyHours: 10, notificationPreference: "important",
  });
  const [generatedPlan, setGeneratedPlan] = React.useState<Awaited<ReturnType<typeof generateMissionPlan>> | null>(null);
  const [isAnalysing, setIsAnalysing] = React.useState(false);
  const [analysisStep, setAnalysisStep] = React.useState(0);

  const analysisSteps = ["Analysing your goal…", "Understanding constraints…", "Identifying milestones…", "Preparing your first mission…"];

  async function runAnalysis() {
    setIsAnalysing(true);
    for (let i = 0; i < analysisSteps.length; i++) {
      setAnalysisStep(i);
      await new Promise(r => setTimeout(r, 800));
    }
    const plan = await generateMissionPlan({
      goal: state.primaryGoal,
      category: state.focusAreas[0] ?? "career",
      weeklyAvailableHours: state.weeklyHours,
    });
    setGeneratedPlan(plan);
    setIsAnalysing(false);
    setStep(7);
  }

  function nextStep() {
    if (step === 5) { setStep(6); runAnalysis(); return; }
    if (step < TOTAL_STEPS) setStep(s => s + 1);
  }
  function prevStep() { if (step > 1) setStep(s => s - 1); }

  function canProceed() {
    if (step === 2) return !!state.userType;
    if (step === 3) return state.focusAreas.length > 0;
    if (step === 4) return state.primaryGoal.trim().length >= 10;
    return true;
  }

  function finishOnboarding() {
    updateUser({ userType: state.userType!, focusAreas: state.focusAreas, onboardingCompleted: true });
    toast.success("Mission created! Welcome to LifeKit.");
    router.push(ROUTES.MISSIONS);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background-subtle))]">
      {/* Header */}
      <header className="flex h-16 items-center px-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg lifekit-gradient"><Zap className="h-4 w-4 text-white" /></div>
          <span className="font-bold text-xl lifekit-gradient-text">LifeKit</span>
        </div>
        {step < 7 && (
          <div className="flex-1 mx-8 max-w-xs">
            <Progress value={(step / (TOTAL_STEPS - 1)) * 100} />
          </div>
        )}
        <span className="text-sm text-[hsl(var(--text-secondary))] ml-auto">Step {Math.min(step, 5)} of 5</span>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

              {/* Step 1: Welcome */}
              {step === 1 && (
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl lifekit-gradient">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <h1 className="text-3xl font-black text-[hsl(var(--text-primary))]">Welcome{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}!</h1>
                  <p className="mt-3 text-[hsl(var(--text-secondary))] text-lg leading-relaxed max-w-md mx-auto">
                    LifeKit turns your goals into structured Life Missions — complete with AI-powered roadmaps, matched resources, and real progress tracking.
                  </p>
                  <p className="mt-4 text-sm text-[hsl(var(--text-secondary))]">This setup takes about 2 minutes and personalises your entire experience.</p>
                  <Button className="mt-8" size="lg" onClick={nextStep} rightIcon={<ChevronRight className="h-4 w-4" />}>Let's get started</Button>
                </div>
              )}

              {/* Step 2: User type */}
              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-2">Which best describes you?</h2>
                  <p className="text-[hsl(var(--text-secondary))] mb-6">This helps us personalise your missions, recommendations and marketplace.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {USER_TYPES.map(({ value, label, emoji, desc }) => (
                      <button
                        key={value}
                        onClick={() => setState(s => ({ ...s, userType: value }))}
                        className={cn(
                          "rounded-xl border-2 p-4 text-left transition-all",
                          state.userType === value ? "border-[hsl(var(--primary))] bg-[hsl(var(--secondary))]" : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50"
                        )}
                      >
                        <div className="text-2xl mb-2">{emoji}</div>
                        <p className="font-semibold text-sm text-[hsl(var(--text-primary))]">{label}</p>
                        <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">{desc}</p>
                        {state.userType === value && <Check className="h-4 w-4 text-[hsl(var(--primary))] mt-2" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Focus areas */}
              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-2">What are you focused on?</h2>
                  <p className="text-[hsl(var(--text-secondary))] mb-6">Select all that apply. You can change this later.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.filter(c => c.value !== "lifestyle").map((cat) => {
                      const selected = state.focusAreas.includes(cat.value);
                      return (
                        <button
                          key={cat.value}
                          onClick={() => setState(s => ({
                            ...s,
                            focusAreas: selected ? s.focusAreas.filter(f => f !== cat.value) : [...s.focusAreas, cat.value]
                          }))}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg border-2 px-3 py-2.5 text-sm transition-all text-left",
                            selected ? "border-[hsl(var(--primary))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]" : "border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--primary))]/50"
                          )}
                        >
                          <span className={cn("w-4 h-4 rounded border-2 flex items-center justify-center shrink-0",
                            selected ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]" : "border-[hsl(var(--border))]"
                          )}>
                            {selected && <Check className="h-2.5 w-2.5 text-white" />}
                          </span>
                          <span className="font-medium">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 4: Primary goal */}
              {step === 4 && (
                <div>
                  <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-2">What's your primary goal?</h2>
                  <p className="text-[hsl(var(--text-secondary))] mb-6">Be as specific as possible. Our AI will use this to build your first mission.</p>
                  <Textarea
                    value={state.primaryGoal}
                    onChange={e => setState(s => ({ ...s, primaryGoal: e.target.value }))}
                    placeholder="e.g. I want to become a software engineer within six months and land a job at a top tech company."
                    rows={4}
                    className="text-base"
                    autoFocus
                  />
                  <p className="mt-2 text-xs text-[hsl(var(--text-secondary))]">{state.primaryGoal.length} characters · minimum 10 required</p>
                  <div className="mt-4 p-3 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]">
                    <p className="text-xs text-[hsl(var(--text-secondary))]">💡 <strong>Tip:</strong> Include your desired outcome, timeline, and any constraints like time or budget.</p>
                  </div>
                </div>
              )}

              {/* Step 5: Preferences */}
              {step === 5 && (
                <div>
                  <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-2">A few quick preferences</h2>
                  <p className="text-[hsl(var(--text-secondary))] mb-6">This helps us plan realistically for your situation.</p>
                  <div className="space-y-5">
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--text-primary))] mb-2">Desired completion timeline</p>
                      <div className="flex flex-wrap gap-2">
                        {["1 month", "3 months", "6 months", "1 year", "2+ years"].map(t => (
                          <button key={t} onClick={() => setState(s => ({ ...s, timeline: t }))}
                            className={cn("rounded-full border px-3 py-1.5 text-sm transition-colors",
                              state.timeline === t ? "border-[hsl(var(--primary))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]" : "border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--primary))]/50"
                            )}>{t}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--text-primary))] mb-2">Hours available per week: <strong>{state.weeklyHours}h</strong></p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[hsl(var(--text-secondary))]">1h</span>
                        <input type="range" min={1} max={40} value={state.weeklyHours} onChange={e => setState(s => ({ ...s, weeklyHours: +e.target.value }))}
                          className="flex-1 accent-[hsl(var(--primary))]" />
                        <span className="text-xs text-[hsl(var(--text-secondary))]">40h</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--text-primary))] mb-2">Notification preference</p>
                      <div className="flex flex-wrap gap-2">
                        {[{ v: "all" as const, l: "All updates" }, { v: "important" as const, l: "Important only" }, { v: "none" as const, l: "None" }].map(({ v, l }) => (
                          <button key={v} onClick={() => setState(s => ({ ...s, notificationPreference: v }))}
                            className={cn("rounded-full border px-3 py-1.5 text-sm transition-colors",
                              state.notificationPreference === v ? "border-[hsl(var(--primary))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]" : "border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]"
                            )}>{l}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: AI Analysis */}
              {step === 6 && (
                <div className="text-center py-8">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl lifekit-gradient">
                    <Loader2 className="h-10 w-10 text-white animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-3">Building your first mission…</h2>
                  <div className="space-y-2 mt-6">
                    {analysisSteps.map((s, i) => (
                      <div key={s} className={cn("flex items-center gap-2 text-sm rounded-lg px-4 py-2 transition-all",
                        i < analysisStep ? "text-[hsl(var(--success))]" : i === analysisStep ? "text-[hsl(var(--primary))] bg-[hsl(var(--secondary))]" : "text-[hsl(var(--text-secondary))]"
                      )}>
                        {i < analysisStep ? <Check className="h-4 w-4" /> : i === analysisStep ? <Loader2 className="h-4 w-4 animate-spin" /> : <div className="h-4 w-4 rounded-full border-2 border-[hsl(var(--border))]" />}
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 7: Mission preview */}
              {step === 7 && generatedPlan && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600"><Check className="h-4 w-4" /></div>
                    <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Your mission is ready!</h2>
                  </div>
                  <Card className="border-[hsl(var(--primary))]/30">
                    <CardContent className="p-5 space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-[hsl(var(--primary))] uppercase tracking-wide">Mission</p>
                        <h3 className="text-lg font-bold text-[hsl(var(--text-primary))] mt-1">{generatedPlan.title}</h3>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide mb-1">Goal</p>
                        <p className="text-sm text-[hsl(var(--text-primary))]">{generatedPlan.goal}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide mb-2">Milestones</p>
                        <div className="space-y-2">
                          {generatedPlan.milestones.slice(0, 4).map((m, i) => (
                            <div key={m.id ?? i} className="flex items-start gap-2">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] text-xs font-bold">{i + 1}</span>
                              <p className="text-sm text-[hsl(var(--text-primary))]">{m.title}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[hsl(var(--text-secondary))] pt-2 border-t border-[hsl(var(--border))]">
                        <span>⏱ {generatedPlan.estimatedDurationWeeks} weeks</span>
                        <span>🎯 {generatedPlan.successMetrics.length} success metrics</span>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button className="flex-1" onClick={finishOnboarding} rightIcon={<ChevronRight className="h-4 w-4" />}>Create Mission</Button>
                    <Button variant="outline" onClick={() => setStep(4)}>Edit details</Button>
                    <Button variant="ghost" onClick={() => runAnalysis()}>Regenerate</Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {step !== 6 && step !== 7 && (
            <div className="flex items-center justify-between mt-8">
              <Button variant="ghost" onClick={prevStep} disabled={step === 1} leftIcon={<ChevronLeft className="h-4 w-4" />}>Back</Button>
              <Button onClick={nextStep} disabled={!canProceed()} rightIcon={step < 5 ? <ChevronRight className="h-4 w-4" /> : undefined}>
                {step === 5 ? "Generate my mission" : "Continue"}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
