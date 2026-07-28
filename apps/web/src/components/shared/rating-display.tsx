import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  className?: string;
}

export function RatingDisplay({ rating, reviewCount, size = "md", className }: RatingDisplayProps) {
  const stars = Math.round(rating * 2) / 2;
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center" aria-label={`Rating: ${rating} out of 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={cn(
              size === "sm" ? "h-3 w-3" : "h-4 w-4",
              n <= stars ? "fill-amber-400 text-amber-400" : "fill-none text-[hsl(var(--border))]"
            )}
          />
        ))}
      </div>
      <span className={cn("font-medium text-[hsl(var(--text-primary))]", size === "sm" ? "text-xs" : "text-sm")}>
        {rating.toFixed(1)}
      </span>
      {reviewCount !== undefined && (
        <span className={cn("text-[hsl(var(--text-secondary))]", size === "sm" ? "text-xs" : "text-sm")}>
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
