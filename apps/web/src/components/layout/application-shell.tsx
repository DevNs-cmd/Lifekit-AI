"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { MobileSidebar } from "./mobile-sidebar";
import { AICoachPanel } from "@/components/ai/ai-coach-panel";
import { QuickCreateMenu } from "@/components/navigation/quick-create";
import { CommandMenu } from "@/components/navigation/command-menu";
import { useUIStore } from "@/stores/ui-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Derive page titles from route
function usePageTitle(pathname: string): string {
  const map: Record<string, string> = {
    "/home": "Home",
    "/missions": "Missions",
    "/tasks": "Tasks",
    "/ai-coach": "AI Coach",
    "/ai-coach/planner": "AI Planner",
    "/agents": "AI Agents",
    "/marketplace": "Marketplace",
    "/opportunities": "Opportunities",
    "/memory": "Memory",
    "/analytics": "Analytics",
    "/notifications": "Notifications",
    "/profile": "Profile",
    "/settings": "Settings",
    "/settings/subscription": "Subscription",
    "/settings/billing": "Billing",
    "/settings/general": "General Settings",
    "/settings/security": "Security",
    "/settings/ai": "AI Preferences",
    "/settings/privacy": "Privacy",
  };
  // Match prefix
  const match = Object.keys(map)
    .sort((a, b) => b.length - a.length)
    .find((k) => pathname.startsWith(k));
  return match ? map[match] : "LifeKit";
}

interface ApplicationShellProps {
  children: React.ReactNode;
}

export function ApplicationShell({ children }: ApplicationShellProps) {
  const pathname = usePathname();
  const title = usePageTitle(pathname);
  const aiCoachOpen = useUIStore((s) => s.aiCoachPanelOpen);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-[100dvh] w-full overflow-hidden bg-[hsl(var(--background))]">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Mobile sidebar drawer */}
        <MobileSidebar />

        {/* Main content area */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <TopBar title={title} />

          <div className="flex flex-1 overflow-hidden">
            {/* Page content */}
            <ScrollArea className="flex-1">
              {/* pb-20 clears the fixed bottom nav on mobile; lg:pb-8 on desktop */}
              <main className="min-h-[calc(100dvh-4rem)] pb-20 lg:pb-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </main>
            </ScrollArea>

            {/* AI Coach side panel (desktop only) */}
            <AnimatePresence>
              {aiCoachOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 380, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="hidden lg:block shrink-0 border-l border-[hsl(var(--border))] overflow-hidden"
                >
                  <AICoachPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <MobileBottomNav />

        {/* Global overlays */}
        <CommandMenu />
        <QuickCreateMenu />
      </div>
    </TooltipProvider>
  );
}
