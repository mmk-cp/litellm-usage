import { Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-[var(--primary)] text-white dark:text-[#0b1b18]">
        <Coffee className="size-5" />
      </span>
      {!compact && (
        <span className="text-[15px] font-bold">
          Coffee <span className="text-[var(--primary)]">VPS</span>
        </span>
      )}
    </div>
  );
}
