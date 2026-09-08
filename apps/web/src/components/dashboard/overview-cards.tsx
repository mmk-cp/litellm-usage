import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  Clock3,
  Coins,
  Cpu,
} from "lucide-react";
import type { UsageData } from "@/lib/types";
import { formatCompact, formatCost } from "@/lib/utils";
import { Card } from "../ui/card";

export function OverviewCards({ summary }: { summary: UsageData["summary"] }) {
  const cards = [
    { label: "کل درخواست‌ها", value: formatCompact(summary.totalRequests), icon: Activity },
    { label: "کل توکن‌ها", value: formatCompact(summary.totalTokens), icon: Cpu },
    { label: "کل هزینه", value: formatCost(summary.totalCost), icon: Coins },
    { label: "توکن‌های ورودی", value: formatCompact(summary.inputTokens), icon: ArrowDownToLine },
    { label: "توکن‌های خروجی", value: formatCompact(summary.outputTokens), icon: ArrowUpFromLine },
    { label: "مدل‌های استفاده‌شده", value: formatCompact(summary.modelCount), icon: Boxes },
    {
      label: "آخرین فعالیت",
      value: summary.lastUsed
        ? new Intl.DateTimeFormat("fa-IR", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(summary.lastUsed))
        : "بدون فعالیت",
      icon: Clock3,
    },
  ];
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((item, index) => (
        <Card
          key={item.label}
          className={`animate-enter p-4 ${index === 6 ? "sm:col-span-2 xl:col-span-2" : ""}`}
          style={{ animationDelay: `${index * 35}ms` }}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--muted)]">{item.label}</span>
            <span className="grid size-8 place-items-center rounded-md bg-[var(--surface-muted)] text-[var(--primary)]">
              <item.icon className="size-4" />
            </span>
          </div>
          <div className="text-2xl font-bold">{item.value}</div>
        </Card>
      ))}
    </div>
  );
}
