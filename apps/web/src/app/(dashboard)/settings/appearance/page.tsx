"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const THEMES = [
  { id: "light", label: "Light", icon: Sun, preview: "bg-white border-gray-200" },
  { id: "dark",  label: "Dark",  icon: Moon, preview: "bg-gray-900 border-gray-700" },
  { id: "system",label: "System",icon: Monitor, preview: "bg-gradient-to-r from-white to-gray-900 border-gray-400" },
] as const;

const ACCENT_COLORS = [
  { id: "purple", label: "Purple (default)", class: "bg-purple-700" },
  { id: "blue",   label: "Ocean Blue",       class: "bg-blue-600" },
  { id: "teal",   label: "Teal",             class: "bg-teal-600" },
  { id: "rose",   label: "Rose",             class: "bg-rose-600" },
];

export default function AppearancePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push(ROUTES.SETTINGS)} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Appearance</h1>
      </div>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Theme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map(({ id, label, icon: Icon, preview }) => (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                  theme === id
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--secondary))]"
                    : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50"
                )}
              >
                {/* Preview swatch */}
                <div className={cn("h-10 w-16 rounded-md border", preview)} />
                <div className="flex items-center gap-1.5">
                  <Icon className={cn(
                    "h-3.5 w-3.5",
                    theme === id ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--text-secondary))]"
                  )} />
                  <span className={cn(
                    "text-xs font-medium",
                    theme === id ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--text-secondary))]"
                  )}>
                    {label}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-[hsl(var(--text-secondary))]">
            System automatically matches your OS preference.
          </p>
        </CardContent>
      </Card>

      {/* Accent colour */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accent Colour</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-3">
            {ACCENT_COLORS.map(({ id, label, class: cls }) => (
              <button
                key={id}
                onClick={() => toast(`${label} theme coming soon!`)}
                className="flex flex-col items-center gap-1.5 group"
                aria-label={label}
              >
                <div className={cn(
                  "h-10 w-10 rounded-full border-2 border-transparent group-hover:border-[hsl(var(--foreground))]/30 transition-all",
                  cls,
                  id === "purple" && "ring-2 ring-offset-2 ring-[hsl(var(--primary))]"
                )} />
                <span className="text-[10px] text-[hsl(var(--text-secondary))]">{label.split(" ")[0]}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-[hsl(var(--text-secondary))]">
            Custom accent colours available on LifeKit Pro and above.
          </p>
        </CardContent>
      </Card>

      {/* Font size */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Display</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Font size</Label>
            <div className="flex gap-2">
              {["Small", "Medium", "Large"].map((size, i) => (
                <button
                  key={size}
                  onClick={() => toast("Font size adjustment coming soon!")}
                  className={cn(
                    "flex-1 rounded-lg border-2 py-2 text-center transition-all",
                    i === 1
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] text-sm font-medium"
                      : "border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--primary))]/50",
                    i === 0 ? "text-xs" : i === 2 ? "text-base" : "text-sm"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Reduce motion</Label>
              <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">
                Minimise animations and transitions
              </p>
            </div>
            <button
              onClick={() => toast("This follows your OS reduce-motion setting automatically.")}
              className="text-xs text-[hsl(var(--primary))] hover:underline"
            >
              Auto (OS)
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
