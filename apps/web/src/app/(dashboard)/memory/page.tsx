/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Brain, Plus, Pin, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { FormField } from "@/components/shared/form-field";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatRelativeTime, cn } from "@/lib/utils";
import { createMemorySchema, type CreateMemoryFormData } from "@/lib/validation/schemas";
import { toast } from "sonner";
import { useMissionStore } from "@/stores";
import { missionsApi, memoryApi } from "@/lib/api";
import { useEffect } from "react";
import type { Memory, MemoryCategory } from "@/types/memory";

const CATEGORY_COLORS: Record<string, string> = {
  goal:        "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  preference:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  decision:    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  feedback:    "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  achievement: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  constraint:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  context:     "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<MemoryCategory | "all">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<CreateMemoryFormData>({
    resolver: zodResolver(createMemorySchema),
    defaultValues: { category: "context", importance: "medium", tags: [] },
  });

  const { cachedMissions, setCachedMissions } = useMissionStore();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [memList, missionsData] = await Promise.all([
          memoryApi.getMemories(),
          missionsApi.getMissions(),
        ]);
        setMemories(memList);
        setCachedMissions(missionsData);
      } catch {
        toast.error("Failed to load memories.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [setCachedMissions]);

  const filtered = memories
    .filter(m => {
      const matchSearch = !search || m.content.toLowerCase().includes(search.toLowerCase()) || m.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = categoryFilter === "all" || m.category === categoryFilter;
      return matchSearch && matchCategory;
    })
    .map(data => ({
      ...data,
      relatedMissionTitle: cachedMissions.find(m => m.id === data.relatedMissionId)?.title,
    }));

  function togglePin(id: string) {
    setMemories(prev => prev.map(m => m.id === id ? { ...m, isPinned: !m.isPinned } : m));
    toast.success("Memory pin updated.");
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await memoryApi.deleteMemory(deleteTarget.id);
      setMemories(prev => prev.filter(m => m.id !== deleteTarget.id));
      toast.success("Memory deleted.");
    } catch {
      toast.error("Failed to delete memory.");
    }
    setDeleteTarget(null);
  }

  async function onAddMemory(data: CreateMemoryFormData) {
    try {
      const newMemory = await memoryApi.createMemory({
        content: data.content,
        category: data.category,
        importance: data.importance || "medium",
        relatedMissionId: data.relatedMissionId || undefined,
        tags: data.tags || [],
      });
      // Set related mission title for display
      if (newMemory.relatedMissionId) {
        newMemory.relatedMissionTitle = cachedMissions.find((m: any) => m.id === newMemory.relatedMissionId)?.title;
      }
      setMemories(prev => [newMemory, ...prev]);
      setAddOpen(false);
      reset();
      toast.success("Memory saved!");
    } catch (err) {
      console.error("Failed to save memory:", err);
      toast.error("Failed to save memory.");
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
            <Brain className="h-7 w-7 text-[hsl(var(--primary))]" /> Life Memory
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Information saved by you and your AI Coach to personalise your experience.
          </p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>
          Add Memory
        </Button>
      </div>

      {/* Search + category filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-secondary))] pointer-events-none" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search memories…" className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={v => setCategoryFilter(v as MemoryCategory | "all")}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {(["goal","preference","decision","feedback","achievement","constraint","context"] as MemoryCategory[]).map(c => (
              <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Memory cards */}
      {loading ? (
        <div className="p-6 text-center text-sm text-[hsl(var(--text-secondary))]">Loading memories...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Brain className="h-8 w-8" />}
          title="No memories found"
          description="Your AI Coach saves context about your goals and preferences here. Memories help personalise your experience."
          action={{ label: "Add a memory", onClick: () => setAddOpen(true), icon: <Plus className="h-4 w-4" /> }}
        />
      ) : (
        <div className="space-y-3">
          {filtered
            .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
            .map((memory) => (
              <Card key={memory.id} className={cn(memory.isPinned && "border-[hsl(var(--primary))]/30 bg-[hsl(var(--background-subtle))]")}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize", CATEGORY_COLORS[memory.category] ?? CATEGORY_COLORS.context)}>
                          {memory.category}
                        </span>
                        {memory.isPinned && (
                          <Badge variant="secondary" className="text-[10px] gap-1"><Pin className="h-2.5 w-2.5" />Pinned</Badge>
                        )}
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium",
                          memory.importance === "critical" ? "bg-red-100 text-red-600" :
                          memory.importance === "high" ? "bg-amber-100 text-amber-600" :
                          "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        )}>
                          {memory.importance}
                        </span>
                      </div>
                      <p className="text-sm text-[hsl(var(--text-primary))] leading-relaxed">{memory.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-[hsl(var(--text-secondary))]">
                        <span>Source: {memory.source}</span>
                        {memory.relatedMissionTitle && <span>Mission: {memory.relatedMissionTitle}</span>}
                        <span>{formatRelativeTime(memory.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon-sm" onClick={() => togglePin(memory.id)} aria-label={memory.isPinned ? "Unpin" : "Pin"}>
                        <Pin className={cn("h-3.5 w-3.5", memory.isPinned && "fill-current text-[hsl(var(--primary))]")} />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(memory)} aria-label="Delete memory">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      <ConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete this memory?"
        description="This memory will be permanently removed. Your AI Coach will no longer have access to this information."
        confirmLabel="Delete memory"
        onConfirm={handleDelete}
      />

      {/* ── Add Memory Dialog ── */}
      <Dialog open={addOpen} onOpenChange={v => { setAddOpen(v); if (!v) reset(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save a memory</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onAddMemory)} className="space-y-4" noValidate>
            <FormField label="What do you want to remember?" htmlFor="mem-content" required error={errors.content?.message}>
              <Textarea id="mem-content" rows={3} autoFocus
                placeholder="e.g. I prefer project-based learning over reading theory."
                {...register("content")} error={!!errors.content} />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Category" htmlFor="mem-category" required error={errors.category?.message}>
                <Select defaultValue="context" onValueChange={v => setValue("category", v as CreateMemoryFormData["category"], { shouldValidate: true })}>
                  <SelectTrigger id="mem-category" error={!!errors.category}><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {(["goal","preference","decision","feedback","achievement","constraint","context"] as MemoryCategory[]).map(c => (
                      <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Importance" htmlFor="mem-importance">
                <Select defaultValue="medium" onValueChange={v => setValue("importance", v as CreateMemoryFormData["importance"], { shouldValidate: true })}>
                  <SelectTrigger id="mem-importance"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <FormField label="Related mission (optional)" htmlFor="mem-mission">
              <Select onValueChange={v => setValue("relatedMissionId", v)}>
                <SelectTrigger id="mem-mission"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  {cachedMissions.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormField>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" loading={isSubmitting}>Save memory</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
