"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HelpCircle, MessageCircle, FileQuestion, Flag, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FormField } from "@/components/shared/form-field";
import { contactSupportSchema, type ContactSupportFormData } from "@/lib/validation/schemas";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { icon: FileQuestion, label: "Help Centre", desc: "Browse FAQs and guides" },
  { icon: MessageCircle, label: "Live Chat", desc: "Chat with support" },
  { icon: Flag, label: "Report Issue", desc: "Flag a problem or bug" },
];

const FAQS = [
  { q: "How do I create my first Life Mission?", a: "Go to the Home dashboard and type your goal into the AI Goal Engine, then click 'Create Mission'. The AI will generate a structured execution plan for you." },
  { q: "How does AI memory work?", a: "LifeKit remembers your preferences, constraints and decisions to personalise recommendations. You can review and delete memories any time from the Memory section." },
  { q: "Can I pause a mission?", a: "Yes — open any mission, then click the Pause button in the header. Your progress and plan are preserved and you can resume at any time." },
  { q: "How do I connect with marketplace providers?", a: "Browse the Marketplace, click on a listing, and use the 'Contact Provider' or 'Purchase' buttons. Providers respond within their stated response time." },
  { q: "What happens when I downgrade my plan?", a: "You retain access to all features until the end of your current billing period. After that, missions exceeding your plan's limit will be archived (not deleted) and reactivatable if you upgrade." },
  { q: "How do I track my application to an opportunity?", a: "Open the Opportunities page, click on the opportunity, then use the 'Add Application Tasks' button to track your progress in Tasks." },
];

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
      <div>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
          <HelpCircle className="h-7 w-7 text-[hsl(var(--primary))]" /> Support
        </h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">We're here to help. Find answers or get in touch.</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {QUICK_LINKS.map(({ icon: Icon, label, desc }) => (
          <button key={label} className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] p-4 text-left hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--secondary))] transition-colors group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-colors">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{label}</p>
              <p className="text-xs text-[hsl(var(--text-secondary))]">{desc}</p>
            </div>
          </button>
        ))}
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
                <p className="text-sm text-[hsl(var(--text-secondary))] mt-2">We'll respond to your email within 24 hours.</p>
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
    </div>
  );
}
