"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-white dark:bg-gray-950">
        <div className="max-w-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600">
            <span className="text-3xl" aria-hidden>⚠</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            An unexpected error occurred. Our team has been notified.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-800 transition-colors"
            >
              Try again
            </button>
            <Link
              href={ROUTES.DASHBOARD}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
