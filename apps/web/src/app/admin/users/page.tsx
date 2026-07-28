"use client";

import { useState } from "react";
import { Search, Filter, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const MOCK_USERS = [
  { id: "u1", name: "Arjun Sharma",    email: "arjun@example.com",  type: "professional", plan: "plus",  status: "active",    joined: "15 Jan 2024", missions: 3 },
  { id: "u2", name: "Priya Nair",      email: "priya@example.com",  type: "student",      plan: "free",  status: "active",    joined: "02 Mar 2024", missions: 1 },
  { id: "u3", name: "Rahul Gupta",     email: "rahul@example.com",  type: "founder",      plan: "pro",   status: "active",    joined: "18 Feb 2024", missions: 7 },
  { id: "u4", name: "Anita Desai",     email: "anita@example.com",  type: "family",       plan: "plus",  status: "suspended", joined: "05 Apr 2024", missions: 2 },
  { id: "u5", name: "Kiran Mehta",     email: "kiran@example.com",  type: "professional", plan: "free",  status: "active",    joined: "20 May 2024", missions: 0 },
];

const STATUS_VARIANTS: Record<string, "success" | "destructive" | "outline"> = { active: "success", suspended: "destructive" };

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_USERS.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Users</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">{MOCK_USERS.length} total users</p>
        </div>
        <Button size="sm" onClick={() => toast("Export coming soon!")}>Export CSV</Button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-secondary))] pointer-events-none" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" className="pl-9" />
        </div>
        <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>Filter</Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {["Name", "Type", "Plan", "Missions", "Status", "Joined", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-[hsl(var(--background-subtle))] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[hsl(var(--text-primary))]">{u.name}</p>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-[hsl(var(--text-secondary))]">{u.type}</td>
                  <td className="px-4 py-3"><Badge variant="secondary" className="capitalize">{u.plan}</Badge></td>
                  <td className="px-4 py-3 text-[hsl(var(--text-secondary))]">{u.missions}</td>
                  <td className="px-4 py-3"><Badge variant={STATUS_VARIANTS[u.status] ?? "outline"} className="capitalize">{u.status}</Badge></td>
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
    </div>
  );
}
