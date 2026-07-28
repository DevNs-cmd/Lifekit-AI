import { Skeleton } from "@/components/shared/loading-skeleton";

export default function MemoryLoading() {
  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-4xl mx-auto">
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-10 w-full rounded-lg" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-[hsl(var(--border))] p-4 space-y-2">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}
