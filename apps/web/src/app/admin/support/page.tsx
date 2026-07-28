"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

const MOCK_TICKETS = [
  { id: "TKT-0001", user: "Arjun Sharma",  subject: "Mission plan not generating",  category: "bug",       priority: "high",   status: "open",        created: "27 Jul 2025" },
  { id: "TKT-0002", user: "Priya Nair",    subject: "Billing charged twice",         category: "billing",   priority: "high",   status: "open",        created: "26 Jul 2025" },
  { id: "TKT-0003", user: "Rahul Gupta",   subject: "Feature request: team missions",category: "feature",   priority: "medium", status: "in-progress", created: "25 Jul 2025" },
  { id: "TKT-0004", user: "Anita Desai",   subject: "Cannot connect LinkedIn",       category: "account",   priority: "low",    status: "resolved",    created: "24 Jul 2025" },
  { id: "TKT-0005", user: "Kiran Mehta",   subject: "Marketplace dispute — refund",  category: "marketplace",priority: "medium", status: "open",        created: "23 Jul 2025" },
];

const STATUS_VARIANTS: Record<string, "destructive" | "warning" | "success" | "outline"> = {
  open: "destructive", "in-progress": "warning", resolved: "success", closed: "outline",
};

const PRIORITY_VARIANTS: Record<string, "destructive" | "warning" | "outline"> = {
  high: "destructive", medium: "warning", low: "outline",
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState(MOCK_TICKETS);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Support Tickets</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            {tickets.filter(t => t.status === "open").length} open tickets
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {["ID", "User", "Subject", "Category", "Priority", "Status", "Created", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {tickets.map(t => (
                <tr key={t.id} className="hover:bg-[hsl(var(--background-subtle))] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--text-secondary))]">{t.id}</td>
                  <td className="px-4 py-3 font-medium text-[hsl(var(--text-primary))]">{t.user}</td>
                  <td className="px-4 py-3 text-[hsl(var(--text-secondary))] max-w-[200px] truncate">{t.subject}</td>
                  <td className="px-4 py-3 capitalize text-[hsl(var(--text-secondary))]">{t.category}</td>
                  <td className="px-4 py-3">
                    <Badge variant={PRIORITY_VARIANTS[t.priority] ?? "outline"} className="capitalize">{t.priority}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANTS[t.status] ?? "outline"} className="capitalize">{t.status.replace("-", " ")}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">{t.created}</td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast("View ticket coming soon!")}>View ticket</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setTickets(prev => prev.map(x => x.id === t.id ? { ...x, status: "in-progress" } : x));
                          toast("Ticket marked in-progress.");
                        }}>Mark in-progress</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setTickets(prev => prev.map(x => x.id === t.id ? { ...x, status: "resolved" } : x));
                          toast("Ticket resolved.");
                        }}>Resolve ticket</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
