"use client";

import * as React from "react";
import { MessageCircle, X, ChevronLeft, ChevronRight, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
    <div className={cn(
      "relative flex flex-col shrink-0 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all duration-200",
      open ? "w-56" : "w-10",
    )}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Collapse recent chats" : "Expand recent chats"}
        className="absolute -right-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] shadow-sm transition-colors"
      >
        {open ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>

      {open && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-3 border-b border-[hsl(var(--border))]">
            <div className="flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
              <span className="text-xs font-bold text-[hsl(var(--text-primary))] uppercase tracking-wide">Recent</span>
            </div>
            <Button
              size="xs"
              variant="ghost"
              onClick={onNew}
              className="text-[10px] h-6 px-2 text-[hsl(var(--primary))]"
            >
              + New
            </Button>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto py-1">
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 text-center px-3">
                <Clock className="h-5 w-5 text-[hsl(var(--text-secondary))] opacity-40 mb-1.5" />
                <p className="text-[11px] text-[hsl(var(--text-secondary))] opacity-60">No recent chats</p>
              </div>
            ) : (
              chats.map(chat => (
                <div
                  key={chat.id}
                  className={cn(
                    "group relative flex flex-col px-3 py-2.5 cursor-pointer transition-colors",
                    activeId === chat.id
                      ? "bg-[hsl(var(--secondary))]"
                      : "hover:bg-[hsl(var(--background-subtle))]",
                  )}
                  onClick={() => onSelect(chat.id)}
                >
                  <p className={cn(
                    "text-xs font-semibold truncate pr-5 leading-snug",
                    activeId === chat.id
                      ? "text-[hsl(var(--primary))]"
                      : "text-[hsl(var(--text-primary))]",
                  )}>
                    {chat.title}
                  </p>
                  <p className="text-[10px] text-[hsl(var(--text-secondary))] truncate mt-0.5">
                    {chat.preview}
                  </p>
                  <p className="text-[10px] text-[hsl(var(--text-secondary))] opacity-60 mt-0.5">
                    {chat.timestamp}
                  </p>

                  {/* Delete on hover */}
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(chat.id); }}
                    aria-label="Delete chat"
                    className="absolute right-2 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--destructive))]"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
