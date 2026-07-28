"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField } from "@/components/shared/form-field";
import { useAuthStore } from "@/stores/auth-store";
import { MOCK_USER } from "@/constants/mock-data";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import { Smartphone } from "lucide-react";

export default function TwoFactorPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    // Mock: any 6-digit code works
    login(MOCK_USER);
    toast.success("Two-factor verification successful!");
    router.push(ROUTES.DASHBOARD);
    setLoading(false);
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
          <Smartphone className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl">Two-factor verification</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app to continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleVerify} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </div>
          )}
          <FormField label="Verification code" htmlFor="code" required>
            <Input
              id="code"
              value={code}
              onChange={e => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(v);
                setError("");
              }}
              placeholder="000000"
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              className="text-center text-2xl tracking-[0.5em] font-mono"
            />
          </FormField>
          <Button type="submit" className="w-full" loading={loading} size="lg" disabled={code.length !== 6}>
            Verify
          </Button>
        </form>
        <div className="mt-4 text-center space-y-2">
          <button className="text-sm text-[hsl(var(--primary))] hover:underline" onClick={() => toast("Recovery code flow coming soon!")}>
            Use a recovery code
          </button>
          <br />
          <Link href={ROUTES.SIGN_IN} className="text-sm text-[hsl(var(--text-secondary))] hover:underline">
            ← Back to sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
