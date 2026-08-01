"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Zap, Home, Target, CheckSquare, Bot, Cpu, ShoppingBag, Compass, Brain, Bell, User, Crown, Settings, HelpCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { AnimatePresence, motion } from "framer-motion";

const ALL_NAV = [
  { label: "Home",          href: ROUTES.DASHBOARD,            icon: Home },
  { label: "Missions",      href: ROUTES.MISSIONS,             icon: Target },
  { label: "Tasks",         href: ROUTES.TASKS,                icon: CheckSquare },
  { label: "AI Coach",      href: ROUTES.AI_COACH,             icon: Bot },
  { label: "AI Agents",     href: ROUTES.AGENTS,               icon: Cpu },
  { label: "Marketplace",   href: ROUTES.MARKETPLACE_APP,      icon: ShoppingBag },
  { label: "Opportunities", href: ROUTES.OPPORTUNITIES,        icon: Compass },
  { label: "Memory",        href: ROUTES.MEMORY,               icon: Brain },
  { label: "Notifications", href: ROUTES.NOTIFICATIONS,        icon: Bell },
  { label: "Profile",       href: ROUTES.PROFILE,              icon: User },
  { label: "Subscription",  href: ROUTES.SETTINGS_SUBSCRIPTION,icon: Crown },
  { label: "Settings",      href: ROUTES.SETTINGS,             icon: Settings },
  { label: "Help",          href: "/support",                  icon: HelpCircle },
];

export function MobileSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { user, logout } = useAuthStore();

  // Close on route change
  React.useEffect(() => { setSidebarOpen(false); }, [pathname, setSidebarOpen]);

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] flex flex-col"
          >
            <div className="flex items-center justify-between h-16 px-4 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg lifekit-gradient">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-lg lifekit-gradient-text">LifeKit</span>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setSidebarOpen(false)} aria-label="Close navigation">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
              {ALL_NAV.map(({ label, href, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link key={href} href={href} className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active ? "bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"
                           : "text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--primary))]"
                  )} aria-current={active ? "page" : undefined}>
                    <Icon className="h-5 w-5 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-[hsl(var(--border))] p-3">
              <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-[hsl(var(--secondary))]">
                <Avatar className="h-8 w-8"><AvatarImage src={user?.avatarUrl} /><AvatarFallback className="text-xs">{getInitials(user?.fullName ?? "U")}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[hsl(var(--text-primary))] truncate">{user?.fullName}</p>
                  <p className="text-xs text-[hsl(var(--text-secondary))] truncate capitalize">{user?.subscriptionPlan} plan</p>
                </div>
                <button onClick={logout} className="p-1 rounded text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--destructive))]" aria-label="Sign out">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
