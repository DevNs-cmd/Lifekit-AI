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
import { useI18n } from "@/lib/i18n";

export default function GeneralSettingsPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const { setTheme, theme } = useTheme();
  const { t } = useI18n();
  const prefs = user?.preferences;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push(ROUTES.SETTINGS)} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">{t("generalSettings")}</h1>
      </div>

      {/* Locale */}
      <Card>
        <CardHeader><CardTitle className="text-base">{t("localeFormat")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="language">{t("language")}</Label>
            <Select
              defaultValue={prefs?.language ?? "en"}
              onValueChange={async v => {
                if (prefs) {
                  try {
                    await usersApi.updatePreferences({ goals: undefined });
                  } catch {
                    // persist locally even if API is down
                  }
                  updateUser({ preferences: { ...prefs, language: v } });
                  toast.success(t("languageUpdated"));
                }
              }}
            >
              <SelectTrigger id="language"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader><CardTitle className="text-base">{t("appearance")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("theme")}</Label>
            <div className="flex flex-wrap gap-2">
              {(["light", "dark", "system"] as const).map(themeOption => (
                <button
                  key={themeOption}
                  onClick={async () => {
                    setTheme(themeOption);
                    if (prefs) {
                      try {
                        await usersApi.updatePreferences({ theme: themeOption });
                      } catch {
                        // ignore
                      }
                      updateUser({ preferences: { ...prefs, theme: themeOption } });
                      toast.success(t("themePreferenceSaved"));
                    }
                  }}
                  className={`rounded-lg border-2 px-4 py-2 text-sm font-medium capitalize transition-colors ${
                    theme === themeOption
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"
                      : "border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]"
                  }`}
                >
                  {t(themeOption as "light" | "dark" | "system")}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader><CardTitle className="text-base">{t("notificationPreferences")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "in-app", label: t("inAppNotifications"), desc: t("inAppDesc") },
            { key: "email",  label: t("emailNotifications"), desc: t("emailDesc") },
            { key: "push",   label: t("pushNotifications"),  desc: t("pushDesc") },
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
                      updateUser({ preferences: { ...prefs, notificationPreference: checked ? "all" : "none" } });
                      toast.success(t("notificationPrefsUpdated"));
                    } catch {
                      toast.error(t("failedUpdateNotifPrefs"));
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
