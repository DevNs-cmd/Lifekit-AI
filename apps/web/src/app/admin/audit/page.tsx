import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";

const AUDIT_LOGS = [
  { id: "log-1", actor: "arjun@example.com", action: "USER_LOGIN",           resource: "auth",         severity: "info",    ts: "2025-07-27T08:00:00Z" },
  { id: "log-2", actor: "admin@lifekit.ai",  action: "USER_SUSPENDED",       resource: "user/anita",   severity: "warning", ts: "2025-07-26T14:00:00Z" },
  { id: "log-3", actor: "priya@example.com", action: "MISSION_DELETED",      resource: "mission/m-99", severity: "info",    ts: "2025-07-26T10:00:00Z" },
  { id: "log-4", actor: "system",            action: "PAYMENT_FAILED",        resource: "order/ORD-12", severity: "error",   ts: "2025-07-25T16:30:00Z" },
  { id: "log-5", actor: "admin@lifekit.ai",  action: "LISTING_REMOVED",      resource: "listing/l-7",  severity: "warning", ts: "2025-07-25T09:00:00Z" },
  { id: "log-6", actor: "rahul@example.com", action: "SUBSCRIPTION_UPGRADED",resource: "billing",      severity: "info",    ts: "2025-07-24T11:00:00Z" },
  { id: "log-7", actor: "system",            action: "PASSWORD_RESET",        resource: "user/priya",   severity: "info",    ts: "2025-07-23T08:45:00Z" },
  { id: "log-8", actor: "system",            action: "DATA_EXPORTED",         resource: "user/arjun",   severity: "info",    ts: "2025-07-22T15:00:00Z" },
];

const SEVERITY_VARIANTS: Record<string, "info" | "warning" | "destructive" | "outline"> = {
  info: "info" as "outline", warning: "warning", error: "destructive",
};

export default function AdminAuditPage() {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Audit Logs</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))]">
          Full audit trail of all platform actions
        </p>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {["Time", "Actor", "Action", "Resource", "Severity"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {AUDIT_LOGS.map(log => (
                <tr key={log.id} className="hover:bg-[hsl(var(--background-subtle))] transition-colors">
                  <td className="px-4 py-3 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">
                    {formatRelativeTime(log.ts)}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-[hsl(var(--text-secondary))]">{log.actor}</td>
                  <td className="px-4 py-3 font-medium text-[hsl(var(--text-primary))] font-mono text-xs">{log.action}</td>
                  <td className="px-4 py-3 text-xs text-[hsl(var(--text-secondary))] font-mono">{log.resource}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={SEVERITY_VARIANTS[log.severity] ?? "outline"}
                      className="capitalize text-[10px]"
                    >
                      {log.severity}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
