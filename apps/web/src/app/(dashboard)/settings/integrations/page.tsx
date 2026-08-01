"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Plug, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";

const INTEGRATIONS = [
  {
    category: "Productivity",
    items: [
      { id: "notion", name: "Notion", desc: "Sync missions and tasks to Notion pages", logo: "N", connected: false },
      { id: "google-cal", name: "Google Calendar", desc: "Sync task deadlines to your calendar", logo: "G", connected: false },
    ],
  },
  {
    category: "Career",
    items: [
      { id: "linkedin", name: "LinkedIn", desc: "Import profile data and track job applications", logo: "in", connected: false },
      { id: "github", name: "GitHub", desc: "Track project progress and portfolio", logo: "GH", connected: false },
    ],
  },
  {
    category: "Finance",
    items: [
      { id: "razorpay", name: "Razorpay", desc: "Payments for marketplace purchases", logo: "R", connected: true },
      { id: "stripe", name: "Stripe", desc: "International card payments", logo: "S", connected: true },
    ],
  },
];

export default function IntegrationsPage() {
  const router = useRouter();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push(ROUTES.SETTINGS)} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
            <Plug className="h-6 w-6 text-[hsl(var(--primary))]" /> Integrations
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            Connect LifeKit with your favourite tools and services.
          </p>
        </div>
      </div>

      {INTEGRATIONS.map(section => (
        <div key={section.category} className="space-y-2">
          <p className="text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider px-1">
            {section.category}
          </p>
          <Card>
            <CardContent className="p-0 divide-y divide-[hsl(var(--border))]">
              {section.items.map(item => (
                <div key={item.id} className="flex items-center gap-4 px-4 py-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] font-bold text-sm">
                    {item.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{item.name}</p>
                      {item.connected && (
                        <Badge variant="success" className="text-[10px]">Connected</Badge>
                      )}
                    </div>
                    <p className="text-xs text-[hsl(var(--text-secondary))] truncate">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.connected ? (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => toast(`${item.name} disconnected.`)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        size="xs"
                        onClick={() => toast(`${item.name} integration coming soon!`)}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ))}

      <Card className="border-[hsl(var(--border))] bg-[hsl(var(--background-subtle))]">
        <CardContent className="p-4 flex items-start gap-3">
          <Plug className="h-4 w-4 text-[hsl(var(--primary))] mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-[hsl(var(--text-primary))]">API Access</p>
            <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">
              LifeKit Pro and Enterprise plans include API access to build custom integrations.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
              onClick={() => toast("API documentation coming soon!")}
            >
              View API docs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
