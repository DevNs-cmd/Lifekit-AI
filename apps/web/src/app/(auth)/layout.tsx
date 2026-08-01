"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/constants/routes";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // If already logged in, bounce to the dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, router]);

  // Don't flash the auth page if we're about to redirect
  if (isAuthenticated) return null;

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background-subtle))]">
      <header className="flex h-16 items-center px-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <Link href={ROUTES.HOME} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg lifekit-gradient">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-xl lifekit-gradient-text">LifeKit</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        {children}
      </main>
      <footer className="py-4 text-center text-xs text-[hsl(var(--text-secondary))]">
        © {new Date().getFullYear()} LifeKit ·{" "}
        <Link href="/privacy" className="hover:text-[hsl(var(--primary))]">Privacy</Link> ·{" "}
        <Link href="/terms" className="hover:text-[hsl(var(--primary))]">Terms</Link>
      </footer>
    </div>
  );
}
