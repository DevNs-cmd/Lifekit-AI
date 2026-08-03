import Link from "next/link";
import { Briefcase, GraduationCap, Building2, Users, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { SolutionsJourney } from "@/components/marketing/page-experiences";
import { Reveal } from "@/components/marketing/premium-interactions";

const SOLUTIONS = [
  {
    icon: Briefcase, title: "For Professionals", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    headline: "Accelerate your career trajectory",
    desc: "LifeKit helps professionals plan and execute career pivots, upskilling roadmaps, job searches and financial goals with AI precision.",
    goals: ["Land your dream role in 6 months", "Build an in-demand skillset", "Achieve financial independence", "Improve work-life balance"],
    href: ROUTES.SIGN_UP,
  },
  {
    icon: GraduationCap, title: "For Students", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
    headline: "Build your future from day one",
    desc: "Students use LifeKit to plan learning journeys, find internships, earn certifications and develop career-ready skills.",
    goals: ["Get your first internship", "Build a strong portfolio", "Earn high-value certifications", "Plan your career path"],
    href: ROUTES.SIGN_UP,
  },
  {
    icon: Building2, title: "For Founders", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    headline: "Execute your startup vision",
    desc: "LifeKit helps founders translate vision into structured execution plans, from idea validation to team building and funding.",
    goals: ["Validate your business idea", "Build your first MVP", "Hire the right team", "Prepare for fundraising"],
    href: ROUTES.SIGN_UP,
  },
  {
    icon: Users, title: "For Families", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
    headline: "Achieve family goals together",
    desc: "Families use LifeKit to coordinate health goals, plan travel adventures, manage finances and build shared experiences.",
    goals: ["Plan your dream vacation", "Build a family emergency fund", "Improve collective health", "Manage shared goals"],
    href: ROUTES.SIGN_UP,
  },
];

export default function SolutionsPage() {
  return (
    <div className="marketing-page-shell">
      <div className="mx-auto max-w-6xl">
        <div className="marketing-story-hero text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-black text-[hsl(var(--text-primary))]">Solutions for every journey</h1>
          <p className="mt-4 text-lg text-[hsl(var(--text-secondary))] max-w-2xl mx-auto">One platform, personalised for your stage of life.</p>
        </div>
        <div className="marketing-content-grid grid grid-cols-1 lg:grid-cols-2 gap-6">
          {SOLUTIONS.map(({ icon: Icon, title, color, headline, desc, goals, href }) => (
            <Reveal key={title}><Card className="marketing-premium-card h-full">
              <CardContent className="p-6">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${color} mb-4`}><Icon className="h-5 w-5" /></div>
                <p className="text-xs font-semibold text-[hsl(var(--primary))] uppercase tracking-wide mb-1">{title}</p>
                <h2 className="text-xl font-bold text-[hsl(var(--text-primary))] mb-3">{headline}</h2>
                <p className="text-sm text-[hsl(var(--text-secondary))] mb-4 leading-relaxed">{desc}</p>
                <ul className="space-y-2 mb-6">
                  {goals.map(g => (
                    <li key={g} className="flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))]">
                      <CheckCircle className="h-4 w-4 text-[hsl(var(--success))] shrink-0" />{g}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="sm" asChild rightIcon={<ArrowRight className="h-4 w-4" />}>
                  <Link href={href}>Get started</Link>
                </Button>
              </CardContent>
            </Card></Reveal>
          ))}
        </div>
      </div>
      <SolutionsJourney />
    </div>
  );
}
