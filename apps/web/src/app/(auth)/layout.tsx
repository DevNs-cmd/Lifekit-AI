"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Target, TrendingUp, Brain, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/constants/routes";

const FEATURES = [
  { icon: Target,     text: "Mission-driven goal tracking" },
  { icon: Brain,      text: "AI coaching personalised to you" },
  { icon: TrendingUp, text: "Real-time progress analytics" },
  { icon: CheckCircle2, text: "Stay accountable, every day" },
];

const TESTIMONIAL = {
  quote: "LifeKit helped me land my dream job in 4 months. The AI coach kept me on track when I wanted to give up.",
  author: "Priya S.",
  role: "Software Engineer at Google",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace(ROUTES.DASHBOARD);
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col justify-between p-10 overflow-hidden"
        style={{ background: "linear-gradient(145deg, hsl(123 43% 22%) 0%, hsl(123 43% 34%) 45%, hsl(120 40% 44%) 100%)" }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large blurred circles */}
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, hsl(120 50% 70%) 0%, transparent 70%)" }} />
          <div className="absolute top-1/2 -right-24 h-80 w-80 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, hsl(120 50% 80%) 0%, transparent 70%)" }} />
          <div className="absolute -bottom-20 left-1/4 h-64 w-64 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, hsl(90 60% 80%) 0%, transparent 70%)" }} />
          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link href={ROUTES.HOME} className="flex items-center gap-2.5 w-fit">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-black text-2xl text-white tracking-tight">LifeKit</span>
          </Link>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
              Your AI-powered
              <span className="block text-white/80">life co-pilot.</span>
            </h2>
            <p className="mt-4 text-lg text-white/70 leading-relaxed max-w-sm">
              Set missions, get personalised AI coaching, and track your progress toward everything that matters.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 border border-white/20 shrink-0">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-white/85 text-sm font-medium">{text}</span>
              </li>
            ))}
          </ul>

          {/* Testimonial */}
          <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm p-5">
            <p className="text-white/90 text-sm leading-relaxed italic">
              &ldquo;{TESTIMONIAL.quote}&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-white/25 border border-white/30 flex items-center justify-center text-white font-bold text-sm">
                {TESTIMONIAL.author[0]}
              </div>
              <div>
                <p className="text-white font-semibold text-xs">{TESTIMONIAL.author}</p>
                <p className="text-white/60 text-xs">{TESTIMONIAL.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-4 text-xs text-white/40">
          <span>© {new Date().getFullYear()} LifeKit</span>
          <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white/70 transition-colors">Terms</Link>
        </div>
      </div>

      {/* ── Right panel — auth form ── */}
      <div className="flex flex-1 flex-col min-h-screen bg-[hsl(var(--background))]">
        {/* Mobile header */}
        <header className="flex lg:hidden h-14 items-center px-6 border-b border-[hsl(var(--border))]">
          <Link href={ROUTES.HOME} className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg lifekit-gradient">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-black text-lg lifekit-gradient-text">LifeKit</span>
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-md">
            {children}
          </div>
        </main>

        {/* Mobile footer */}
        <footer className="flex lg:hidden py-4 justify-center text-xs text-[hsl(var(--text-secondary))]">
          <span>© {new Date().getFullYear()} LifeKit ·{" "}
            <Link href="/privacy" className="hover:text-[hsl(var(--primary))]">Privacy</Link> ·{" "}
            <Link href="/terms" className="hover:text-[hsl(var(--primary))]">Terms</Link>
          </span>
        </footer>
      </div>
    </div>
  );
}
