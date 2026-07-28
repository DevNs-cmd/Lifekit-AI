import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-xl border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-[hsl(var(--text-secondary))]",
  {
    variants: {
      variant: {
        default: "bg-[hsl(var(--background-subtle))] border-[hsl(var(--border))] text-[hsl(var(--text-primary))]",
        destructive: "border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/5 text-[hsl(var(--destructive))] [&>svg]:text-[hsl(var(--destructive))]",
        success: "border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5 text-[hsl(142_60%_30%)] dark:text-[hsl(142_60%_70%)] [&>svg]:text-[hsl(var(--success))]",
        warning: "border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5 text-[hsl(38_70%_25%)] dark:text-[hsl(38_90%_70%)] [&>svg]:text-[hsl(var(--warning))]",
        info: "border-[hsl(var(--info))]/30 bg-[hsl(var(--info))]/5 text-[hsl(221_60%_30%)] dark:text-[hsl(221_80%_70%)] [&>svg]:text-[hsl(var(--info))]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("mb-1 font-semibold leading-none tracking-tight", className)} {...props} />
  )
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
  )
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
