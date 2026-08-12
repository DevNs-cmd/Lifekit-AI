"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Target, CheckSquare, ShoppingBag, Compass, Brain, Bot, Home, User, Settings, Plus, LayoutGrid, ListFilter, Sparkles, X } from "lucide-react";
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useUIStore } from "@/stores/ui-store";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const COMMANDS = [
  { group: "Navigate", items: [
    { label: "Home Dashboard",  icon: Home,       href: ROUTES.DASHBOARD },
    { label: "My Missions",     icon: Target,     href: ROUTES.MISSIONS },
    { label: "Tasks",           icon: CheckSquare,href: ROUTES.TASKS },
    { label: "AI Coach",        icon: Bot,        href: ROUTES.AI_COACH },
    { label: "Marketplace",     icon: ShoppingBag,href: ROUTES.MARKETPLACE_APP },
    { label: "Opportunities",   icon: Compass,    href: ROUTES.OPPORTUNITIES },
    { label: "Memory",          icon: Brain,      href: ROUTES.MEMORY },
    { label: "Profile",         icon: User,       href: ROUTES.PROFILE },
    { label: "Settings",        icon: Settings,   href: ROUTES.SETTINGS },
  ]},
  { group: "Create", items: [
    { label: "New Mission",     icon: Target,     href: ROUTES.MISSION_NEW },
    { label: "New Task",        icon: Plus,       href: ROUTES.TASKS + "?create=true" },
  ]},
];

export function CommandMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { commandMenuOpen, setCommandMenuOpen } = useUIStore();
  const [search, setSearch] = React.useState("");

  // Keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        setCommandMenuOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setCommandMenuOpen]);

  function handleSelect(href: string) {
    setCommandMenuOpen(false);
    setSearch("");
    router.push(href);
  }

  const contextualItems = pathname.startsWith(ROUTES.TASKS) ? [
    { label: "Create a task", icon: Plus, href: `${ROUTES.TASKS}?create=true`, shortcut: "C" },
    { label: "Open task board", icon: LayoutGrid, href: `${ROUTES.TASKS}?view=kanban`, shortcut: "B" },
    { label: "Show all tasks", icon: ListFilter, href: ROUTES.TASKS, shortcut: "A" },
  ] : pathname.startsWith(ROUTES.MISSIONS) ? [
    { label: "Create a mission", icon: Target, href: ROUTES.MISSION_NEW, shortcut: "C" },
    { label: "Review active missions", icon: Sparkles, href: ROUTES.MISSIONS, shortcut: "R" },
  ] : pathname.startsWith(ROUTES.OPPORTUNITIES) ? [
    { label: "Browse matched opportunities", icon: Compass, href: ROUTES.OPPORTUNITIES, shortcut: "M" },
    { label: "Review saved opportunities", icon: ShoppingBag, href: `${ROUTES.OPPORTUNITIES}?saved=true`, shortcut: "S" },
  ] : [];

  return (
    <Dialog open={commandMenuOpen} onOpenChange={(v) => { setCommandMenuOpen(v); if (!v) setSearch(""); }}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content className="fixed left-[50%] top-[20%] z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg overflow-hidden data-[state=open]:animate-scale-in focus:outline-none">
          <Command className="rounded-xl" shouldFilter>
            <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] px-4 py-3">
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Search or jump to…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))] text-[hsl(var(--text-primary))]"
                aria-label="Command search"
              />
              <button
                onClick={() => { setCommandMenuOpen(false); setSearch(""); }}
                className="flex items-center justify-center rounded-md p-1 mb-1 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--secondary))] transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-[hsl(var(--text-secondary))]">
              No results found
            </Command.Empty>
            {contextualItems.length > 0 && <Command.Group heading="On this page" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[hsl(var(--primary))]">
              {contextualItems.map(({ label, icon: Icon, href, shortcut }) => <Command.Item key={label} value={label} onSelect={() => handleSelect(href)} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm aria-selected:bg-[hsl(var(--secondary))] aria-selected:text-[hsl(var(--primary))]"><Icon className="h-4 w-4" /><span className="flex-1">{label}</span><kbd className="rounded border border-[hsl(var(--border))] px-1.5 py-0.5 text-[10px] text-[hsl(var(--text-secondary))]">{shortcut}</kbd></Command.Item>)}
            </Command.Group>}
            {COMMANDS.map(({ group, items }) => (
              <Command.Group key={group} heading={group} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[hsl(var(--text-secondary))]">
                {items.map(({ label, icon: Icon, href }) => (
                  <Command.Item
                    key={href}
                    value={label}
                    onSelect={() => handleSelect(href)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-[hsl(var(--text-primary))] cursor-pointer",
                      "aria-selected:bg-[hsl(var(--secondary))] aria-selected:text-[hsl(var(--primary))]",
                      "transition-colors"
                    )}
                  >
                    <Icon className="h-4 w-4 text-[hsl(var(--text-secondary))]" />
                    {label}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
          </Command>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
