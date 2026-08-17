"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { get } from "@/lib/api/client";
import { toast } from "sonner";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  type: string;
  plan: string;
  status: string;
  joined: string;
  missions: number;
};

const STATUS_VARIANTS: Record<string, "success" | "destructive" | "outline"> = {
  active: "success",
  suspended: "destructive",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get<any>("/admin/users")
      .then((res) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        setUsers(list);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Users</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">{users.length} total users</p>
        </div>
        <Button size="sm" onClick={() => toast("Export coming soon!")}>Export CSV</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-secondary))] pointer-events-none" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" className="pl-9" />
        </div>
        <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>Filter</Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-7 w-7" />}
          title={search ? `No users matching "${search}"` : "No users yet"}
          compact
        />
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  {["Name", "Type", "Plan", "Missions", "Status", "Joined", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-[hsl(var(--background-subtle))] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[hsl(var(--text-primary))]">{u.name}</p>
                      <p className="text-xs text-[hsl(var(--text-secondary))]">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 capitalize text-[hsl(var(--text-secondary))]">{u.type}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="capitalize">{u.plan}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--text-secondary))]">{u.missions}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANTS[u.status] ?? "outline"} className="capitalize">{u.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--text-secondary))] text-xs">{u.joined}</td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast("View user coming soon!")}>View profile</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast("Impersonate coming soon!")}>Impersonate</DropdownMenuItem>
                          <DropdownMenuItem destructive onClick={() => toast("User suspended!")}>Suspend user</DropdownMenuItem>
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
