"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField } from "@/components/shared/form-field";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validation/schemas";
import { ROUTES } from "@/constants/routes";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(_data: ForgotPasswordFormData) {
    await new Promise(r => setTimeout(r, 800));
    setSent(true);
    toast.success("Reset link sent! Check your inbox.");
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">Forgot your password?</CardTitle>
        <CardDescription>Enter your email and we'll send you a reset link.</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {sent ? (
          <div className="text-center py-4">
            <div className="h-14 w-14 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 text-2xl mb-4">✓</div>
            <h3 className="font-semibold text-[hsl(var(--text-primary))]">Check your email</h3>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-2">We sent a password reset link to <strong>{getValues("email")}</strong>. The link expires in 15 minutes.</p>
            <Button className="mt-6 w-full" variant="outline" asChild leftIcon={<ArrowLeft className="h-4 w-4" />}><Link href={ROUTES.SIGN_IN}>Back to sign in</Link></Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField label="Email address" htmlFor="email" required error={errors.email?.message}>
              <Input id="email" type="email" autoComplete="email" leftIcon={<Mail className="h-4 w-4" />} error={!!errors.email} {...register("email")} />
            </FormField>
            <Button type="submit" className="w-full" loading={isSubmitting} size="lg">Send reset link</Button>
          </form>
        )}
        {!sent && (
          <p className="mt-4 text-center text-sm text-[hsl(var(--text-secondary))]">
            Remember it?{" "}<Link href={ROUTES.SIGN_IN} className="font-medium text-[hsl(var(--primary))] hover:underline">Back to sign in</Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
