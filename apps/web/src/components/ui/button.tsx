import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const variants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] dark:text-[#0b1b18]",
        secondary: "border bg-[var(--surface)] hover:bg-[var(--surface-muted)]",
        ghost: "hover:bg-[var(--surface-muted)]",
        danger: "bg-[var(--danger)] text-white hover:opacity-90",
      },
      size: { default: "h-10 px-4", sm: "h-8 px-3 text-xs", icon: "size-10 p-0" },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof variants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return <Component className={cn(variants({ variant, size }), className)} {...props} />;
}
