import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, onClick, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-[hsl(var(--border))]/80 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-[var(--shadow-sm)] transition-[transform,box-shadow,border-color] duration-200 hover:border-[hsl(var(--primary))]/20 hover:shadow-[0_12px_32px_rgb(25_55_35_/_0.08)] dark:bg-[hsl(var(--card))]/95 dark:backdrop-blur-sm dark:hover:shadow-[0_16px_40px_rgb(0_0_0_/_0.28)] animate-slide-up-fade",
        onClick && "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 motion-reduce:transform-none",
        className
      )}
      onClick={onClick}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5 p-5", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-semibold leading-tight tracking-tight text-[hsl(var(--text-primary))]", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-[hsl(var(--text-secondary))]", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-5 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
