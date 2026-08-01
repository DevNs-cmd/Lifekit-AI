"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField } from "@/components/shared/form-field";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validation/schemas";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [showPwd, setShowPwd] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({ resolver: zodResolver(resetPasswordSchema) });

  if (!token) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="font-semibold text-[hsl(var(--text-primary))] mb-2">Invalid reset link</h2>
          <p className="text-sm text-[hsl(var(--text-secondary))] mb-6">
            This password reset link is invalid or has expired. Request a new one below.
          </p>
          <Button asChild className="w-full">
            <Link href={ROUTES.FORGOT_PASSWORD}>Request new link</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  async function onSubmit(_data: ResetPasswordFormData) {
    await new Promise(r => setTimeout(r, 800));
    setDone(true);
    toast.success("Password reset successfully!");
  }

  if (done) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="h-14 w-14 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 text-2xl mb-4">✓</div>
          <h2 className="font-semibold text-[hsl(var(--text-primary))] mb-2">Password updated!</h2>
          <p className="text-sm text-[hsl(var(--text-secondary))] mb-6">
            Your password has been reset. You can now sign in with your new password.
          </p>
          <Button className="w-full" onClick={() => router.push(ROUTES.SIGN_IN)}>
            Go to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">Set new password</CardTitle>
        <CardDescription>Enter a strong new password for your account.</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField label="New password" htmlFor="password" required error={errors.password?.message}>
            <Input
              id="password"
              type={showPwd ? "text" : "password"}
              autoComplete="new-password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={!!errors.password}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="text-[hsl(var(--text-secondary))]"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register("password")}
            />
          </FormField>
          <FormField label="Confirm password" htmlFor="confirmPassword" required error={errors.confirmPassword?.message}>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
          </FormField>
          <Button type="submit" className="w-full" loading={isSubmitting} size="lg">
            Reset password
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-[hsl(var(--text-secondary))]">
          Remember it?{" "}
          <Link href={ROUTES.SIGN_IN} className="font-medium text-[hsl(var(--primary))] hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
