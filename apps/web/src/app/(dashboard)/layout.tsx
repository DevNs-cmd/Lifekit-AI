"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/constants/routes";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Guard: redirect to sign-in if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(ROUTES.SIGN_IN);
    }
  }, [isAuthenticated, router]);

  // Don't render the shell until we know the user is authenticated
  // (avoids a flash of the dashboard before the redirect fires)
  if (!isAuthenticated) return null;

  return <ApplicationShell>{children}</ApplicationShell>;
}
