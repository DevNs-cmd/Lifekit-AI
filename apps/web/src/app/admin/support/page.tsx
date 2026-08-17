"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { MoreHorizontal, Ticket } from "lucide-react";
import { get, patch } from "@/lib/api/client";
import { toast } from "sonner";

type SupportTicket = {
  id: string;
  user: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created: string;
};

const STATUS_VARIANTS: Record<string, "destructive" | "warning" | "success" | "outline"> = {
  open: "destructive",
  "in-progress": "warning",
  resolved: "success",
  closed: "outline",
};

const PRIORITY_VARIANTS: Record<string, "destructive" | "warning" | "outline"> = {
  high: "destructive",
  medium: "warning",
  low: "outline",
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get<any>("/admin/support-tickets")
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        setTickets(list);
      })
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: string) {
    try {
      await patch(`/admin/support-tickets/${id}`, { status });
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      toast(`Ticket marked ${status}.`);
    } catch {
      toast.error("Failed to update ticket.");
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Support Tickets</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            {tickets.filter((t) => t.status === "open").length} open tickets
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState icon={<Ticket className="h-7 w-7" />} title="No support tickets" compact />
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  {["ID", "User", "Subject", "Category", "Priority", "Status", "Created", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-[hsl(var(--background-subtle))] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--text-secondary))]">{t.id}</td>
                    <td className="px-4 py-3 font-medium text-[hsl(var(--text-primary))]">{t.user}</td>
                    <td className="px-4 py-3 text-[hsl(var(--text-secondary))] max-w-[200px] truncate">{t.subject}</td>
                    <td className="px-4 py-3 capitalize text-[hsl(var(--text-secondary))]">{t.category}</td>
                    <td className="px-4 py-3">
                      <Badge variant={PRIORITY_VARIANTS[t.priority] ?? "outline"} className="capitalize">{t.priority}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANTS[t.status] ?? "outline"} className="capitalize">
                        {t.status.replace("-", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">{t.created}</td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast("View ticket coming soon!")}>View ticket</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(t.id, "in-progress")}>Mark in-progress</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(t.id, "resolved")}>Resolve ticket</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
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
