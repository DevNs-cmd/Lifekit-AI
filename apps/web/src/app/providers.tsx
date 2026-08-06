"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { I18nProvider } from "@/lib/i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 min
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
        <I18nProvider>
          {children}
        </I18nProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] shadow-lg rounded-xl",
              description: "text-[hsl(var(--text-secondary))]",
              actionButton: "bg-[hsl(var(--primary))] text-white",
              cancelButton: "bg-[hsl(var(--secondary))] text-[hsl(var(--text-primary))]",
              error: "!border-[hsl(var(--destructive))]/30 !bg-red-50 dark:!bg-red-900/20",
              success: "!border-[hsl(var(--success))]/30 !bg-green-50 dark:!bg-green-900/20",
            },
          }}
          richColors
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
