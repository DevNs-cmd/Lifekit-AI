"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField } from "@/components/shared/form-field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { signUpSchema, type SignUpFormData } from "@/lib/validation/schemas";
import { useAuthStore } from "@/stores/auth-store";
import { MOCK_USER } from "@/constants/mock-data";
import { ROUTES } from "@/constants/routes";
import { Progress } from "@/components/ui/progress";

function passwordStrength(pwd: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map = [
    { label: "Too short", color: "bg-red-500" },
    { label: "Weak", color: "bg-red-400" },
    { label: "Fair", color: "bg-amber-400" },
    { label: "Good", color: "bg-blue-500" },
    { label: "Strong", color: "bg-green-500" },
  ];
  return { score, ...map[score] };
}

export default function SignUpPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SignUpFormData>({ resolver: zodResolver(signUpSchema) });
  const password = watch("password", "");
  const strength = passwordStrength(password);

  async function onSubmit(_data: SignUpFormData) {
    await new Promise(r => setTimeout(r, 900));
    login({ ...MOCK_USER, onboardingCompleted: false });
    toast.success("Account created! Let's set up your profile.");
    router.push(ROUTES.ONBOARDING);
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Start your first Life Mission for free</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField label="Full name" htmlFor="fullName" required error={errors.fullName?.message}>
            <Input id="fullName" autoComplete="name" leftIcon={<User className="h-4 w-4" />} error={!!errors.fullName} {...register("fullName")} />
          </FormField>
          <FormField label="Email address" htmlFor="email" required error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" leftIcon={<Mail className="h-4 w-4" />} error={!!errors.email} {...register("email")} />
          </FormField>
          <FormField label="Password" htmlFor="password" required error={errors.password?.message}>
            <Input
              id="password"
              type={showPwd ? "text" : "password"}
              autoComplete="new-password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={!!errors.password}
              rightIcon={<button type="button" onClick={() => setShowPwd(v => !v)} aria-label={showPwd ? "Hide" : "Show"}>{showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>}
              {...register("password")}
            />
            {password && (
              <div className="mt-1.5 space-y-1">
                <Progress value={(strength.score / 4) * 100} className="h-1.5" indicatorClassName={strength.color} />
                <p className="text-xs text-[hsl(var(--text-secondary))]">Password strength: <span className="font-medium">{strength.label}</span></p>
              </div>
            )}
          </FormField>
          <FormField label="Confirm password" htmlFor="confirmPassword" required error={errors.confirmPassword?.message}>
            <Input id="confirmPassword" type="password" autoComplete="new-password" leftIcon={<Lock className="h-4 w-4" />} error={!!errors.confirmPassword} {...register("confirmPassword")} />
          </FormField>
          <div className="flex items-start gap-2">
            <Checkbox id="acceptTerms" {...register("acceptTerms")} className="mt-0.5" />
            <Label htmlFor="acceptTerms" className="text-sm font-normal cursor-pointer leading-relaxed">
              I agree to the{" "}
              <Link href="/terms" className="text-[hsl(var(--primary))] hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-[hsl(var(--primary))] hover:underline">Privacy Policy</Link>
            </Label>
          </div>
          {errors.acceptTerms && <p className="text-xs text-[hsl(var(--destructive))]" role="alert">⚠ {errors.acceptTerms.message}</p>}
          <Button type="submit" className="w-full" loading={isSubmitting} size="lg">Create free account</Button>
        </form>
        <p className="mt-6 text-center text-sm text-[hsl(var(--text-secondary))]">
          Already have an account?{" "}<Link href={ROUTES.SIGN_IN} className="font-medium text-[hsl(var(--primary))] hover:underline">Sign in</Link>
        </p>
      </CardContent>
    </Card>
  );
}
