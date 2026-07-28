import { MetricCardSkeleton, Skeleton } from "@/components/shared/loading-skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <Skeleton className="h-8 w-36" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] p-5 space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-52 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
