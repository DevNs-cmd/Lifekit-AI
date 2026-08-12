"use client";

import * as React from "react";
import { X, Bot, Sparkles, Send, RefreshCw, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUIStore } from "@/stores/ui-store";
import { useAICoachStore } from "@/stores/ai-coach-store";
import { sendCoachMessage } from "@/lib/api/ai";
import { generateId, cn } from "@/lib/utils";
import type { ConversationMessage } from "@/types/ai";

// Returns true if two timestamps are more than 5 minutes apart
function shouldShowDivider(a: string, b: string) {
  return new Date(b).getTime() - new Date(a).getTime() > 5 * 60 * 1000;
}

function formatDividerTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function AICoachPanel() {
  const { setAiCoachPanelOpen } = useUIStore();
  const {
    messages, addMessage, removeMessage,
    isGenerating, setIsGenerating,
    suggestedPrompts, context, clearMessages,
  } = useAICoachStore();
  const [input, setInput] = React.useState("");
  const bottomRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || isGenerating) return;
    setInput("");

    const userMessage: ConversationMessage = {
      id: generateId(),
      role: "user",
      content: msg,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMessage);
    setIsGenerating(true);

    const loadingId = generateId();
    addMessage({
      id: loadingId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      metadata: { loading: true },
    });

    try {
      const response = await sendCoachMessage(msg, { missionTitle: context.currentMissionTitle });
      removeMessage(loadingId);
      addMessage(response);
    } catch {
      removeMessage(loadingId);
      addMessage({
        id: generateId(),
        role: "assistant",
        content: "Sorry, I ran into an issue. Please try again.",
        timestamp: new Date().toISOString(),
        metadata: { isError: true },
      });
    } finally {
      setIsGenerating(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Find last assistant message index for contextual prompts
  const lastAssistantIdx = messages.reduce(
    (acc, m, i) => (m.role === "assistant" && !m.metadata?.loading ? i : acc),
    -1,
  );

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--card))]" role="complementary" aria-label="AI Coach">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--border))]">
        {/* Circular gradient avatar */}
        <div className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full lifekit-gradient shadow-sm",
          isGenerating && "animate-pulse",
        )}>
          <Bot className="h-4 w-4 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">AI Coach</p>
          {context.currentMissionTitle ? (
            <p className="text-xs text-[hsl(var(--text-secondary))] truncate">
              Context: {context.currentMissionTitle}
            </p>
          ) : (
            <p className="text-xs text-[hsl(var(--text-secondary))]">
              {isGenerating ? "Thinking…" : "Ready to help"}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            title="Clear conversation"
            onClick={clearMessages}
            aria-label="Clear conversation"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--secondary))] transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setAiCoachPanelOpen(false)}
            aria-label="Close AI Coach"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--secondary))] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Context chips ─────────────────────────────────────── */}
      {(context.currentMissionTitle || context.memoryActive) && (
        <div className="flex flex-wrap gap-1.5 px-4 py-2 bg-[hsl(var(--background-subtle))]">
          {context.currentMissionTitle && (
            <span className="inline-flex items-center gap-1 rounded-xl bg-[hsl(var(--secondary))] px-2.5 py-0.5 text-xs text-[hsl(var(--primary))] font-medium">
              <Sparkles className="h-3 w-3" />{context.currentMissionTitle}
            </span>
          )}
          {context.memoryActive && (
            <span className="inline-flex items-center gap-1 rounded-xl bg-purple-100 dark:bg-purple-900/30 px-2.5 py-0.5 text-xs text-purple-700 dark:text-purple-300 font-medium">
              Memory active
            </span>
          )}
        </div>
      )}

      {/* ── Messages ──────────────────────────────────────────── */}
      <ScrollArea className="flex-1 px-4 py-3">

        {/* Empty state */}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center gap-3 px-4 pb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full lifekit-gradient shadow-md">
              <Bot className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">Your AI Coach is ready</p>
              <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">
                Ask anything about your missions, goals, or next steps.
              </p>
            </div>
            {/* Stacked suggested prompts — pinned above input with bottom gap */}
            <div className="flex flex-col gap-1.5 w-full mt-2 mb-2">
              {suggestedPrompts.slice(0, 3).map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSend(p.prompt)}
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background-subtle))] px-3 py-2 text-xs text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))] transition-colors text-left"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => {
                const prevMsg = messages[idx - 1];
                const nextMsg = messages[idx + 1];

                // Show time divider if gap > 5 min from previous message
                const showDivider = prevMsg && shouldShowDivider(prevMsg.timestamp, msg.timestamp);

                // Hide avatar when previous message was also from assistant (consecutive run)
                const isConsecutiveAssistant =
                  msg.role === "assistant" && prevMsg?.role === "assistant";

                // Show contextual prompt chips after the last real assistant message
                const isLastAssistant = idx === lastAssistantIdx;

                return (
                  <React.Fragment key={msg.id}>
                    {/* Time divider */}
                    {showDivider && (
                      <div className="flex items-center gap-2 py-2">
                        <div className="flex-1 h-px bg-[hsl(var(--border))]" />
                        <span className="text-[10px] text-[hsl(var(--text-secondary))] opacity-60 shrink-0">
                          {formatDividerTime(msg.timestamp)}
                        </span>
                        <div className="flex-1 h-px bg-[hsl(var(--border))]" />
                      </div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "flex gap-2.5",
                        msg.role === "user" ? "justify-end" : "justify-start",
                        // tighter spacing in a consecutive run
                        isConsecutiveAssistant ? "mt-0.5" : "mt-3",
                      )}
                    >
                      {/* Avatar — only on first in a consecutive assistant run */}
                      {msg.role === "assistant" && (
                        <div className="w-7 shrink-0 mt-0.5">
                          {!isConsecutiveAssistant && (
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className={cn(
                                "text-xs text-white lifekit-gradient",
                                isGenerating && msg.metadata?.loading && "animate-pulse",
                              )}>
                                <Bot className="h-3.5 w-3.5 text-white" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      )}

                      <div className={cn(
                        "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                        msg.role === "user"
                          ? "bg-[hsl(var(--primary))] text-white"
                          : msg.metadata?.isError
                            ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300"
                            : "bg-[hsl(var(--secondary))] text-[hsl(var(--text-primary))]",
                      )}>
                        {msg.metadata?.loading ? (
                          <div className="flex gap-1 py-1">
                            {[0, 1, 2].map((i) => (
                              <span
                                key={i}
                                className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]/60 animate-bounce"
                                style={{ animationDelay: `${i * 0.15}s` }}
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        )}
                      </div>
                    </motion.div>

                    {/* Contextual prompts after last assistant message */}
                    {isLastAssistant && suggestedPrompts.length > 0 && !isGenerating && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.2 }}
                        className="flex flex-wrap gap-1.5 pl-9 pt-1.5"
                      >
                        {suggestedPrompts.slice(0, 2).map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleSend(p.prompt)}
                            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-1 text-xs text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-colors"
                          >
                            {p.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </React.Fragment>
                );
              })}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* ── Input ─────────────────────────────────────────────── */}
      <div className="border-t border-[hsl(var(--border))] p-3">
        <div className="flex items-end gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background-subtle))] px-3 pt-2.5 pb-2 focus-within:border-[hsl(var(--primary))] transition-colors">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your AI Coach…"
            rows={1}
            className="flex-1 resize-none min-h-[28px] max-h-32 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            aria-label="Message AI Coach"
          />
          {isGenerating ? (
            <button
              onClick={() => setIsGenerating(false)}
              aria-label="Stop generating"
              title="Stop generating"
              className="flex h-7 w-7 shrink-0 mb-0.5 items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
          ) : (
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              aria-label="Send message"
              className="flex h-7 w-7 shrink-0 mb-0.5 items-center justify-center rounded-lg lifekit-gradient text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="mt-1.5 text-[10px] text-[hsl(var(--text-secondary))] opacity-50 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
