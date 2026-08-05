"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-hover))] shadow-sm hover:shadow-[var(--shadow-purple)] active:scale-[0.98]",
        secondary:
          "bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))]/80 border border-[hsl(var(--border))]",
        outline:
          "border border-[hsl(var(--border))] bg-transparent hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--primary))]",
        ghost:
          "hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--primary))]",
        destructive:
          "bg-[hsl(var(--destructive))] text-white hover:bg-[hsl(var(--destructive))]/90",
        link: "text-[hsl(var(--primary))] underline-offset-4 hover:underline p-0 h-auto",
        gradient:
          "lifekit-gradient text-white shadow-sm hover:opacity-90 active:scale-[0.98]",
      },
      size: {
        xs: "h-7 px-2.5 text-xs rounded-md",
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 py-2",
        lg: "h-11 px-6 text-base",
        xl: "h-13 px-8 text-base font-semibold",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    // When asChild is true, Slot requires a single child element.
    // We must wrap everything in a plain <button> so asChild works correctly
    // even when leftIcon / rightIcon are provided.
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
