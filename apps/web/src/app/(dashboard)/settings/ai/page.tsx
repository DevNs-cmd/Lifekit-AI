"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";

export default function AISettingsPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const prefs = user?.preferences;

  type Prefs = NonNullable<typeof prefs>;

  function save(patch: Partial<Prefs>) {
    if (!prefs) return;
    updateUser({ preferences: { ...prefs, ...patch } });
    toast.success("AI preference saved.");
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push(ROUTES.SETTINGS)} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
            <Bot className="h-6 w-6 text-[hsl(var(--primary))]" /> AI Preferences
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">Customise how LifeKit AI behaves for you.</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">AI Coach</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label>Response style</Label>
            <Select defaultValue={prefs?.aiResponseStyle ?? "balanced"} onValueChange={v => save({ aiResponseStyle: v as Prefs["aiResponseStyle"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise — short, direct answers</SelectItem>
                <SelectItem value="balanced">Balanced — clear and complete</SelectItem>
                <SelectItem value="detailed">Detailed — thorough explanations</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Recommendation frequency</Label>
            <Select defaultValue={prefs?.recommendationFrequency ?? "weekly"} onValueChange={v => save({ recommendationFrequency: v as Prefs["recommendationFrequency"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Planning depth</Label>
            <Select defaultValue={prefs?.planningDepth ?? "standard"} onValueChange={v => save({ planningDepth: v as Prefs["planningDepth"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic — high-level milestones only</SelectItem>
                <SelectItem value="standard">Standard — milestones and weekly tasks</SelectItem>
                <SelectItem value="deep">Deep — full breakdown with daily actions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Memory Control</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable AI memory</Label>
              <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">Allow LifeKit to remember your preferences and context across sessions.</p>
            </div>
            <Switch checked={prefs?.memoryEnabled ?? true} onCheckedChange={v => save({ memoryEnabled: v })} />
          </div>
          <p className="text-xs text-[hsl(var(--text-secondary))] bg-[hsl(var(--background-subtle))] rounded-lg p-3">
            When memory is enabled, your AI Coach retains context about your goals, preferences and progress to deliver more personalised recommendations. You can review and delete individual memories in the Memory section.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
