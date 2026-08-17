"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { CreditCard } from "lucide-react";
import { get } from "@/lib/api/client";

type Subscription = {
  user: string;
  email: string;
  plan: string;
  since: string;
  status: string;
};

const STATUS_VARIANTS: Record<string, "success" | "warning" | "outline" | "destructive"> = {
  active: "success",
  past_due: "warning",
  cancelled: "destructive",
  trialing: "outline",
};

const PLAN_VARIANTS: Record<string, "purple" | "success" | "secondary" | "outline"> = {
  pro: "purple",
  plus: "success",
  free: "outline",
};

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get<any>("/admin/subscriptions")
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        setSubs(list);
      })
      .catch(() => setSubs([]))
      .finally(() => setLoading(false));
  }, []);

  const planCounts = subs.reduce((acc, s) => {
    acc[s.plan] = (acc[s.plan] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Subscriptions</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))]">Plan distribution and billing status</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Free", count: planCounts.free ?? 0, color: "text-gray-500" },
          { label: "Plus", count: planCounts.plus ?? 0, color: "text-green-600" },
          { label: "Pro", count: planCounts.pro ?? 0, color: "text-violet-600" },
          { label: "Enterprise", count: planCounts.enterprise ?? 0, color: "text-blue-600" },
        ].map(({ label, count, color }) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-black ${color}`}>{count}</p>
              <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">{label} plan</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />
          ))}
        </div>
      ) : subs.length === 0 ? (
        <EmptyState icon={<CreditCard className="h-7 w-7" />} title="No subscriptions yet" compact />
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  {["User", "Plan", "Status", "Since"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {subs.map((s, i) => (
                  <tr key={i} className="hover:bg-[hsl(var(--background-subtle))] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[hsl(var(--text-primary))]">{s.user}</p>
                      <p className="text-xs text-[hsl(var(--text-secondary))]">{s.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={PLAN_VARIANTS[s.plan] ?? "outline"} className="capitalize">{s.plan}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANTS[s.status] ?? "outline"} className="capitalize">
                        {s.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--text-secondary))]">{s.since}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
