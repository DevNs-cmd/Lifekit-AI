"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, Target, CheckSquare, ShoppingBag, Compass, Brain, Bot, Home, User, Settings, Plus } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

  return (
    <Dialog open={commandMenuOpen} onOpenChange={(v) => { setCommandMenuOpen(v); if (!v) setSearch(""); }}>
      <DialogContent className="p-0 max-w-lg overflow-hidden top-[20%] translate-y-0">
        <Command className="rounded-xl" shouldFilter>
          <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] px-4 py-3">
            <Search className="h-4 w-4 text-[hsl(var(--text-secondary))] shrink-0" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search or jump to…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))] text-[hsl(var(--text-primary))]"
              aria-label="Command search"
            />
            <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-[hsl(var(--border))] px-1.5 text-[10px] font-medium text-[hsl(var(--text-secondary))]">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-[hsl(var(--text-secondary))]">
              No results found
            </Command.Empty>
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
      </DialogContent>
    </Dialog>
  );
}
