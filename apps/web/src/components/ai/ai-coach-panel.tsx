"use client";

import * as React from "react";
import { X, Bot, Sparkles, Send, RefreshCw } from "lucide-react";
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

export function AICoachPanel() {
  const { setAiCoachPanelOpen } = useUIStore();
  const { messages, addMessage, isGenerating, setIsGenerating, suggestedPrompts, context, clearMessages } = useAICoachStore();
  const [input, setInput] = React.useState("");
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // intentionally no auto-scroll — user controls scroll position
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

    // Optimistic loading message
    const loadingId = generateId();
    addMessage({ id: loadingId, role: "assistant", content: "", timestamp: new Date().toISOString(), metadata: { loading: true } });

    try {
      const response = await sendCoachMessage(msg, { missionTitle: context.currentMissionTitle });
      // Remove loading message (handled by index in real impl — here we just add the real one)
      addMessage(response);
    } catch {
      addMessage({
        id: generateId(),
        role: "assistant",
        content: "Sorry, I ran into an issue. Please try again.",
        timestamp: new Date().toISOString(),
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

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--card))]" role="complementary" aria-label="AI Coach">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--border))]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
          <Bot className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">AI Coach</p>
          {context.currentMissionTitle && (
            <p className="text-xs text-[hsl(var(--text-secondary))] truncate">Context: {context.currentMissionTitle}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={clearMessages} aria-label="Clear conversation"><RefreshCw className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setAiCoachPanelOpen(false)} aria-label="Close AI Coach"><X className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Context chips */}
      {(context.currentMissionTitle || context.memoryActive) && (
        <div className="flex flex-wrap gap-1.5 px-4 py-2 bg-[hsl(var(--background-subtle))]">
          {context.currentMissionTitle && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--secondary))] px-2 py-0.5 text-xs text-[hsl(var(--primary))] font-medium">
              <Sparkles className="h-3 w-3" />{context.currentMissionTitle}
            </span>
          )}
          {context.memoryActive && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 text-xs text-purple-700 dark:text-purple-300 font-medium">
              Memory active
            </span>
          )}
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                      <AvatarFallback className="bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] text-xs">AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "bg-[hsl(var(--primary))] text-white rounded-tr-none"
                      : "bg-[hsl(var(--secondary))] text-[hsl(var(--text-primary))] rounded-tl-none"
                  )}>
                    {msg.metadata?.loading ? (
                      <div className="flex gap-1 py-1">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    )}
                    <p className={cn("text-[10px] mt-1 opacity-60", msg.role === "user" ? "text-right text-white" : "text-[hsl(var(--text-secondary))]")}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Suggested prompts */}
      {messages.length === 0 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {suggestedPrompts.slice(0, 3).map((p) => (
            <button
              key={p.id}
              onClick={() => handleSend(p.prompt)}
              className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-1 text-xs text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-[hsl(var(--border))] p-3">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your AI Coach…"
            rows={1}
            className="resize-none min-h-[40px] max-h-32 py-2.5 text-sm"
            aria-label="Message AI Coach"
          />
          <Button size="icon" onClick={() => handleSend()} disabled={!input.trim() || isGenerating} aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </div>

      </div>
    </div>
  );
}
