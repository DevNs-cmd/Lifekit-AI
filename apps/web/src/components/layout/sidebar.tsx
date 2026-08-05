"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Target, CheckSquare, Bot, Cpu, ShoppingBag, Compass,
  Brain, Bell, Crown, Settings, HelpCircle,
  ChevronLeft, ChevronRight, Zap, LogOut, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getInitials } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";

const NAV_SECTIONS = [
  { label: "Workspace", items: [
    { label: "Today", href: ROUTES.DASHBOARD, icon: Home },
    { label: "Missions", href: ROUTES.MISSIONS, icon: Target },
    { label: "Tasks", href: ROUTES.TASKS, icon: CheckSquare },
  ]},
  { label: "Intelligence", items: [
    { label: "AI Coach", href: ROUTES.AI_COACH, icon: Bot },
    { label: "AI Agents", href: ROUTES.AGENTS, icon: Cpu },
    { label: "Memory", href: ROUTES.MEMORY, icon: Brain },
  ]},
  { label: "Discover", items: [
    { label: "Opportunities", href: ROUTES.OPPORTUNITIES, icon: Compass },
    { label: "Marketplace", href: ROUTES.MARKETPLACE_APP, icon: ShoppingBag },
    { label: "Notifications", href: ROUTES.NOTIFICATIONS, icon: Bell },
  ]},
];

const BOTTOM_ITEMS = [
  { label: "Subscription", href: ROUTES.SETTINGS_SUBSCRIPTION, icon: Crown },
  { label: "Settings",     href: ROUTES.SETTINGS,              icon: Settings },
  { label: "Help",         href: "/support",                   icon: HelpCircle },
];

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
  active: boolean;
  badge?: number;
}

function NavItem({ href, icon: Icon, label, collapsed, active, badge }: NavItemProps) {
  const item = (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative active:scale-[0.97]",
        active
          ? "bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] shadow-sm before:absolute before:left-0 before:h-5 before:w-0.5 before:rounded-full before:bg-[hsl(var(--primary))]"
          : "text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--primary))]"
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className={cn("h-5 w-5 shrink-0", active ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--text-secondary))] group-hover:text-[hsl(var(--primary))]")} />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="truncate"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {badge !== undefined && badge > 0 && (
        <span className={cn(
          "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-white text-xs font-semibold px-1",
          collapsed && "absolute -top-1 -right-1 h-4 min-w-4 text-[10px]"
        )}>
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{item}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }
  return item;
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebarCollapsed, setQuickCreateOpen } = useUIStore();
  const { user, logout } = useAuthStore();
  const unreadCount = useUIStore((s) => s.unreadNotificationCount);
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace(ROUTES.SIGN_IN);
  }

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="hidden lg:flex flex-col h-full bg-[hsl(var(--card))] dark:bg-[hsl(var(--card))]/86 dark:backdrop-blur-xl border-r border-[hsl(var(--border))]/70 relative"
    >
      {/* Logo */}
      <div className={cn("flex items-center h-16 px-4 border-b border-[hsl(var(--border))]", sidebarCollapsed ? "justify-center" : "gap-2")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg lifekit-gradient">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <span className="font-bold text-lg tracking-tight lifekit-gradient-text">LifeKit</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Create */}
      <div className={cn("px-3 pt-4 pb-2")}>
        {sidebarCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" className="w-full" onClick={() => setQuickCreateOpen(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Quick Create</TooltipContent>
          </Tooltip>
        ) : (
          <Button className="w-full" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setQuickCreateOpen(true)}>
            Quick Create
          </Button>
        )}
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5" aria-label="Main navigation">
        {NAV_SECTIONS.map(section => (
          <div key={section.label} className="mb-4">
            {!sidebarCollapsed && <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[hsl(var(--text-secondary))]/70">{section.label}</p>}
            <div className="space-y-0.5">{section.items.map((item) => (
              <NavItem key={item.href} {...item} collapsed={sidebarCollapsed}
                active={pathname === item.href || pathname.startsWith(item.href + "/")}
                badge={item.href === ROUTES.NOTIFICATIONS ? unreadCount : undefined} />
            ))}</div>
          </div>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 pb-3 space-y-0.5 border-t border-[hsl(var(--border))] pt-2">
        {BOTTOM_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            collapsed={sidebarCollapsed}
            active={pathname === item.href}
          />
        ))}

        {/* User menu */}
        <div className={cn("flex items-center gap-2 mt-2 px-2 py-2 rounded-lg hover:bg-[hsl(var(--secondary))] cursor-pointer transition-colors", sidebarCollapsed && "justify-center")}>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback>{getInitials(user?.fullName ?? "U")}</AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[hsl(var(--text-primary))] truncate">{user?.fullName}</p>
                <p className="text-xs text-[hsl(var(--text-secondary))] truncate">{user?.subscriptionPlan}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!sidebarCollapsed && (
            <button onClick={handleLogout} className="p-1 rounded hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))]" aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebarCollapsed}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary))] transition-colors shadow-sm z-10"
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
    </motion.aside>
  );
}
