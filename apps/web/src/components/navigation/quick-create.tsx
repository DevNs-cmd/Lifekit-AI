"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Target, CheckSquare, Brain, ShoppingBag, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useUIStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

const QUICK_ACTIONS = [
  { label: "New Mission",       icon: Target,     href: ROUTES.MISSION_NEW,             description: "Start a new AI-powered goal mission" },
  { label: "Add Task",          icon: CheckSquare,href: ROUTES.TASKS + "?create=true",  description: "Add a task to an existing mission" },
  { label: "Save to Memory",    icon: Brain,      href: ROUTES.MEMORY + "?create=true", description: "Save important information or context" },
  { label: "Search Marketplace",icon: ShoppingBag,href: ROUTES.MARKETPLACE_APP,         description: "Find services, courses and experts" },
];

export function QuickCreateMenu() {
  const router = useRouter();
  const { quickCreateOpen, setQuickCreateOpen } = useUIStore();

  function handleAction(href: string) {
    setQuickCreateOpen(false);
    router.push(href);
  }

  return (
    <AnimatePresence>
      {quickCreateOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setQuickCreateOpen(false)}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15 }}
            className="fixed top-20 right-4 z-50 w-72 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg"
            role="dialog"
            aria-label="Quick create menu"
          >
            <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
              <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">Quick Create</p>
              <Button variant="ghost" size="icon-sm" onClick={() => setQuickCreateOpen(false)} aria-label="Close"><X className="h-4 w-4" /></Button>
            </div>
            <div className="p-2 space-y-0.5">
              {QUICK_ACTIONS.map(({ label, icon: Icon, href, description }) => (
                <button
                  key={href}
                  onClick={() => handleAction(href)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[hsl(var(--secondary))] group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{label}</p>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">{description}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
