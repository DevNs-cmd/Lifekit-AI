"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { MOCK_USER } from "@/constants/mock-data";
import { ROUTES } from "@/constants/routes";
import { Zap } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    // In production this would exchange the OAuth code for a session
    const provider = params.get("provider") ?? "oauth";
    setTimeout(() => {
      login(MOCK_USER);
      router.replace(MOCK_USER.onboardingCompleted ? ROUTES.DASHBOARD : ROUTES.ONBOARDING);
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
