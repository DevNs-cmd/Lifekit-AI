"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, Send, Bot, RefreshCw, CheckCircle,
  Briefcase, TrendingUp, Heart, Globe, Building2,
  Brain,
} from "lucide-react";
import { LucideProps } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/shared/empty-state";
import { RecentChatsSidebar } from "@/components/shared/recent-chats-sidebar";
import { MOCK_AGENTS, sendCoachMessage } from "@/lib/api/ai";
import { ROUTES } from "@/constants/routes";
import { generateId, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ConversationMessage } from "@/types/ai";
import { useChatHistoryStore } from "@/stores/chat-history-store";

/* ── Domain config ─────────────────────────────────────── */
const DOMAIN_CONFIG: Record<string, {
  color: string; bg: string; border: string;
  icon: React.ComponentType<LucideProps>;
  tagline: string;
  prompts: string[];
}> = {
  career: {
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    icon: Briefcase,
    tagline: "Career · Jobs · Skills",
    prompts: ["Help me write a resume", "How do I prepare for interviews?", "What skills should I learn next?"],
  },
  finance: {
    color: "text-green-700 dark:text-green-300",
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    icon: TrendingUp,
    tagline: "Finance · Savings · Investments",
    prompts: ["Create a savings plan for me", "How should I start investing?", "Help me budget my income"],
  },
  health: {
    color: "text-red-700 dark:text-red-300",
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    icon: Heart,
    tagline: "Health · Fitness · Wellness",
    prompts: ["Build a workout plan for me", "What should I eat to lose weight?", "How do I stay consistent?"],
  },
  travel: {
    color: "text-cyan-700 dark:text-cyan-300",
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
    border: "border-cyan-200 dark:border-cyan-800",
    icon: Globe,
    tagline: "Travel · Trips · Itineraries",
    prompts: ["Plan a 7-day Europe trip", "What's the best budget travel destination?", "Help me create a travel budget"],
  },
  business: {
    color: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
    icon: Building2,
    tagline: "Business · Strategy · Growth",
    prompts: ["Validate my business idea", "Help me build a go-to-market plan", "Create a pitch deck outline"],
  },
};

const FALLBACK_CFG = {
  color: "text-gray-700 dark:text-gray-300",
  bg: "bg-gray-100 dark:bg-gray-800/30",
  border: "border-gray-200 dark:border-gray-700",
  icon: Bot,
  tagline: "",
  prompts: [],
};

