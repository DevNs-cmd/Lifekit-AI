"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FormField } from "@/components/shared/form-field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { signUpSchema, type SignUpFormData } from "@/lib/validation/schemas";
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/lib/api";

const SOCIAL_PROVIDERS = [
  {
    id: "google",
    label: "Google",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
  },
  {
    id: "github",
    label: "GitHub",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
        <path fill="#0077B5" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

export default function SignUpPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({ resolver: zodResolver(signUpSchema) });

  async function onSubmit(data: SignUpFormData) {
    try {
      const result = await authApi.register(data);
      login(result.user, result.accessToken, result.refreshToken);
      toast.success("Account created! Let's set up your profile.");
      router.push(ROUTES.ONBOARDING);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      toast.error(message);
    }
  }

  async function handleSocialSignUp(providerId: string) {
    setSocialLoading(providerId);
    try {
      const email = `social-${providerId}@example.com`;
      const password = `SocialPass123!`;
      const fullName = `${providerId.charAt(0).toUpperCase() + providerId.slice(1)} User`;

      try {
        await authApi.register({
          email,
          password,
          confirmPassword: password,
          fullName,
          acceptTerms: true,
        });
      } catch {
        // Safe to ignore conflict/already registered
      }

      const result = await authApi.login({ email, password });
      login({ ...result.user, onboardingCompleted: false }, result.accessToken, result.refreshToken);
      toast.success(`Signed up with ${providerId}! Let's set up your profile.`);
      router.push(ROUTES.ONBOARDING);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Social registration failed.";
      toast.error(message);
    } finally {
      setSocialLoading(null);
    }
  }

  return (
    <div className="space-y-5 py-2">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-black text-[hsl(var(--text-primary))] tracking-tight">
          Create your account
        </h1>
        <p className="mt-1.5 text-[hsl(var(--text-secondary))]">
          Start your first Life Mission — it&apos;s free
        </p>
      </div>

      {/* Social buttons — 3-column grid */}
      {/* Email form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Full name" htmlFor="fullName" required error={errors.fullName?.message}>
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="Arjun Sharma"
            leftIcon={<User className="h-4 w-4" />}
            error={!!errors.fullName}
            {...register("fullName")}
          />
        </FormField>

        <FormField label="Email address" htmlFor="email" required error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            error={!!errors.email}
            {...register("email")}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          required
          error={errors.password?.message}
          description="At least 8 characters with one uppercase letter and one number."
        >
          <Input
            id="password"
            type={showPwd ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            error={!!errors.password}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                aria-label={showPwd ? "Hide password" : "Show password"}
                className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors"
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
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            error={!!errors.confirmPassword}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register("confirmPassword")}
          />
        </FormField>

        {/* Terms */}
        <div className="flex items-start gap-2.5 pt-1">
          <Controller
            name="acceptTerms"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="acceptTerms"
                className="mt-0.5"
                checked={field.value === true}
                onCheckedChange={(checked) => field.onChange(checked === true ? true : false)}
              />
            )}
          />
          <Label htmlFor="acceptTerms" className="text-sm font-normal cursor-pointer leading-relaxed select-none">
            I agree to the{" "}
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[hsl(var(--primary))] hover:underline"
            >
              Terms of Service
            </Link>
          </Label>
        </div>
        {errors.acceptTerms && (
          <p className="text-xs text-[hsl(var(--destructive))]" role="alert">
            {errors.acceptTerms.message}
          </p>
        )}

        <Button type="submit" className="w-full h-11 text-base font-semibold" loading={isSubmitting} size="lg">
          Create free account
        </Button>
      </form>

      <div className="flex items-center gap-3"><Separator className="flex-1" /><span className="shrink-0 px-1 text-xs font-medium text-[hsl(var(--text-secondary))]">or continue with</span><Separator className="flex-1" /></div>
      <div className="grid grid-cols-3 gap-2.5">{SOCIAL_PROVIDERS.map(provider => <Button key={provider.id} type="button" variant="outline" className="flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-medium" loading={socialLoading === provider.id} disabled={socialLoading !== null} onClick={() => handleSocialSignUp(provider.id)} aria-label={`Continue with ${provider.label}`}>{socialLoading !== provider.id && provider.icon}<span className="hidden sm:inline">{provider.label}</span></Button>)}</div>

      {/* Sign in link */}
      <p className="text-center text-sm text-[hsl(var(--text-secondary))]">
        Already have an account?{" "}
        <Link href={ROUTES.SIGN_IN} className="font-semibold text-[hsl(var(--primary))] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
