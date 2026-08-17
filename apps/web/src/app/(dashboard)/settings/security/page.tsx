"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, Lock, MonitorSmartphone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/shared/form-field";
import { changePasswordSchema, type ChangePasswordFormData } from "@/lib/validation/schemas";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import { usersApi } from "@/lib/api";
import { get, del } from "@/lib/api/client";



export default function SecurityPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<{ id: string; device: string; location: string; lastActive: string; isCurrent: boolean }[]>([]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get<any>("/auth/sessions")
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        setSessions(list);
      })
      .catch(() => setSessions([]));
  }, []);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  async function onSubmit(data: ChangePasswordFormData) {
    try {
      await usersApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password updated successfully.");
      reset();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update password.";
      toast.error(message);
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push(ROUTES.SETTINGS)} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
            <Shield className="h-6 w-6 text-[hsl(var(--primary))]" /> Security
          </h1>
        </div>
      </div>

      {/* Change password */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" />Change Password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField label="Current password" htmlFor="currentPassword" required error={errors.currentPassword?.message}>
              <Input id="currentPassword" type="password" autoComplete="current-password" {...register("currentPassword")} error={!!errors.currentPassword} />
            </FormField>
            <FormField label="New password" htmlFor="newPassword" required error={errors.newPassword?.message}>
              <Input id="newPassword" type="password" autoComplete="new-password" {...register("newPassword")} error={!!errors.newPassword} />
            </FormField>
            <FormField label="Confirm new password" htmlFor="confirmNewPassword" required error={errors.confirmNewPassword?.message}>
              <Input id="confirmNewPassword" type="password" autoComplete="new-password" {...register("confirmNewPassword")} error={!!errors.confirmNewPassword} />
            </FormField>
            <Button type="submit" loading={isSubmitting}>Update password</Button>
          </form>
        </CardContent>
      </Card>

      {/* Active sessions */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><MonitorSmartphone className="h-4 w-4" />Active Sessions</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {sessions.map(session => (
            <div key={session.id} className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{session.device}</p>
                  {session.isCurrent && <Badge variant="success" className="text-[10px]">Current</Badge>}
                </div>
                <p className="text-xs text-[hsl(var(--text-secondary))]">{session.location} · {session.lastActive}</p>
              </div>
              {!session.isCurrent && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={async () => {
                    try {
                      await del(`/auth/sessions/${session.id}`);
                      setSessions((p) => p.filter((s) => s.id !== session.id));
                      toast("Session revoked.");
                    } catch {
                      toast.error("Failed to revoke session.");
                    }
                  }}
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              try {
                await del("/auth/sessions");
                setSessions((p) => p.filter((s) => s.isCurrent));
                toast("All other sessions revoked.");
              } catch {
                toast.error("Failed to revoke sessions.");
              }
            }}
          >
            Revoke all other sessions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
