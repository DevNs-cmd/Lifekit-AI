"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [state, setState] = useState<"loading" | "success" | "expired">("loading");

  useEffect(() => {
    if (!token) { setState("expired"); return; }
    // Simulate token verification
    const t = setTimeout(() => setState("success"), 1200);
    return () => clearTimeout(t);
  }, [token]);

  return (
    <Card className="w-full max-w-md shadow-lg text-center">
      <CardHeader>
        <CardTitle className="text-2xl">Email verification</CardTitle>
        <CardDescription>Verifying your email address</CardDescription>
      </CardHeader>
      <CardContent className="py-8">
        {state === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-[hsl(var(--primary))] animate-spin" />
            <p className="text-sm text-[hsl(var(--text-secondary))]">Verifying your email…</p>
          </div>
        )}
        {state === "success" && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[hsl(var(--text-primary))]">Email verified!</h3>
              <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Your account is ready. Let's get started.</p>
            </div>
            <Button className="mt-2" onClick={() => router.push(ROUTES.ONBOARDING)}>Start your journey</Button>
          </div>
        )}
        {state === "expired" && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[hsl(var(--text-primary))]">Link expired or invalid</h3>
              <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Verification links expire after 15 minutes.</p>
            </div>
            <Button variant="outline" asChild><Link href={ROUTES.SIGN_IN}>Request a new link</Link></Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
