import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "neutral" | "success" | "danger" }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2 text-xs font-semibold",
        variant === "neutral" && "bg-[var(--surface-muted)] text-[var(--muted)]",
        variant === "success" && "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
        variant === "danger" && "bg-red-500/12 text-red-700 dark:text-red-400",
        className,
      )}
      {...props}
    />
  );
}
