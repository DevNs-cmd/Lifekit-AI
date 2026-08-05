import { Target, Map, Bot, Sparkles, ShoppingBag, CheckSquare, Brain, Compass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { ProductExperience } from "@/components/marketing/page-experiences";
import { Reveal } from "@/components/marketing/premium-interactions";

const FEATURES = [
  { icon: Target,      title: "Life Mission Engine",       desc: "Every goal becomes a fully structured Life Mission — with milestones, success metrics, risk assessment and an execution roadmap." },
  { icon: Map,         title: "AI Life Planner",            desc: "Real-time AI planning that creates realistic timelines, adapts to your progress, and re-plans automatically when life changes." },
  { icon: Bot,         title: "Specialist AI Agents",       desc: "Five dedicated agents (Career, Finance, Health, Travel, Business) that provide expert guidance in their domain." },
  { icon: Sparkles,    title: "Recommendation Engine",      desc: "Contextual recommendations for courses, experts, products and opportunities — all matched to your specific mission stage." },
  { icon: ShoppingBag, title: "Life Marketplace",           desc: "A curated marketplace connecting you with the exact services, products and experts needed to execute your goals." },
  { icon: CheckSquare, title: "Execution Layer",            desc: "Task management that understands mission context — not just tasks, but why they matter and how they connect." },
  { icon: Brain,       title: "Life Memory",                desc: "Persistent AI memory that retains your preferences, decisions, achievements and context across every interaction." },
  { icon: Compass,     title: "Opportunity Engine",         desc: "Proactive discovery of jobs, internships, grants and opportunities that perfectly match your active missions." },
];

export default function ProductPage() {
  return (
    <div className="marketing-page-shell">
      <div className="mx-auto max-w-6xl">
        <div className="marketing-story-hero text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-black text-[hsl(var(--text-primary))]">The complete execution platform</h1>
          <p className="mt-4 text-lg text-[hsl(var(--text-secondary))] max-w-2xl mx-auto">
            LifeKit is not a productivity app. It&apos;s a full execution system — from goal to measurable outcome.
          </p>
        </div>
        <div className="marketing-content-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <Reveal key={title}><Card className="marketing-premium-card group h-full">
              <CardContent className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] mb-4 group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-[hsl(var(--text-primary))] mb-2">{title}</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">{desc}</p>
              </CardContent>
            </Card></Reveal>
          ))}
        </div>
        <div className="text-center">
          <Button size="lg" asChild><Link href={ROUTES.SIGN_UP}>Start building your missions</Link></Button>
        </div>
      </div>
      <ProductExperience />
    </div>
  );
}
