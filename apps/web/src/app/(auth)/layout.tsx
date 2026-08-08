"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Check, CheckSquare, Sparkles, Target, Zap } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/constants/routes";

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  // Wait for the Zustand persist store to rehydrate on the client before
  // checking auth. Without this, isAuthenticated reads stale persisted state
  // on the server/first render and the layout returns null, blocking the page.
  const hydrated = useIsClient();

  useEffect(() => {
    if (hydrated && isAuthenticated) router.replace(ROUTES.DASHBOARD);
  }, [hydrated, isAuthenticated, router]);

  // Render nothing until we know the real auth state
  if (!hydrated) return null;
  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#f4f6f3] p-0 lg:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-[1540px] overflow-hidden bg-[#f4f6f3] lg:gap-5">
        <aside className="auth-brand-panel relative hidden w-[52%] flex-col overflow-hidden rounded-[34px] p-9 lg:flex xl:p-12">
          <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "27px 27px" }} />
          <div className="pointer-events-none absolute -right-32 -top-24 h-96 w-96 rounded-full border-[70px] border-white/[0.06]" />
          <div className="pointer-events-none absolute -bottom-32 -left-28 h-80 w-80 rounded-full bg-lime-200/10 blur-3xl" />

          <Link href={ROUTES.HOME} className="relative z-10 flex w-fit items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/25 bg-white/15 backdrop-blur"><Zap className="h-5 w-5 text-white" /></span>
            <span className="text-2xl font-black tracking-[-0.04em] text-white">LifeKit</span>
          </Link>

          <div className="relative z-10 my-auto grid gap-10 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-center">
            <div>
              <div className="mb-4 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/75"><Sparkles className="h-3.5 w-3.5" />Your life, in motion</div>
              <h1 className="max-w-xl text-5xl font-black leading-[0.98] tracking-[-0.055em] text-white xl:text-6xl">Turn intention into momentum.</h1>
              <p className="mt-5 max-w-md text-base leading-7 text-white/65">One intelligent space for the goals you care about and the next action that moves them forward.</p>
            </div>

            <div className="relative mx-auto h-[330px] w-full max-w-[280px]">
              <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/25" />
              <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[30px] border border-white/30 bg-white/15 shadow-2xl backdrop-blur-xl"><Target className="h-10 w-10 text-white" /></div>

              <div className="absolute left-0 top-8 w-44 -rotate-3 rounded-2xl border border-white/20 bg-white/13 p-3.5 shadow-xl backdrop-blur-xl transition-transform duration-300 hover:rotate-0 hover:scale-105">
                <div className="flex items-center gap-2 text-xs font-bold text-white"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15"><ArrowUpRight className="h-4 w-4" /></span>Career mission</div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full w-[72%] rounded-full bg-lime-200" /></div><p className="mt-1.5 text-[10px] text-white/55">72% momentum</p>
              </div>
              <div className="absolute right-0 top-28 w-40 rotate-3 rounded-2xl border border-white/20 bg-white/13 p-3.5 shadow-xl backdrop-blur-xl transition-transform duration-300 hover:rotate-0 hover:scale-105"><div className="flex items-center gap-2 text-xs font-bold text-white"><CheckSquare className="h-4 w-4" />Today</div><p className="mt-2 text-sm font-semibold text-white">Run 8 km</p><p className="mt-1 text-[10px] text-white/55">45 min · high impact</p></div>
              <div className="absolute bottom-5 left-5 w-44 -rotate-2 rounded-2xl border border-white/20 bg-white/13 p-3.5 shadow-xl backdrop-blur-xl transition-transform duration-300 hover:rotate-0 hover:scale-105"><div className="flex items-center gap-2 text-xs font-bold text-white"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-lime-200 text-green-900"><Check className="h-3 w-3" /></span>Milestone reached</div><p className="mt-2 text-sm font-semibold text-white">Emergency fund</p></div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-white/45"><span>© {new Date().getFullYear()} LifeKit</span><div className="flex gap-4"><Link href="/privacy" className="hover:text-white">Privacy</Link><Link href="/terms" className="hover:text-white">Terms</Link></div></div>
        </aside>

        <section className="auth-form-panel flex min-h-screen flex-1 flex-col overflow-y-auto rounded-[34px] bg-white lg:max-h-[calc(100vh-2.5rem)] lg:min-h-0">
          <header className="flex h-14 items-center px-6 lg:hidden"><Link href={ROUTES.HOME} className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl lifekit-gradient"><Zap className="h-4 w-4 text-white" /></span><span className="text-lg font-black lifekit-gradient-text">LifeKit</span></Link></header>
          <main className="flex flex-1 items-center justify-center px-6 py-8 lg:px-10"><div className="w-full max-w-md">{children}</div></main>
          <footer className="flex justify-center py-4 text-xs text-[hsl(var(--text-secondary))] lg:hidden">© {new Date().getFullYear()} LifeKit · <Link href="/privacy" className="mx-1 hover:text-[hsl(var(--primary))]">Privacy</Link> · <Link href="/terms" className="ml-1 hover:text-[hsl(var(--primary))]">Terms</Link></footer>
        </section>
      </div>
    </div>
  );
}
