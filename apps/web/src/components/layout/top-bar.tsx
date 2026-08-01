"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Search, Plus, Menu, Moon, Sun, Monitor } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getInitials } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useTheme } from "next-themes";

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const { toggleCommandMenu, setQuickCreateOpen, setSidebarOpen, unreadNotificationCount } = useUIStore();
  const { user, logout } = useAuthStore();
  const { setTheme, theme } = useTheme();
  const router = useRouter();

  // Avoid hydration mismatch: theme is undefined on the server
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  function handleLogout() {
    logout();
    router.replace(ROUTES.SIGN_IN);
  }

  function ThemeIcon() {
    if (!mounted) return <Monitor className="h-4 w-4" />;
    if (theme === "dark") return <Moon className="h-4 w-4" />;
    if (theme === "light") return <Sun className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  }

  return (
    <header className="flex h-16 items-center gap-3 px-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0">
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page title */}
      {title && (
        <h1 className="text-base font-semibold text-[hsl(var(--text-primary))] hidden sm:block truncate mr-auto">
          {title}
        </h1>
      )}

      <div className="flex items-center gap-1 ml-auto">

        {/* Search */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={toggleCommandMenu} aria-label="Search (Ctrl+K)">
              <Search className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Search (Ctrl+K)</TooltipContent>
        </Tooltip>

        {/* Quick create */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={() => setQuickCreateOpen(true)} aria-label="Quick create">
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Quick Create</TooltipContent>
        </Tooltip>

        {/* Notifications — plain Link button, no nested Slot */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={ROUTES.NOTIFICATIONS}
              className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--primary))] transition-colors"
              aria-label={`Notifications${unreadNotificationCount > 0 ? `, ${unreadNotificationCount} unread` : ""}`}
            >
              <Bell className="h-4 w-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-white text-[10px] font-bold px-0.5">
                  {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                </span>
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>

        {/* Theme switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Toggle theme">
              <ThemeIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="h-4 w-4 mr-2" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="h-4 w-4 mr-2" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="h-4 w-4 mr-2" /> System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[hsl(var(--secondary))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
              aria-label="User menu"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {getInitials(user?.fullName ?? "U")}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium text-[hsl(var(--text-primary))]">
                {user?.fullName?.split(" ")[0]}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{user?.fullName}</p>
              <p className="text-xs text-[hsl(var(--text-secondary))]">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(ROUTES.PROFILE)}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(ROUTES.SETTINGS)}>Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(ROUTES.SETTINGS_SUBSCRIPTION)}>Subscription</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onClick={handleLogout}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}
