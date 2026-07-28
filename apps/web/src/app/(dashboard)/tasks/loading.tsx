import { TaskCardSkeleton } from "@/components/shared/loading-skeleton";

export default function TasksLoading() {
  return (
    <div className="p-4 sm:p-6 space-y-3 max-w-4xl mx-auto">
      <div className="h-8 w-32 rounded-lg bg-[hsl(var(--muted))] animate-shimmer" />
      <div className="h-10 w-full rounded-lg bg-[hsl(var(--muted))] animate-shimmer" />
      {Array.from({ length: 6 }).map((_, i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  );
}
