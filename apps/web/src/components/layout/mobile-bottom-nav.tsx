"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Target, ShoppingBag, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { ROUTES } from "@/constants/routes";

const NAV_ITEMS = [
  { label: "Home",        href: ROUTES.DASHBOARD,       icon: Home },
  { label: "Missions",    href: ROUTES.MISSIONS,        icon: Target },
  { label: "Marketplace", href: ROUTES.MARKETPLACE_APP, icon: ShoppingBag },
  { label: "AI Coach",    href: ROUTES.AI_COACH,        icon: Bot },
  { label: "Profile",     href: ROUTES.PROFILE,         icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const unreadCount = useUIStore(s => s.unreadNotificationCount);

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]/95 backdrop-blur-sm"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile navigation"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        // Show notification badge on Profile tab (as entry point to notifications)
        const showBadge = item.href === ROUTES.PROFILE && unreadCount > 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-h-[44px] min-w-[44px] select-none"
            aria-current={active ? "page" : undefined}
          >
            <div className="relative">
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  active ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--text-secondary))]"
                )}
              />
              {showBadge && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-white text-[8px] font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span
              className={cn(
                "text-[10px] font-medium transition-colors leading-none",
                active ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--text-secondary))]"
              )}
            >
              {item.label}
            </span>
            {/* Active indicator dot */}
            {active && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-[hsl(var(--primary))]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
