"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ReceiptText } from "lucide-react";
import { get } from "@/lib/api/client";

type Transaction = {
  id: string;
  user: string;
  listing: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
};

const STATUS_VARIANTS: Record<string, "success" | "warning" | "destructive" | "outline"> = {
  completed: "success",
  refunded: "warning",
  failed: "destructive",
  pending: "outline",
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get<any>("/admin/transactions")
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        setTransactions(list);
      })
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  const total = transactions
    .filter((t) => t.status === "completed")
    .reduce((s, t) => s + (t.amount ?? 0), 0);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Transactions</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            ₹{total.toLocaleString("en-IN")} total completed revenue
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState icon={<ReceiptText className="h-7 w-7" />} title="No transactions yet" compact />
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  {["ID", "User", "Listing", "Amount", "Status", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-[hsl(var(--background-subtle))] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--text-secondary))]">{t.id}</td>
                    <td className="px-4 py-3 font-medium text-[hsl(var(--text-primary))]">{t.user}</td>
                    <td className="px-4 py-3 text-[hsl(var(--text-secondary))] truncate max-w-[180px]">{t.listing}</td>
                    <td className="px-4 py-3 font-semibold text-[hsl(var(--text-primary))] whitespace-nowrap">
                      ₹{(t.amount ?? 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANTS[t.status] ?? "outline"} className="capitalize">{t.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">{t.date}</td>
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
