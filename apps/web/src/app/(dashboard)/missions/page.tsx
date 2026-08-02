"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, Grid3X3, List, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { CategoryBadge } from "@/components/shared/category-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MOCK_MISSIONS } from "@/constants/mock-data";
import { ROUTES } from "@/constants/routes";
import { formatDeadline, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Mission, MissionStatus } from "@/types/mission";
import { MoreHorizontal, Pause, Play, Copy, Archive, Trash2 } from "lucide-react";

export default function MissionsPage() {
  const router = useRouter();
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<MissionStatus | "all">("all");
  const [sortBy, setSortBy] = React.useState("updated");
  const [deleteTarget, setDeleteTarget] = React.useState<Mission | null>(null);

  const filtered = MOCK_MISSIONS.filter(m => {
    const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.goal.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => {
    if (sortBy === "updated") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (sortBy === "progress") return b.progress - a.progress;
    if (sortBy === "deadline") return (a.targetDate ?? "").localeCompare(b.targetDate ?? "");
    return a.title.localeCompare(b.title);
  });

  function handleDelete() {
    toast.success(`Mission "${deleteTarget?.title}" deleted.`);
    setDeleteTarget(null);
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Missions</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">{MOCK_MISSIONS.filter(m => m.status === "active").length} active missions</p>
        </div>
        <Button onClick={() => router.push(ROUTES.MISSION_NEW)} leftIcon={<Plus className="h-4 w-4" />}>New Mission</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-secondary))] pointer-events-none" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search missions…" className="pl-9" aria-label="Search missions" />
        </div>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as MissionStatus | "all")}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="at-risk">At Risk</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Recently updated</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
            <SelectItem value="deadline">Deadline</SelectItem>
            <SelectItem value="name">Name A–Z</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center rounded-lg border border-[hsl(var(--border))] overflow-hidden">
          <button onClick={() => setView("grid")} className={cn("p-2 transition-colors", view === "grid" ? "bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]" : "text-[hsl(var(--text-secondary))]")} aria-label="Grid view"><Grid3X3 className="h-4 w-4" /></button>
          <button onClick={() => setView("list")} className={cn("p-2 transition-colors", view === "list" ? "bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]" : "text-[hsl(var(--text-secondary))]")} aria-label="List view"><List className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Grid view */}
      {filtered.length === 0 ? (
        <EmptyState icon={<Target className="h-8 w-8" />} title="No missions found" description="Try adjusting filters or create a new mission." action={{ label: "New Mission", onClick: () => router.push(ROUTES.MISSION_NEW) }} />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(mission => (
            <Card key={mission.id} className="hover:border-[hsl(var(--primary))]/30 hover:shadow-md transition-all group cursor-pointer" onClick={() => router.push(ROUTES.MISSION_DETAIL(mission.id))}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <CategoryBadge category={mission.category} size="sm" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100" aria-label="Mission actions"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => router.push(ROUTES.MISSION_DETAIL(mission.id))}>Open</DropdownMenuItem>
                      {mission.status === "active" ? (
                        <DropdownMenuItem onClick={() => toast.success("Mission paused.")}><Pause className="h-4 w-4 mr-2" />Pause</DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => toast.success("Mission resumed.")}><Play className="h-4 w-4 mr-2" />Resume</DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => toast.success("Mission duplicated.")}><Copy className="h-4 w-4 mr-2" />Duplicate</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success("Mission archived.")}><Archive className="h-4 w-4 mr-2" />Archive</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem destructive onClick={() => setDeleteTarget(mission)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="font-semibold text-[hsl(var(--text-primary))] mb-1 leading-tight">{mission.title}</h3>
                <p className="text-xs text-[hsl(var(--text-secondary))] mb-3 line-clamp-2">{mission.goal}</p>
                <div className="mb-3">
                  <div className="flex justify-between mb-1"><span className="text-xs text-[hsl(var(--text-secondary))]">Progress</span><span className="text-xs font-semibold">{mission.progress}%</span></div>
                  <Progress value={mission.progress} className="h-1.5" />
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={mission.status} />
                  {mission.targetDate && <span className="text-xs text-[hsl(var(--text-secondary))]">{formatDeadline(mission.targetDate)}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y divide-[hsl(var(--border))]">
            {filtered.map(mission => (
              <div key={mission.id} className="flex items-center gap-4 px-4 py-3 hover:bg-[hsl(var(--background-subtle))] cursor-pointer" onClick={() => router.push(ROUTES.MISSION_DETAIL(mission.id))}>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[hsl(var(--text-primary))] truncate">{mission.title}</p>
                  <p className="text-xs text-[hsl(var(--text-secondary))] truncate">{mission.goal}</p>
                </div>
                <CategoryBadge category={mission.category} size="sm" className="hidden sm:flex" />
                <div className="w-24 hidden md:block"><Progress value={mission.progress} className="h-1.5" /></div>
                <StatusBadge status={mission.status} />
                {mission.targetDate && <span className="text-xs text-[hsl(var(--text-secondary))] hidden sm:block">{formatDeadline(mission.targetDate)}</span>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <ConfirmationDialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)} title="Delete mission?" description={`This will permanently delete "${deleteTarget?.title}" and all its tasks, milestones and progress. This cannot be undone.`} confirmLabel="Delete mission" onConfirm={handleDelete} />
    </div>
  );
}
