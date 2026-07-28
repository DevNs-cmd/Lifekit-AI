"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { Send, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import { Card, CardContent } from "@/components/ui/card";

const schema = z.object({
  name:    z.string().min(2, "Enter your name"),
  email:   z.string().email("Enter a valid email"),
  subject: z.string().min(5, "Enter a subject"),
  message: z.string().min(20, "Enter at least 20 characters"),
});
type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(_data: FormData) {
    await new Promise(r => setTimeout(r, 800));
    setSubmitted(true);
    toast.success("Message sent! We'll get back to you within 24 hours.");
  }

  return (
    <div className="py-16 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-[hsl(var(--text-primary))]">Get in touch</h1>
          <p className="mt-3 text-lg text-[hsl(var(--text-secondary))]">We'd love to hear from you. Our team responds within 24 hours.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            {[
              { icon: Mail, title: "Email", value: "hello@lifekit.ai" },
              { icon: MapPin, title: "Headquarters", value: "Bengaluru, India" },
            ].map(({ icon: Icon, title, value }) => (
              <Card key={title}><CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><Icon className="h-4 w-4" /></div>
                <div><p className="text-xs text-[hsl(var(--text-secondary))]">{title}</p><p className="text-sm font-medium text-[hsl(var(--text-primary))]">{value}</p></div>
              </CardContent></Card>
            ))}
          </div>

          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="h-14 w-14 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 text-2xl mb-4">✓</div>
                  <h3 className="font-semibold text-[hsl(var(--text-primary))]">Message sent!</h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))] mt-2">We'll respond to your email within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Name" htmlFor="name" required error={errors.name?.message}><Input id="name" {...register("name")} error={!!errors.name} /></FormField>
                    <FormField label="Email" htmlFor="email" required error={errors.email?.message}><Input id="email" type="email" {...register("email")} error={!!errors.email} /></FormField>
                  </div>
                  <FormField label="Subject" htmlFor="subject" required error={errors.subject?.message}><Input id="subject" {...register("subject")} error={!!errors.subject} /></FormField>
                  <FormField label="Message" htmlFor="message" required error={errors.message?.message}><Textarea id="message" rows={5} {...register("message")} error={!!errors.message} /></FormField>
                  <Button type="submit" loading={isSubmitting} rightIcon={<Send className="h-4 w-4" />}>Send message</Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
