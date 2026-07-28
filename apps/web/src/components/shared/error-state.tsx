import * as React from "react";
import { AlertTriangle, RefreshCw, WifiOff, Lock, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorType = "generic" | "not-found" | "unauthorized" | "network" | "server";

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

const ERROR_CONFIGS: Record<ErrorType, { icon: React.ReactNode; title: string; description: string }> = {
  generic: {
    icon: <AlertTriangle className="h-8 w-8" />,
    title: "Something went wrong",
    description: "An unexpected error occurred. Please try again.",
  },
  "not-found": {
    icon: <ServerCrash className="h-8 w-8" />,
    title: "Not found",
    description: "The item you're looking for doesn't exist or has been removed.",
  },
  unauthorized: {
    icon: <Lock className="h-8 w-8" />,
    title: "Access denied",
    description: "You don't have permission to view this content.",
  },
  network: {
    icon: <WifiOff className="h-8 w-8" />,
    title: "Connection problem",
    description: "Check your internet connection and try again.",
  },
  server: {
    icon: <ServerCrash className="h-8 w-8" />,
    title: "Server error",
    description: "Our servers are experiencing an issue. Please try again shortly.",
  },
};

export function ErrorState({ type = "generic", title, description, onRetry, className, compact = false }: ErrorStateProps) {
  const config = ERROR_CONFIGS[type];
  return (
    <div className={cn("flex flex-col items-center justify-center text-center", compact ? "py-8 px-4" : "py-16 px-6", className)} role="alert">
      <div className={cn("flex items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 mb-4",
        compact ? "h-12 w-12" : "h-16 w-16")}>
        {config.icon}
      </div>
      <h3 className={cn("font-semibold text-[hsl(var(--text-primary))]", compact ? "text-base" : "text-lg")}>
        {title ?? config.title}
      </h3>
      <p className={cn("mt-2 text-[hsl(var(--text-secondary))] max-w-sm", compact ? "text-xs" : "text-sm")}>
        {description ?? config.description}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-6" size={compact ? "sm" : "default"} leftIcon={<RefreshCw className="h-4 w-4" />}>
          Try again
        </Button>
      )}
    </div>
  );
}
