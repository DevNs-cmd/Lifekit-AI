/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Search, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { missionsApi } from "@/lib/api";

const STATUS_VARIANTS: Record<string, "success" | "warning" | "outline" | "destructive" | "info"> = {
  active: "success", paused: "warning", draft: "outline", completed: "info", "at-risk": "destructive",
};

export default function AdminMissionsPage() {
  const [search, setSearch] = useState("");
  const [missionsList, setMissionsList] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await missionsApi.getMissions();
        setMissionsList(data);
      } catch {
        toast.error("Failed to load monitored missions.");
      }
    }
    load();
  }, []);

  const missions = missionsList.filter(m =>
    !search || m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Mission Monitoring</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">{missionsList.length} total missions</p>
        </div>
        <Button size="sm" onClick={() => toast("Export coming soon!")}>Export</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-secondary))] pointer-events-none" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search missions…" className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {["Mission", "User", "Category", "Progress", "Status", "Created", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {missions.map(m => (
                <tr key={m.id} className="hover:bg-[hsl(var(--background-subtle))] transition-colors">
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-medium text-[hsl(var(--text-primary))] truncate">{m.title}</p>
                    <p className="text-xs text-[hsl(var(--text-secondary))] truncate">{m.goal}</p>
                  </td>
                  <td className="px-4 py-3 text-[hsl(var(--text-secondary))]">user-1</td>
                  <td className="px-4 py-3 capitalize text-[hsl(var(--text-secondary))]">{m.category}</td>
                  <td className="px-4 py-3 min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <Progress value={m.progress} className="flex-1 h-1.5" />
                      <span className="text-xs text-[hsl(var(--text-secondary))] shrink-0">{m.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANTS[m.status] ?? "outline"} className="capitalize">{m.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">{formatDate(m.createdAt)}</td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast("View mission details coming soon!")}>View details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast("Mission flagged for review.")}>Flag for review</DropdownMenuItem>
                        <DropdownMenuItem destructive onClick={() => toast("Mission archived.")}>Archive mission</DropdownMenuItem>
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
