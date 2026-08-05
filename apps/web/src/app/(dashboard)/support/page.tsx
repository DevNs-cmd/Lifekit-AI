"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HelpCircle, MessageCircle, Send, Bot, User, X, Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FormField } from "@/components/shared/form-field";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { contactSupportSchema, type ContactSupportFormData } from "@/lib/validation/schemas";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ── Canned support replies ─────────────────────────────── */
const AUTO_REPLIES: Record<string, string> = {
  default: "Thanks for reaching out! A support agent will join shortly. In the meantime, you can check our FAQs below.",
  hello: "Hi there! 👋 How can I help you today?",
  hi: "Hi there! 👋 How can I help you today?",
  hey: "Hey! What can I help you with?",
  bug: "Sorry to hear you're experiencing a bug. Could you describe what happened, which page it occurred on, and what you expected? That'll help us reproduce it fast.",
  billing: "For billing questions, please include your account email and a description of the issue. Our billing team will respond within 1 business day.",
  password: "To reset your password, go to the Sign-in page and click 'Forgot password'. A reset link will be sent to your registered email.",
  mission: "For mission-related help, check the Help Centre or describe your issue here and a specialist will assist.",
  thanks: "You're welcome! Is there anything else I can help you with?",
  bye: "Goodbye! Don't hesitate to reach out anytime. 👋",
};

function getReply(msg: string): string {
  const lower = msg.toLowerCase();
  for (const [key, reply] of Object.entries(AUTO_REPLIES)) {
    if (key !== "default" && lower.includes(key)) return reply;
  }
  return AUTO_REPLIES.default;
}

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  time: string;
}

const FAQS = [
  { q: "How do I create my first Life Mission?", a: "Go to the Home dashboard and type your goal into the AI Goal Engine, then click 'Create Mission'. The AI will generate a structured execution plan for you." },
  { q: "How does AI memory work?", a: "LifeKit remembers your preferences, constraints and decisions to personalise recommendations. You can review and delete memories any time from the Memory section." },
  { q: "Can I pause a mission?", a: "Yes — open any mission, then click the Pause button in the header. Your progress and plan are preserved and you can resume at any time." },
  { q: "How do I connect with marketplace providers?", a: "Browse the Marketplace, click on a listing, and use the 'Contact Provider' or 'Purchase' buttons. Providers respond within their stated response time." },
  { q: "What happens when I downgrade my plan?", a: "You retain access to all features until the end of your current billing period. After that, missions exceeding your plan's limit will be archived (not deleted) and reactivatable if you upgrade." },
  { q: "How do I track my application to an opportunity?", a: "Open the Opportunities page, click on the opportunity, then use the 'Add Application Tasks' button to track your progress in Tasks." },
];

/* ── Live Chat Component ────────────────────────────────── */
function LiveChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "agent",
      content: "Hi! 👋 Welcome to LifeKit Support. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    setInput("");

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: getReply(text),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, agentMsg]);
    }, 1200 + Math.random() * 800);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat window */}
      {open && (
        <div className="w-[340px] sm:w-[380px] rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: "520px" }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[hsl(var(--primary))] text-white">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-tight">LifeKit Support</p>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
                <p className="text-xs text-white/80">Online · typically replies instantly</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[hsl(var(--background-subtle))]">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={cn("flex gap-2 items-end", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "agent" && (
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarFallback className="bg-[hsl(var(--primary))] text-white text-[10px] font-bold">LK</AvatarFallback>
                  </Avatar>
                )}
                <div className={cn(
                  "max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-[hsl(var(--primary))] text-white rounded-br-none"
                    : "bg-[hsl(var(--card))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-bl-none",
                )}>
                  <p>{msg.content}</p>
                  <p className={cn(
                    "text-[10px] mt-1 opacity-60 text-right",
                    msg.role === "user" ? "text-white" : "text-[hsl(var(--text-secondary))]"
                  )}>
                    {msg.time}
                  </p>
                </div>
                {msg.role === "user" && (
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarFallback className="bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] text-[10px] font-bold">
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2 items-end">
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarFallback className="bg-[hsl(var(--primary))] text-white text-[10px] font-bold">LK</AvatarFallback>
                </Avatar>
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl rounded-bl-none px-3 py-2.5">
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--text-secondary))] animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-end gap-2 px-3 py-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Type a message…"
              className="flex-1 text-sm bg-[hsl(var(--background-subtle))] border border-[hsl(var(--border))] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--muted-foreground))]"
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={!input.trim()}
              aria-label="Send"
              className="shrink-0 h-9 w-9"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Close live chat" : "Open live chat"}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200",
          "bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-hover))]",
          open && "rotate-90",
        )}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────── */
export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ContactSupportFormData>({
    resolver: zodResolver(contactSupportSchema),
    defaultValues: { priority: "medium" },
  });

  async function onSubmit(_data: ContactSupportFormData) {
    await new Promise(r => setTimeout(r, 800));
    setSubmitted(true);
    toast.success("Support ticket submitted! We'll respond within 24 hours.");
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
            <HelpCircle className="h-7 w-7 text-[hsl(var(--primary))]" /> Support
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            We&apos;re here to help. Find answers or get in touch.
          </p>
        </div>
        {/* Live chat status pill */}
        <div className="flex items-center gap-2 rounded-full border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--text-secondary))] shrink-0">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Live chat available
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FAQs */}
        <Card>
          <CardHeader><CardTitle className="text-base">Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Accordion type="single" collapsible>
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} value={String(i)} className="px-5">
                  <AccordionTrigger className="text-sm text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-[hsl(var(--text-secondary))]">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact form */}
        <Card>
          <CardHeader><CardTitle className="text-base">Contact Support</CardTitle></CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-8">
                <div className="h-14 w-14 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 text-2xl mb-4">✓</div>
                <h3 className="font-semibold text-[hsl(var(--text-primary))]">Ticket submitted!</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] mt-2">We&apos;ll respond to your email within 24 hours.</p>
                <Button variant="outline" className="mt-4" onClick={() => setSubmitted(false)}>Submit another</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <FormField label="Subject" htmlFor="subject" required error={errors.subject?.message}>
                  <Input id="subject" placeholder="Briefly describe your issue" {...register("subject")} error={!!errors.subject} />
                </FormField>
                <FormField label="Category" htmlFor="category" required error={errors.category?.message}>
                  <Select onValueChange={v => setValue("category", v as ContactSupportFormData["category"])}>
                    <SelectTrigger id="category"><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">Bug report</SelectItem>
                      <SelectItem value="feature">Feature request</SelectItem>
                      <SelectItem value="billing">Billing question</SelectItem>
                      <SelectItem value="account">Account issue</SelectItem>
                      <SelectItem value="marketplace">Marketplace dispute</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Description" htmlFor="description" required error={errors.description?.message}
                  description="Please include as much detail as possible">
                  <Textarea id="description" rows={4} placeholder="Describe what happened and what you expected…" {...register("description")} error={!!errors.description} />
                </FormField>
                <Button type="submit" loading={isSubmitting} rightIcon={<Send className="h-4 w-4" />}>Submit ticket</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Floating live chat */}
      <LiveChat />
    </div>
  );
}
