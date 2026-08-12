"use client";

import * as React from "react";
import { MessageCircle, ChevronLeft, ChevronRight, Trash2, Clock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatSession {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  agentName?: string;
}

interface RecentChatsSidebarProps {
  chats: ChatSession[];
  activeId?: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export function RecentChatsSidebar({
  chats,
  activeId,
  onSelect,
  onDelete,
  onNew,
}: RecentChatsSidebarProps) {
  const [open, setOpen] = React.useState(true);

  return (
    <div className="relative flex shrink-0">
      {/* ── Sidebar panel ───────────────────────────────────── */}
      <div className={cn(
        "flex shrink-0 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all duration-200 overflow-hidden",
        open ? "w-56" : "w-0",
      )}>
        {/* ── Sidebar content ────────────────────────────────── */}
        <div className="flex flex-col w-56">

          {/* Header */}
          <div className="flex items-center justify-between px-3 py-3 border-b border-[hsl(var(--border))]">
            <div className="flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
              <span className="text-xs font-bold text-[hsl(var(--text-primary))] uppercase tracking-wide">
                Chats
              </span>
            </div>

            {/* New chat button */}
            <button
              onClick={onNew}
              aria-label="New chat"
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </button>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto py-1">
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 text-center px-3">
                <Clock className="h-5 w-5 text-[hsl(var(--text-secondary))] opacity-40 mb-1.5" />
                <p className="text-[11px] text-[hsl(var(--text-secondary))] opacity-60">
                  No recent chats
                </p>
              </div>
            ) : (
              chats.map(chat => {
                const isActive = activeId === chat.id;
                return (
                  <div
                    key={chat.id}
                    className={cn(
                      "group relative flex items-center gap-0 cursor-pointer transition-colors",
                      isActive
                        ? "bg-[hsl(var(--secondary))] border-l-2 border-[hsl(var(--primary))]"
                        : "border-l-2 border-transparent hover:bg-[hsl(var(--background-subtle))] hover:border-[hsl(var(--border))]",
                    )}
                    onClick={() => onSelect(chat.id)}
                  >
                    <div className="flex-1 min-w-0 px-3 py-2.5">
                      <p className={cn(
                        "text-xs font-semibold truncate leading-snug",
                        isActive
                          ? "text-[hsl(var(--primary))]"
                          : "text-[hsl(var(--text-primary))]",
                      )}>
                        {chat.title}
                      </p>
                      <p className="text-[10px] text-[hsl(var(--text-secondary))] opacity-60 mt-0.5">
                        {chat.timestamp}
                      </p>
                    </div>

                    {/* Delete — hover reveal */}
                    <button
                      onClick={e => { e.stopPropagation(); onDelete(chat.id); }}
                      aria-label="Delete chat"
                      className={cn(
                        "flex h-full items-center pr-2.5 pl-1",
                        "opacity-0 group-hover:opacity-100 transition-opacity",
                        "text-[hsl(var(--text-secondary))] hover:text-red-500",
                      )}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Toggle tab — always visible, sits outside the panel ── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Collapse chat history" : "Expand chat history"}
        title={open ? "Collapse chat history" : "Expand chat history"}
        className={cn(
          "flex h-full w-5 shrink-0 flex-col items-center justify-center",
          "border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]",
          "text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))]",
          "transition-colors group",
        )}
      >
        <span className="flex h-8 w-full items-center justify-center">
          {open
            ? <ChevronLeft className="h-3 w-3" />
            : <ChevronRight className="h-3 w-3" />}
        </span>
        <span className="absolute top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none">
          {[0, 1, 2].map(i => (
            <span key={i} className="block h-0.5 w-0.5 rounded-full bg-current" />
          ))}
        </span>
      </button>
    </div>
  );
}
