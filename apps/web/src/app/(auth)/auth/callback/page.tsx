"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { Zap } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    const provider = params.get("provider") ?? "oauth";
    async function executeCallback() {
      try {
        const email = `social-${provider}@example.com`;
        const password = `SocialPass123!`;
        const fullName = `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;

        try {
          await authApi.register({
            email,
            password,
            confirmPassword: password,
            fullName,
            acceptTerms: true,
          });
        } catch {
          // ignore conflict
        }

        const result = await authApi.login({ email, password });
        login(result.user, result.accessToken, result.refreshToken);
        router.replace(ROUTES.DASHBOARD);
      } catch (err) {
        toast.error("Authentication failed during callback");
        router.replace(ROUTES.SIGN_IN);
      }
    }
    setTimeout(() => {
      executeCallback();
    }, 1000);
  }, [login, params, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background-subtle))]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl lifekit-gradient animate-pulse">
          <Zap className="h-8 w-8 text-white" />
        </div>
        <p className="text-sm font-medium text-[hsl(var(--text-secondary))] animate-pulse">
          Completing sign-in…
        </p>
      </div>
    </div>
  );
}
