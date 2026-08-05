import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-[hsl(var(--background))]">
      <div className="max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
          <span className="text-4xl font-black">404</span>
        </div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Page not found</h1>
        <p className="mt-3 text-[hsl(var(--text-secondary))]">
          This page doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild leftIcon={<Home className="h-4 w-4" />}>
            <Link href={ROUTES.DASHBOARD}>Go to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild leftIcon={<ArrowLeft className="h-4 w-4" />}>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
