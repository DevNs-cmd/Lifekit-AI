"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";

const MOCK_INVOICES = [
  { id: "inv-1", number: "LK-2025-0043", amount: 499, currency: "INR", status: "paid" as const, date: "2025-07-01", description: "LifeKit Plus — Monthly" },
  { id: "inv-2", number: "LK-2025-0032", amount: 499, currency: "INR", status: "paid" as const, date: "2025-06-01", description: "LifeKit Plus — Monthly" },
  { id: "inv-3", number: "LK-2025-0021", amount: 499, currency: "INR", status: "paid" as const, date: "2025-05-01", description: "LifeKit Plus — Monthly" },
];

const STATUS_BADGE: Record<string, "success" | "destructive" | "warning"> = {
  paid: "success", open: "warning", void: "destructive",
};

export default function BillingPage() {
  const router = useRouter();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push(ROUTES.SETTINGS)} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Billing & Invoices</h1>
      </div>

      {/* Current billing */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4" />Payment Method</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-14 rounded bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-xs font-bold">VISA</div>
              <div>
                <p className="text-sm font-medium text-[hsl(var(--text-primary))]">•••• •••• •••• 4242</p>
                <p className="text-xs text-[hsl(var(--text-secondary))]">Expires 12/2027</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast("Payment method management coming soon!")}>Update</Button>
          </div>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => toast("Add payment method coming soon!")}>
            + Add payment method
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming billing */}
      <Card>
        <CardHeader><CardTitle className="text-base">Next Billing</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[hsl(var(--text-secondary))]">LifeKit Plus — Monthly</span>
            <span className="font-bold text-[hsl(var(--text-primary))]">₹499 on 1 Aug 2025</span>
          </div>
        </CardContent>
      </Card>

      {/* Invoice history */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" />Invoice History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-[hsl(var(--border))]">
            {MOCK_INVOICES.map(inv => (
              <div key={inv.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{inv.description}</p>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">{inv.number} · {inv.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">₹{inv.amount}</span>
                  <Badge variant={STATUS_BADGE[inv.status] ?? "outline"} className="capitalize">{inv.status}</Badge>
                  <Button variant="ghost" size="icon-sm" onClick={() => toast("Invoice download coming soon!")} aria-label="Download invoice">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
