"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/constants/routes";
import { Zap, Users, Target, ShoppingBag, CreditCard, Ticket, BarChart3, FileText, Layers, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { label: "Dashboard",     href: ROUTES.ADMIN,                icon: BarChart3 },
  { label: "Users",         href: ROUTES.ADMIN_USERS,          icon: Users },
  { label: "Missions",      href: ROUTES.ADMIN_MISSIONS,       icon: Target },
  { label: "Marketplace",   href: ROUTES.ADMIN_MARKETPLACE,    icon: ShoppingBag },
  { label: "Transactions",  href: ROUTES.ADMIN_TRANSACTIONS,   icon: CreditCard },
  { label: "Subscriptions", href: ROUTES.ADMIN_SUBSCRIPTIONS,  icon: Layers },
  { label: "Support",       href: ROUTES.ADMIN_SUPPORT,        icon: Ticket },
  { label: "Audit Logs",    href: ROUTES.ADMIN_AUDIT,          icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user && user.role !== "admin") router.replace(ROUTES.DASHBOARD);
    if (!user) router.replace(ROUTES.SIGN_IN);
  }, [user, router]);

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[hsl(var(--text-primary))]">Access Denied</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-2">Admin access is required to view this page.</p>
          <Link href={ROUTES.DASHBOARD} className="mt-4 inline-block text-sm text-[hsl(var(--primary))] hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[hsl(var(--background-subtle))]">
      {/* Admin sidebar */}
      <aside className="w-56 shrink-0 bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] flex flex-col">
        <div className="flex items-center gap-2 h-14 px-4 border-b border-[hsl(var(--border))]">
          <div className="flex h-7 w-7 items-center justify-center rounded-md lifekit-gradient">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold text-sm lifekit-gradient-text">LifeKit Admin</span>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {ADMIN_NAV.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                active ? "bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]" : "text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--primary))]"
              )}>
                <Icon className="h-4 w-4 shrink-0" />{label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-[hsl(var(--border))]">
          <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2 text-xs text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--primary))] transition-colors">
            ← Back to App
          </Link>
        </div>
      </aside>

      {/* Admin content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
