"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth-store";
import { useTheme } from "next-themes";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import { usersApi } from "@/lib/api";

export default function GeneralSettingsPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const { setTheme, theme } = useTheme();
  const prefs = user?.preferences;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push(ROUTES.SETTINGS)} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">General Settings</h1>
      </div>

      {/* Locale */}
      <Card>
        <CardHeader><CardTitle className="text-base">Locale & Format</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="language">Language</Label>
            <Select
              defaultValue={prefs?.language ?? "en"}
              onValueChange={v => {
                if (prefs) {
                  updateUser({ preferences: { ...prefs, language: v } });
                  toast.success("Language updated.");
                }
              }}
            >
              <SelectTrigger id="language"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              defaultValue={prefs?.timezone ?? "Asia/Kolkata"}
              onValueChange={v => {
                if (prefs) {
                  updateUser({ preferences: { ...prefs, timezone: v } });
                  toast.success("Timezone updated.");
                }
              }}
            >
              <SelectTrigger id="timezone"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Kolkata">India Standard Time (IST)</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                <SelectItem value="Europe/London">London (GMT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dateFormat">Date Format</Label>
            <Select
              defaultValue={prefs?.dateFormat ?? "DD/MM/YYYY"}
              onValueChange={v => {
                if (prefs) {
                  updateUser({ preferences: { ...prefs, dateFormat: v } });
                  toast.success("Date format updated.");
                }
              }}
            >
              <SelectTrigger id="dateFormat"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Theme</Label>
            <div className="flex flex-wrap gap-2">
              {(["light", "dark", "system"] as const).map(t => (
                <button
                  key={t}
                  onClick={async () => {
                    setTheme(t);
                    if (prefs) {
                      try {
                        await usersApi.updatePreferences({ theme: t });
                        updateUser({
                          preferences: {
                            ...prefs,
                            theme: t,
                          },
                        });
                        toast.success("Theme preference saved.");
                      } catch {
                        // ignore
                      }
                    }
                  }}
                  className={`rounded-lg border-2 px-4 py-2 text-sm font-medium capitalize transition-colors ${theme === t ? "border-[hsl(var(--primary))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]" : "border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader><CardTitle className="text-base">Notification Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "in-app", label: "In-app notifications", desc: "Show notifications inside the app" },
            { key: "email", label: "Email notifications", desc: "Receive summaries and alerts by email" },
            { key: "push", label: "Push notifications", desc: "Browser push alerts for important updates" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">{label}</Label>
                <p className="text-xs text-[hsl(var(--text-secondary))]">{desc}</p>
              </div>
              <Switch
                defaultChecked={prefs?.notificationPreference !== "none"}
                onCheckedChange={async (checked) => {
                  if (prefs) {
                    try {
                      await usersApi.updatePreferences({ notificationsEnabled: checked });
                      updateUser({
                        preferences: {
                          ...prefs,
                          notificationPreference: checked ? "all" : "none",
                        },
                      });
                      toast.success("Notification preferences updated.");
                    } catch {
                      toast.error("Failed to update notification preferences.");
                    }
                  }
                }}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
