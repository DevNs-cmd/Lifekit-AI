import { Skeleton } from "@/components/shared/loading-skeleton";

export default function OpportunitiesLoading() {
  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-5xl mx-auto">
      <Skeleton className="h-8 w-48" />
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-[hsl(var(--border))] p-4 space-y-3">
          <div className="flex gap-4">
            <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          </div>
          <div className="flex gap-2 pt-2 border-t border-[hsl(var(--border))]">
            <Skeleton className="h-7 w-16 rounded-md" />
            <Skeleton className="h-7 w-24 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