export default function AgentDetailPage() {
  const { id: agentId } = useParams<{ id: string }>();
  const router = useRouter();
  const agent = MOCK_AGENTS.find(a => a.id === agentId);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    sessions,
    getSessionsForAgent,
    getActiveSessionId,
    setActiveSessionId,
    createSession,
    addMessageToSession,
    deleteSession,
    clearSessionMessages,
  } = useChatHistoryStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const recentChats = isHydrated && agentId ? getSessionsForAgent(agentId) : [];
  const storedActiveId = isHydrated && agentId ? getActiveSessionId(agentId) : undefined;
  const activeChatId = storedActiveId;

  // Auto-initialize session if none exists for this agent
  useEffect(() => {
    if (!isHydrated || !agentId || !agent) return;
    const currentSessions = getSessionsForAgent(agentId);
    if (currentSessions.length === 0) {
      const newSess = createSession(agentId, "First session", agent.name);
      setActiveSessionId(agentId, newSess.id);
    } else if (!storedActiveId || !currentSessions.some(s => s.id === storedActiveId)) {
      setActiveSessionId(agentId, currentSessions[0].id);
    }
  }, [isHydrated, agentId, agent, getSessionsForAgent, storedActiveId, createSession, setActiveSessionId]);

  const activeSession = activeChatId ? sessions[activeChatId] : undefined;
  const rawMessages = activeSession?.messages ?? [];

  const displayMessages = isGenerating
    ? [
        ...rawMessages,
        {
          id: "loading-temp",
          role: "assistant" as const,
          content: "",
          timestamp: new Date().toISOString(),
          metadata: { loading: true },
        },
      ]
    : rawMessages;

  function handleSelectChat(chatId: string) {
    if (agentId) setActiveSessionId(agentId, chatId);
  }

  function handleNewChat() {
    if (!agentId || !agent) return;
    const newSess = createSession(agentId, "New chat", agent.name);
    setActiveSessionId(agentId, newSess.id);
  }

  function handleDeleteChat(chatId: string) {
    deleteSession(chatId);
  }

  function handleClearMessages() {
    if (activeChatId) {
      clearSessionMessages(activeChatId);
      toast("Conversation cleared.");
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  if (!agent) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Bot className="h-8 w-8" />}
          title="Agent not found"
          action={{ label: "Back to Agents", onClick: () => router.push(ROUTES.AGENTS) }}
        />
      </div>
    );
  }

  const cfg = DOMAIN_CONFIG[agent.domain] ?? FALLBACK_CFG;
  const DomainIcon = cfg.icon;

  async function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || isGenerating || !agentId || !agent) return;
    setInput("");

    let currentSessionId = activeChatId;
    if (!currentSessionId || !sessions[currentSessionId]) {
      const newSess = createSession(agentId, "New chat", agent.name);
      setActiveSessionId(agentId, newSess.id);
      currentSessionId = newSess.id;
    }

    const userMsg: ConversationMessage = {
      id: generateId(), role: "user", content: msg,
      timestamp: new Date().toISOString(),
    };
    addMessageToSession(currentSessionId, userMsg);
    setIsGenerating(true);

    try {
      const response = await sendCoachMessage(msg, {
        agentDomain: agent.domain,
        agentName: agent.name,
      });
      addMessageToSession(currentSessionId, response);
    } catch {
      toast.error("Failed to get a response. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    // Use fixed viewport height minus the top-bar (4rem). overflow-hidden keeps
    // scroll contained inside the chat ScrollArea rather than the page scroll.
    <div className="flex h-[calc(100dvh-4rem)] overflow-hidden">

      {/* ── Recent chats narrow sidebar ─────────────────────── */}
      <RecentChatsSidebar
        chats={recentChats}
        activeId={activeChatId}
        onSelect={handleSelectChat}
        onNew={handleNewChat}
        onDelete={handleDeleteChat}
      />

      {/* ── Left info panel (desktop only) ──────────────────── */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">

        {/* Agent identity header */}
        <div className={cn("p-5 border-b border-[hsl(var(--border))] shrink-0", cfg.bg)}>
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 -ml-1 text-[hsl(var(--text-secondary))]"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => router.push(ROUTES.AGENTS)}
          >
            All agents
          </Button>

          <div className="flex items-center gap-3">
            <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2", cfg.border, cfg.bg)}>
              <DomainIcon className={cn("h-7 w-7", cfg.color)} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-[hsl(var(--text-primary))]">{agent.name}</h2>
                <Badge variant={agent.isAvailable ? "success" : "outline"} className="text-[10px]">
                  {agent.isAvailable ? "Online" : "Offline"}
                </Badge>
              </div>
              <p className={cn("text-xs font-medium mt-0.5", cfg.color)}>{cfg.tagline}</p>
            </div>
          </div>

          <p className="mt-3 text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
            {agent.description}
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-5">

            {/* Capabilities */}
            <div>
              <p className="text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-2">
                What I can do
              </p>
              <ul className="space-y-2">
                {agent.capabilities.map((cap) => (
                  <li key={cap} className="flex items-start gap-2 text-xs text-[hsl(var(--text-secondary))]">
                    <CheckCircle className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", cfg.color)} />
                    {cap}
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Memory badge */}
            <div className={cn("rounded-xl border p-3", cfg.border, cfg.bg)}>
              <div className="flex items-center gap-2 mb-1.5">
                <Brain className={cn("h-3.5 w-3.5", cfg.color)} />
                <p className={cn("text-xs font-semibold", cfg.color)}>Memory active</p>
              </div>
              <p className="text-[10px] text-[hsl(var(--text-secondary))] leading-relaxed">
                {agent.name} has access to your Life Memory and mission context to personalise every response.
              </p>
            </div>

            {rawMessages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                onClick={handleClearMessages}
              >
                Clear conversation
              </Button>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* ── Main chat area ───────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0">
          <Button variant="ghost" size="icon-sm" onClick={() => router.push(ROUTES.AGENTS)} aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", cfg.bg)}>
            <DomainIcon className={cn("h-5 w-5", cfg.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{agent.name}</p>
              <Badge variant={agent.isAvailable ? "success" : "outline"} className="text-[10px]">
                {agent.isAvailable ? "Online" : "Offline"}
              </Badge>
            </div>
            <p className={cn("text-xs", cfg.color)}>{cfg.tagline}</p>
          </div>
          <Button
            variant="ghost" size="icon-sm"
            onClick={handleClearMessages}
            aria-label="Clear conversation"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="p-4 sm:p-6">
            {displayMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center py-12">
                <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl mb-4", cfg.bg)}>
                  <DomainIcon className={cn("h-8 w-8", cfg.color)} />
                </div>
                <h2 className="font-semibold text-[hsl(var(--text-primary))] mb-2">
                  Start a conversation with {agent.name}
                </h2>
                <p className="text-sm text-[hsl(var(--text-secondary))] max-w-sm mb-6 leading-relaxed">
                  {agent.description}
                </p>
                {cfg.prompts.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center max-w-md">
                    {cfg.prompts.map((p) => (
                      <button
                        key={p}
                        onClick={() => handleSend(p)}
                        className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 text-xs text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto">
                {displayMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}
                  >
                    {msg.role === "assistant" && (
                      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                        <AvatarFallback className={cn("text-xs font-bold", cfg.bg, cfg.color)}>
                          {agent.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn(
                      "max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm",
                      msg.role === "user"
                        ? "bg-[hsl(var(--primary))] text-white rounded-tr-none"
                        : "bg-[hsl(var(--secondary))] text-[hsl(var(--text-primary))] rounded-tl-none"
                    )}>
                      {msg.metadata?.loading ? (
                        <div className="flex gap-1 py-1">
                          {[0, 1, 2].map(i => (
                            <span
                              key={i}
                              className="h-1.5 w-1.5 rounded-full bg-current opacity-60 animate-bounce"
                              style={{ animationDelay: `${i * 0.15}s` }}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      )}
                      {!msg.metadata?.loading && (
                        <p className={cn(
                          "text-[10px] mt-1.5 opacity-60",
                          msg.role === "user" ? "text-right text-white" : "text-[hsl(var(--text-secondary))]"
                        )}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </ScrollArea>


        {/* Input bar */}
        <div className="border-t border-[hsl(var(--border))] p-4 shrink-0 bg-[hsl(var(--card))]">
          <div className="flex gap-2 max-w-3xl mx-auto">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={agent.isAvailable ? `Ask ${agent.name} anything…` : `${agent.name} is currently offline`}
              rows={1}
              className="resize-none min-h-[42px] max-h-32 text-sm"
              disabled={!agent.isAvailable || isGenerating}
            />
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={!input.trim() || isGenerating || !agent.isAvailable}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
