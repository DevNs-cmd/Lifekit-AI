import { Zap } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))]" aria-busy="true" aria-label="Loading LifeKit">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl lifekit-gradient animate-pulse">
          <Zap className="h-7 w-7 text-white" />
        </div>
        <p className="text-sm font-medium text-[hsl(var(--text-secondary))] animate-pulse">Loading LifeKit…</p>
      </div>
    </div>
  );
}
