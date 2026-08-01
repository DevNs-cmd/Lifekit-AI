"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField } from "@/components/shared/form-field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { signInSchema, type SignInFormData } from "@/lib/validation/schemas";
import { useAuthStore } from "@/stores/auth-store";
import { MOCK_USER } from "@/constants/mock-data";
import { ROUTES } from "@/constants/routes";

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<SignInFormData>({ resolver: zodResolver(signInSchema) });

  async function onSubmit(_data: SignInFormData) {
    await new Promise(r => setTimeout(r, 800));
    // Mock login — in production this calls the auth API
    try {
      login(MOCK_USER);
      toast.success("Welcome back!");
      router.push(ROUTES.DASHBOARD);
    } catch {
      setError("root", { message: "Invalid email or password." });
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your LifeKit account</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {errors.root && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.root.message}
            </div>
          )}

          <FormField label="Email address" htmlFor="email" required error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" leftIcon={<Mail className="h-4 w-4" />} error={!!errors.email} {...register("email")} />
          </FormField>

          <FormField label="Password" htmlFor="password" required error={errors.password?.message}>
            <Input
              id="password"
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={!!errors.password}
              rightIcon={
                <button type="button" onClick={() => setShowPwd(v => !v)} className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]" aria-label={showPwd ? "Hide password" : "Show password"}>
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register("password")}
            />
          </FormField>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">Remember me</Label>
            </div>
            <Link href={ROUTES.FORGOT_PASSWORD} className="text-sm text-[hsl(var(--primary))] hover:underline">Forgot password?</Link>
          </div>

          <Button type="submit" className="w-full" loading={isSubmitting} size="lg">Sign in</Button>
        </form>

        <p className="mt-6 text-center text-sm text-[hsl(var(--text-secondary))]">
          Don't have an account?{" "}
          <Link href={ROUTES.SIGN_UP} className="font-medium text-[hsl(var(--primary))] hover:underline">Get started free</Link>
        </p>
      </CardContent>
    </Card>
  );
}
