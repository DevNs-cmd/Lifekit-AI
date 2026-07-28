import { MissionCardSkeleton } from "@/components/shared/loading-skeleton";

export default function MissionsLoading() {
  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      <div className="h-8 w-40 rounded-lg bg-[hsl(var(--muted))] animate-shimmer" />
      <div className="h-10 w-full rounded-lg bg-[hsl(var(--muted))] animate-shimmer" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <MissionCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
