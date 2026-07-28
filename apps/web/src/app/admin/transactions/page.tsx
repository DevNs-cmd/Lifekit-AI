import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_TRANSACTIONS = [
  { id: "TXN-0001", user: "Rahul Gupta",   listing: "Full-Stack Bootcamp",     amount: 25000, currency: "INR", status: "completed", date: "27 Jul 2025" },
  { id: "TXN-0002", user: "Arjun Sharma",  listing: "Career Coaching Session",amount: 2000,  currency: "INR", status: "completed", date: "25 Jul 2025" },
  { id: "TXN-0003", user: "Priya Nair",    listing: "Python for Beginners",    amount: 499,   currency: "INR", status: "completed", date: "24 Jul 2025" },
  { id: "TXN-0004", user: "Kiran Mehta",   listing: "Business Plan Template",  amount: 999,   currency: "INR", status: "refunded",  date: "22 Jul 2025" },
  { id: "TXN-0005", user: "Anita Desai",   listing: "Travel Planning Package", amount: 5000,  currency: "INR", status: "failed",    date: "20 Jul 2025" },
];

const STATUS_VARIANTS: Record<string, "success" | "warning" | "destructive" | "outline"> = {
  completed: "success", refunded: "warning", failed: "destructive", pending: "outline",
};

export default function AdminTransactionsPage() {
  const total = MOCK_TRANSACTIONS.filter(t => t.status === "completed").reduce((s, t) => s + t.amount, 0);

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

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {["ID", "User", "Listing", "Amount", "Status", "Date"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {MOCK_TRANSACTIONS.map(t => (
                <tr key={t.id} className="hover:bg-[hsl(var(--background-subtle))] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--text-secondary))]">{t.id}</td>
                  <td className="px-4 py-3 font-medium text-[hsl(var(--text-primary))]">{t.user}</td>
                  <td className="px-4 py-3 text-[hsl(var(--text-secondary))] truncate max-w-[180px]">{t.listing}</td>
                  <td className="px-4 py-3 font-semibold text-[hsl(var(--text-primary))] whitespace-nowrap">
                    ₹{t.amount.toLocaleString("en-IN")}
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
    </div>
  );
}
