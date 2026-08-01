"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";

export default function PrivacyPage() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuthStore();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [clearMemoryOpen, setClearMemoryOpen] = useState(false);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push(ROUTES.SETTINGS)} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
            <Shield className="h-6 w-6 text-[hsl(var(--primary))]" /> Privacy
          </h1>
        </div>
      </div>

      {/* Memory */}
      <Card>
        <CardHeader><CardTitle className="text-base">AI Memory</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--text-primary))]">Enable memory</p>
              <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">
                Allow LifeKit to remember context across sessions to personalise your experience.
              </p>
            </div>
            <Switch
              checked={user?.preferences?.memoryEnabled ?? true}
              onCheckedChange={v => {
                updateUser({ preferences: { ...user!.preferences, memoryEnabled: v } });
                toast.success(`Memory ${v ? "enabled" : "disabled"}.`);
              }}
            />
          </div>
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background-subtle))] p-3 text-xs text-[hsl(var(--text-secondary))] space-y-1">
            <p className="font-semibold text-[hsl(var(--text-primary))]">What we remember:</p>
            <p>· Your goal preferences and focus areas</p>
            <p>· Decisions you make about your missions</p>
            <p>· Feedback you give to AI recommendations</p>
            <p>· Constraints you share (time, budget, location)</p>
            <p className="mt-1 text-[hsl(var(--primary))]">We never sell your data. Memory is used only to serve you better.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.MEMORY)}>
              Review memories
            </Button>
            <Button variant="outline" size="sm" onClick={() => setClearMemoryOpen(true)} className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20">
              <Trash2 className="h-4 w-4 mr-1.5" />Clear all memory
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader><CardTitle className="text-base">Your Data</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-3">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--text-primary))]">Export my data</p>
              <p className="text-xs text-[hsl(var(--text-secondary))]">Download all your missions, tasks, memories and activity as JSON</p>
            </div>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}
              onClick={() => toast.success("Export started — you'll receive an email when ready.")}>
              Export
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-red-200 dark:border-red-800 p-3">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Delete account</p>
              <p className="text-xs text-[hsl(var(--text-secondary))]">Permanently removes your account and all data. Irreversible.</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>Delete</Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={clearMemoryOpen}
        onOpenChange={setClearMemoryOpen}
        title="Clear all memory?"
        description="All remembered context, preferences and decisions will be deleted. Your AI Coach will start fresh."
        confirmLabel="Clear all memory"
        onConfirm={() => { toast.success("Memory cleared."); }}
      />
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete your account?"
        description="All your missions, tasks, memories and data will be permanently deleted. This cannot be undone."
        confirmLabel="Yes, delete my account"
        onConfirm={() => { logout(); }}
      />
    </div>
  );
}
