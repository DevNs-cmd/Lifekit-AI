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
import { Bot, Sparkles } from "lucide-react";

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

  // These routes manage their own scroll/height internally (chat UIs)
  const isFullHeightPage = pathname.startsWith("/agents/");

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-[100dvh] w-full overflow-hidden bg-transparent">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Mobile sidebar drawer */}
        <MobileSidebar />

        {/* Main content area */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <TopBar title={title} />

          <div className="flex flex-1 overflow-hidden">
            {/* Page content */}
            {isFullHeightPage ? (
              // Full-height pages: no ScrollArea wrapper, no padding — they
              // control their own layout with h-[calc(100dvh-4rem)] overflow-hidden
              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pathname}
                    className="relative z-[1] h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                {/* pb-20 clears the fixed bottom nav on mobile; lg:pb-8 on desktop */}
                <main className="app-canvas min-h-[calc(100dvh-4rem)] pb-20 lg:pb-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={pathname}
                      className="relative z-[1]"
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
            )}

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
        {!aiCoachOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => useUIStore.getState().setAiCoachPanelOpen(true)}
            className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 flex h-12 w-12 items-center justify-center rounded-2xl lifekit-gradient text-white ai-glow ring-1 ring-white/20"
            aria-label="Open LifeKit AI Coach"
          >
            <span className="relative"><Bot className="h-5 w-5" /><Sparkles className="absolute -right-2 -top-2 h-3 w-3" /></span>
          </motion.button>
        )}
      </div>
    </TooltipProvider>
  );
}
