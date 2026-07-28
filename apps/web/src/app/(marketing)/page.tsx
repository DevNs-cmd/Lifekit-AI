import Link from "next/link";
import { ArrowRight, CheckCircle, Zap, Bot, Target, Map, ShoppingBag, BarChart3, Brain, Compass, Sparkles, Users, GraduationCap, Briefcase, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";

const FLOW_STEPS = [
  { step: "1", title: "Describe Goal",       desc: "Tell LifeKit what you want to achieve — in plain language." },
  { step: "2", title: "AI Understands",       desc: "Our AI analyses your goal, context, timeline and constraints." },
  { step: "3", title: "Mission Created",      desc: "A structured Life Mission is generated with clear milestones." },
  { step: "4", title: "Roadmap Generated",    desc: "A realistic execution roadmap is built for your goal." },
  { step: "5", title: "Resources Connected",  desc: "Relevant courses, experts and services are matched to you." },
  { step: "6", title: "Progress Tracked",     desc: "Your AI Coach monitors every step and adapts the plan." },
  { step: "7", title: "Outcome Achieved",     desc: "Move from intention to measurable, verified achievement." },
];

const CAPABILITIES = [
  { icon: Target,      title: "Life Mission Engine",    desc: "Transform any goal into a structured mission with milestones and success metrics." },
  { icon: Map,         title: "AI Life Planner",        desc: "Intelligent planning that builds realistic roadmaps and adjusts when life happens." },
  { icon: Bot,         title: "Specialist AI Agents",   desc: "Dedicated agents for Career, Finance, Health, Travel and Business goals." },
  { icon: Sparkles,    title: "Recommendation Engine",  desc: "Hyper-personalised suggestions matched to your mission and progress." },
  { icon: ShoppingBag, title: "Life Marketplace",       desc: "Curated services, experts, courses and products for every life goal." },
  { icon: CheckCircle, title: "Execution Layer",        desc: "Task management built around missions — with context, not just checkboxes." },
  { icon: Brain,       title: "Life Memory",            desc: "AI that remembers your preferences, decisions and progress across time." },
  { icon: Compass,     title: "Opportunity Engine",     desc: "Proactively surfaces jobs, internships, scholarships and grants that match your mission." },
];

const USER_TYPES = [
  { icon: Briefcase,    label: "Professionals", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",   goals: ["Career growth", "Upskilling", "Financial planning", "Productivity"] },
  { icon: GraduationCap,label: "Students",      color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300", goals: ["Learning roadmaps", "Internships", "Certifications", "Career planning"] },
  { icon: Building2,    label: "Founders",      color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300", goals: ["Business planning", "Hiring", "Market research", "Funding"] },
  { icon: Users,        label: "Families",      color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",   goals: ["Health & fitness", "Travel planning", "Financial goals", "Home management"] },
];

const MARKETPLACE_CATEGORIES = ["Career", "Finance", "Health", "Travel", "Business", "Education"];

const PRICING_PLANS = [
  { name: "Free",          price: "₹0",      period: "",        badge: null,      features: ["3 active missions", "Basic AI planning", "Marketplace access", "Community support"], cta: "Get started free", href: ROUTES.SIGN_UP, primary: false },
  { name: "LifeKit Plus",  price: "₹499",    period: "/month",  badge: "Popular", features: ["10 active missions", "Advanced AI planning", "AI Agents (all 5)", "Priority support", "Memory & personalisation"], cta: "Start Plus", href: ROUTES.SIGN_UP, primary: true },
  { name: "LifeKit Pro",   price: "₹999",    period: "/month",  badge: null,      features: ["Unlimited missions", "Full AI suite", "Advanced analytics", "API access", "Dedicated coach"], cta: "Start Pro", href: ROUTES.SIGN_UP, primary: false },
  { name: "Enterprise",    price: "Custom",  period: "",        badge: null,      features: ["Everything in Pro", "Team workspaces", "SSO & compliance", "Custom integrations", "SLA guarantee"], cta: "Contact sales", href: ROUTES.CONTACT, primary: false },
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-b from-[hsl(var(--background-subtle))] to-[hsl(var(--background))] pt-20 pb-24 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <Badge variant="secondary" className="mb-6 gap-2 px-3 py-1 text-sm">
            <Zap className="h-3.5 w-3.5" />
            AI Execution Marketplace for Human Goals
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-balance">
            Turn your goals into
            <span className="block lifekit-gradient-text">executable missions</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-[hsl(var(--text-secondary))] max-w-2xl mx-auto text-balance">
            LifeKit understands your goals, creates structured roadmaps, connects you with the right resources, and tracks your execution — all powered by AI.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="xl" asChild rightIcon={<ArrowRight className="h-5 w-5" />}>
              <Link href={ROUTES.SIGN_UP}>Start Your Mission</Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href={ROUTES.PRODUCT}>Explore LifeKit</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-[hsl(var(--text-secondary))]">
            {["No credit card required", "Free plan available", "Set up in under 2 minutes"].map(f => (
              <span key={f} className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" />{f}</span>
            ))}
          </div>
        </div>

        {/* App preview mockup */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--shadow-lg)] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-secondary))]">
              <div className="flex gap-1.5">{["bg-red-400","bg-yellow-400","bg-green-400"].map(c=><div key={c} className={`h-3 w-3 rounded-full ${c}`} />)}</div>
              <div className="flex-1 mx-4 h-6 rounded-md bg-[hsl(var(--muted))] flex items-center px-3"><p className="text-xs text-[hsl(var(--text-secondary))]">app.lifekit.ai</p></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[hsl(var(--border))]">
              {[
                { title: "Become a Software Engineer", prog: 42, color: "bg-blue-500" },
                { title: "Save ₹5 Lakh Emergency Fund", prog: 28, color: "bg-green-500" },
                { title: "Run Half Marathon", prog: 35, color: "bg-orange-500" },
              ].map(m => (
                <div key={m.title} className="p-4">
                  <p className="text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide mb-2">Mission</p>
                  <p className="text-sm font-semibold text-[hsl(var(--text-primary))] leading-tight mb-3">{m.title}</p>
                  <div className="h-1.5 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                    <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.prog}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-[hsl(var(--text-secondary))]">{m.prog}% complete</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-4 bg-[hsl(var(--background))]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[hsl(var(--primary))] uppercase tracking-wider mb-2">The LifeKit Flow</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--text-primary))]">From goal to achievement</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FLOW_STEPS.map((s, i) => (
              <div key={s.step} className="relative">
                {i < FLOW_STEPS.length - 1 && <div className="hidden lg:block absolute top-5 left-full w-4 h-0.5 bg-gradient-to-r from-[hsl(var(--primary))] to-transparent z-10" />}
                <Card className="h-full hover:border-[hsl(var(--primary))]/40 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg lifekit-gradient text-white text-sm font-bold mb-3">{s.step}</div>
                    <h3 className="font-semibold text-[hsl(var(--text-primary))] mb-1">{s.title}</h3>
                    <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">{s.desc}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section className="py-20 px-4 bg-[hsl(var(--background-subtle))]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[hsl(var(--primary))] uppercase tracking-wider mb-2">Core Capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--text-primary))]">Everything you need to execute</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CAPABILITIES.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="group hover:border-[hsl(var(--primary))]/40 hover:shadow-[var(--shadow-purple)] transition-all">
                <CardContent className="p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] mb-4 group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-[hsl(var(--text-primary))] mb-2">{title}</h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── User types ── */}
      <section className="py-20 px-4 bg-[hsl(var(--background))]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[hsl(var(--primary))] uppercase tracking-wider mb-2">Built for everyone</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--text-primary))]">Your goals, your way</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {USER_TYPES.map(({ icon: Icon, label, color, goals }) => (
              <Card key={label} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${color} mb-4`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-[hsl(var(--text-primary))] mb-3">{label}</h3>
                  <ul className="space-y-1.5">
                    {goals.map(g => (
                      <li key={g} className="flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))]">
                        <CheckCircle className="h-3.5 w-3.5 text-[hsl(var(--success))] shrink-0" />{g}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marketplace preview ── */}
      <section className="py-20 px-4 bg-[hsl(var(--background-subtle))]">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold text-[hsl(var(--primary))] uppercase tracking-wider mb-2">Life Marketplace</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--text-primary))] mb-4">Every resource you need</h2>
          <p className="text-lg text-[hsl(var(--text-secondary))] max-w-2xl mx-auto mb-10">
            Mentors, trainers, courses, tools, financial products and more — all curated and matched to your active missions.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {MARKETPLACE_CATEGORIES.map(c => (
              <span key={c} className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-sm font-medium text-[hsl(var(--text-primary))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] cursor-pointer transition-colors">
                {c}
              </span>
            ))}
          </div>
          <Button variant="outline" asChild rightIcon={<ArrowRight className="h-4 w-4" />}>
            <Link href={ROUTES.MARKETPLACE_PUBLIC}>Explore Marketplace</Link>
          </Button>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 px-4 bg-[hsl(var(--background))]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[hsl(var(--primary))] uppercase tracking-wider mb-2">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--text-primary))]">Plans for every journey</h2>
            <p className="mt-3 text-[hsl(var(--text-secondary))]">Start free. Upgrade as your ambitions grow.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PRICING_PLANS.map((plan) => (
              <Card key={plan.name} className={plan.primary ? "border-[hsl(var(--primary))] shadow-[var(--shadow-purple)] relative" : ""}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="shadow-sm">{plan.badge}</Badge>
                  </div>
                )}
                <CardContent className="p-5">
                  <h3 className="font-semibold text-[hsl(var(--text-primary))] mb-1">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-black text-[hsl(var(--text-primary))]">{plan.price}</span>
                    <span className="text-sm text-[hsl(var(--text-secondary))]">{plan.period}</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-[hsl(var(--text-secondary))]">
                        <CheckCircle className="h-4 w-4 text-[hsl(var(--success))] shrink-0 mt-0.5" />{f}
                      </li>
                    ))}
                  </ul>
                  <Button variant={plan.primary ? "default" : "outline"} className="w-full" asChild>
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-4 lifekit-gradient">
        <div className="mx-auto max-w-3xl text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">Ready to start your first mission?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join thousands of people turning goals into achievements with AI-powered execution.
          </p>
          <Button size="xl" variant="secondary" className="bg-white text-[hsl(var(--primary))] hover:bg-white/90" asChild rightIcon={<ArrowRight className="h-5 w-5" />}>
            <Link href={ROUTES.SIGN_UP}>Create Your First Mission</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
