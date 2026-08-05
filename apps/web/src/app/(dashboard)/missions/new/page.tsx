"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Sparkles, Loader2, Check, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FormField } from "@/components/shared/form-field";
import { CategoryBadge } from "@/components/shared/category-badge";
import { createMissionSchema, type CreateMissionFormData } from "@/lib/validation/schemas";
import { generateMissionPlan, createMission, updateMission } from "@/lib/api/missions";
import { useMissionStore } from "@/stores/mission-store";
import { CATEGORIES } from "@/constants/categories";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import type { GeneratedMissionPlan } from "@/types/mission";
import { formatDate } from "@/lib/utils";

import type { Category } from "@/types/common";

const TOTAL_STEPS = 4;

export default function NewMissionPage() {
  const router = useRouter();
  const { draftGoalInput } = useMissionStore();
  const [step, setStep] = React.useState(1);
  const [generatedPlan, setGeneratedPlan] = React.useState<GeneratedMissionPlan | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [genStep, setGenStep] = React.useState(0);
  const [isSaving, setIsSaving] = React.useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateMissionFormData>({
    resolver: zodResolver(createMissionSchema),
    defaultValues: { goal: draftGoalInput, budgetCurrency: "INR" },
  });

  const goal = watch("goal");
  const category = watch("category");

  const genSteps = ["Understanding goal…", "Identifying milestones…", "Calculating timeline…", "Finding resources…", "Preparing execution plan…"];

  async function handleGenerate(data: CreateMissionFormData) {
    setStep(2);
    setIsGenerating(true);
    try {
      const plan = await generateMissionPlan({ ...data, category: data.category as Category });
      setGeneratedPlan(plan);
      setStep(3);
    } catch {
      toast.error("Plan generation failed.");
      setStep(1);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleActivate() {
    if (!generatedPlan) return;
    setIsSaving(true);
    try {
      const mission = await createMission({ goal, category: category as Category });
      await updateMission(mission.id, { title: generatedPlan.title, description: generatedPlan.description });
      toast.success("Mission activated! Let's get to work.");
      router.push(ROUTES.MISSION_DETAIL(mission.id));
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveDraft() {
    if (!generatedPlan) return;
    setIsSaving(true);
    try {
      const mission = await createMission({ goal, category: category as Category });
      await updateMission(mission.id, { title: generatedPlan.title });
      toast.success("Saved as draft.");
      router.push(ROUTES.MISSIONS);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background-subtle))] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon-sm" onClick={() => router.back()} aria-label="Back"><ArrowLeft className="h-5 w-5" /></Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[hsl(var(--text-primary))]">Create New Mission</h1>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={(step / TOTAL_STEPS) * 100} className="flex-1 h-1.5" />
              <span className="text-xs text-[hsl(var(--text-secondary))] shrink-0">Step {step} of {TOTAL_STEPS}</span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

            {/* Step 1: Goal description */}
            {step === 1 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg lifekit-gradient"><Sparkles className="h-4 w-4 text-white" /></div>
                    <h2 className="text-lg font-bold text-[hsl(var(--text-primary))]">Describe your goal</h2>
                  </div>
                  <form onSubmit={handleSubmit(handleGenerate)} className="space-y-4">
                    <FormField label="What do you want to achieve?" htmlFor="goal" required error={errors.goal?.message} description="Be specific — include your desired outcome, timeframe and any constraints.">
                      <Textarea id="goal" rows={4} placeholder="e.g. I want to become a machine learning engineer within 6 months and land a job at a top AI company…" {...register("goal")} error={!!errors.goal} />
                    </FormField>
                    <FormField label="Category" htmlFor="category" required error={errors.category?.message}>
                      <Select onValueChange={v => setValue("category", v as CreateMissionFormData["category"])}>
                        <SelectTrigger id="category" error={!!errors.category}><SelectValue placeholder="Select a category" /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormField>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Target date" htmlFor="targetDate" error={errors.targetDate?.message}>
                        <Input id="targetDate" type="date" {...register("targetDate")} min={formatDate(new Date(), "yyyy-MM-dd")} />
                      </FormField>
                      <FormField label="Weekly hours available" htmlFor="weeklyHours" error={errors.weeklyAvailableHours?.message}>
                        <Input id="weeklyHours" type="number" min={1} max={168} placeholder="e.g. 10" {...register("weeklyAvailableHours")} />
                      </FormField>
                    </div>
                    <FormField label="Budget (optional)" htmlFor="budget">
                      <div className="flex gap-2">
                        <Select onValueChange={v => setValue("budgetCurrency", v)} defaultValue="INR">
                          <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INR">₹ INR</SelectItem>
                            <SelectItem value="USD">$ USD</SelectItem>
                            <SelectItem value="EUR">€ EUR</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input id="budget" type="number" placeholder="Amount" className="flex-1" {...register("budgetAmount")} />
                      </div>
                    </FormField>
                    <FormField label="Constraints (optional)" htmlFor="constraints" description="Time limitations, skills gaps, geographic restrictions…">
                      <Textarea id="constraints" rows={2} placeholder="e.g. Can only work on this on weekends…" {...register("constraints")} />
                    </FormField>
                    <Button type="submit" className="w-full" size="lg" disabled={!goal?.trim() || !category} rightIcon={<ChevronRight className="h-4 w-4" />}>
                      Generate AI Mission Plan
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Generation */}
            {step === 2 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl lifekit-gradient">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                  <h2 className="text-xl font-bold text-[hsl(var(--text-primary))] mb-6">Building your mission plan…</h2>
                  <div className="space-y-2 text-left">
                    {genSteps.map((s, i) => (
                      i > genStep ? null : (
                        <div
                          key={s}
                          className={`animate-slide-down-fade flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors ${i === genStep ? "bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]" : "text-[hsl(var(--success))]"}`}
                          style={{ animationDelay: `0ms` }}
                        >
                          {i < genStep
                            ? <Check className="h-4 w-4 shrink-0" />
                            : <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                          }
                          {s}
                        </div>
                      )
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review plan */}
            {step === 3 && generatedPlan && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600"><Check className="h-4 w-4" /></div>
                  <h2 className="text-xl font-bold text-[hsl(var(--text-primary))]">Your mission is ready</h2>
                </div>
                <Card className="border-[hsl(var(--primary))]/30">
                  <CardContent className="p-5 space-y-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-[hsl(var(--primary))] uppercase tracking-wide mb-1">Mission Title</p>
                        <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">{generatedPlan.title}</h3>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={() => { setStep(1); setGeneratedPlan(null); }}
                        disabled={isSaving}
                      >
                        Edit Details
                      </Button>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide mb-1">Category</p>
                      <CategoryBadge category={generatedPlan.category} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide mb-3">Roadmap ({generatedPlan.milestones.length} phases)</p>
                      <div className="relative">
                        {/* Vertical connector line */}
                        <div className="absolute left-3.5 top-4 bottom-4 w-0.5 bg-[hsl(var(--border))]" aria-hidden />
                        <div className="space-y-0">
                          {generatedPlan.milestones.map((m, i) => {
                            const isLast = i === generatedPlan.milestones.length - 1;
                            return (
                              <div key={m.id ?? i} className="relative flex gap-4 pb-5 last:pb-0">
                                {/* Node */}
                                <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--primary))] bg-[hsl(var(--card))] text-[hsl(var(--primary))] text-xs font-bold">
                                  {i + 1}
                                </div>
                                {/* Content */}
                                <div className={`flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background-subtle))] p-3 ${!isLast ? "mb-0" : ""}`}>
                                  <div className="flex items-start gap-2 mb-1">
                                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))] leading-snug">{m.title}</p>
                                  </div>
                                  {m.description && (
                                    <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">{m.description}</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide mb-2">Success Metrics</p>
                      <ul className="space-y-1">
                        {generatedPlan.successMetrics.map((m, i) => (
                          <li key={m.id ?? i} className="flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))]">
                            <Check className="h-3.5 w-3.5 text-[hsl(var(--success))]" />{m.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[hsl(var(--text-secondary))] pt-2 border-t border-[hsl(var(--border))]">
                      <span>⏱ ~{generatedPlan.estimatedDurationWeeks} weeks</span>
                      {generatedPlan.risks.length > 0 && <span>⚠ {generatedPlan.risks.length} identified risks</span>}
                    </div>
                  </CardContent>
                </Card>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="flex-1 sm:flex-none" onClick={handleActivate} loading={isSaving}>Activate Mission</Button>
                  <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>Save as Draft</Button>
                  <Button variant="outline" onClick={() => handleSubmit(handleGenerate)()} disabled={isSaving}>Regenerate</Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {step === 3 && (
          <div className="mt-4 flex justify-start">
            <Button variant="ghost" size="sm" onClick={() => { setStep(1); setGeneratedPlan(null); }} leftIcon={<ChevronLeft className="h-4 w-4" />}>Back to goal</Button>
          </div>
        )}
      </div>
    </div>
  );
}
