import { Users, Target, CreditCard, Ticket, ShoppingBag, AlertTriangle, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const METRICS = [
  { title: "Active Users",            value: "2,847",  icon: Users,        trend: "+12% this week",   color: "text-blue-600" },
  { title: "Active Missions",         value: "8,421",  icon: Target,       trend: "+8% this week",    color: "text-violet-600" },
  { title: "Marketplace Transactions",value: "₹1.2L",  icon: CreditCard,   trend: "+23% this month",  color: "text-green-600" },
  { title: "Open Support Tickets",    value: "34",     icon: Ticket,       trend: "5 high priority",  color: "text-amber-600" },
  { title: "Flagged Listings",        value: "7",      icon: AlertTriangle,trend: "Needs review",     color: "text-red-600" },
  { title: "Subscriptions",           value: "1,204",  icon: Activity,     trend: "486 Plus · 718 Pro",color: "text-teal-600" },
];

const RECENT_ACTIVITY = [
  { type: "user",    desc: "New user registration: priya.sharma@example.com",   time: "2 min ago" },
  { type: "mission", desc: "Mission flagged for review: 'Start a Crypto Fund'", time: "15 min ago" },
  { type: "payment", desc: "Payment dispute opened: Order #ORD-2847",           time: "1 hour ago" },
  { type: "listing", desc: "New listing submitted: 'Advanced Python Masterclass'",time: "2 hours ago" },
  { type: "ticket",  desc: "Support ticket escalated: Billing issue #TKT-0439", time: "3 hours ago" },
];

const TYPE_BADGES: Record<string, "info" | "warning" | "destructive" | "success"> = {
  user: "info", mission: "warning", payment: "destructive", listing: "success", ticket: "warning"
};

export default function AdminDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Admin Dashboard</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))]">Platform overview and health indicators</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {METRICS.map(m => {
          const Icon = m.icon;
          return (
            <Card key={m.title}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-[hsl(var(--text-secondary))] mb-1">{m.title}</p>
                    <p className="text-2xl font-black text-[hsl(var(--text-primary))]">{m.value}</p>
                    <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">{m.trend}</p>
                  </div>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] ${m.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
          <CardContent className="p-0 divide-y divide-[hsl(var(--border))]">
            {RECENT_ACTIVITY.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3">
                <Badge variant={TYPE_BADGES[item.type] ?? "outline"} className="shrink-0 capitalize mt-0.5">{item.type}</Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[hsl(var(--text-primary))] truncate">{item.desc}</p>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">{item.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System health */}
        <Card>
          <CardHeader><CardTitle className="text-base">System Health</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { service: "API Server",      status: "operational", latency: "42ms" },
              { service: "AI Service",      status: "operational", latency: "320ms" },
              { service: "Database",        status: "operational", latency: "8ms" },
              { service: "WebSocket",       status: "operational", latency: "15ms" },
              { service: "Payment Gateway", status: "operational", latency: "180ms" },
              { service: "Email Service",   status: "degraded",    latency: "2400ms" },
            ].map(({ service, status, latency }) => (
              <div key={service} className="flex items-center justify-between text-sm">
                <span className="text-[hsl(var(--text-primary))]">{service}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[hsl(var(--text-secondary))]">{latency}</span>
                  <Badge variant={status === "operational" ? "success" : "warning"} className="capitalize">{status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
