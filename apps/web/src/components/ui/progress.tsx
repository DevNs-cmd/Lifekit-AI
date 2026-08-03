"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    indicatorClassName?: string;
  }
>(({ className, value, indicatorClassName, ...props }, ref) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setDisplayValue(value ?? 0));
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 bg-[hsl(var(--primary))] transition-transform duration-300 ease-out rounded-full motion-reduce:transition-none",
        indicatorClassName
      )}
      style={{ transform: `translateX(-${100 - displayValue}%)` }}
    />
  </ProgressPrimitive.Root>;
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
