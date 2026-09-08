"use client";

import { CalendarDays, RotateCcw, SlidersHorizontal } from "lucide-react";
import { subDays, format } from "date-fns";
import type { DashboardFilters } from "@/lib/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const ranges = [
  { value: "today", label: "امروز" },
  { value: "yesterday", label: "دیروز" },
  { value: "7d", label: "۷ روز اخیر" },
  { value: "30d", label: "۳۰ روز اخیر" },
] as const;

export function datesForRange(range: DashboardFilters["range"]) {
  const today = new Date();
  if (range === "today")
    return { startDate: format(today, "yyyy-MM-dd"), endDate: format(today, "yyyy-MM-dd") };
  if (range === "yesterday") {
    const day = subDays(today, 1);
    return { startDate: format(day, "yyyy-MM-dd"), endDate: format(day, "yyyy-MM-dd") };
  }
  return {
    startDate: format(subDays(today, range === "7d" ? 6 : 29), "yyyy-MM-dd"),
    endDate: format(today, "yyyy-MM-dd"),
  };
}

export const defaultFilters: DashboardFilters = {
  range: "7d",
  ...datesForRange("7d"),
  model: "",
  status: "",
  minCost: "",
  maxCost: "",
};

export function DashboardFiltersBar({
  filters,
  models,
  onChange,
}: {
  filters: DashboardFilters;
  models: string[];
  onChange: (filters: DashboardFilters) => void;
}) {
  const updateRange = (range: DashboardFilters["range"]) =>
    onChange({ ...filters, range, ...(range === "custom" ? {} : datesForRange(range)) });
  const hasAdvanced = Boolean(
    filters.model ||
    filters.status ||
    filters.minCost ||
    filters.maxCost ||
    filters.range === "custom",
  );
  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
        <div className="flex overflow-x-auto rounded-md border bg-[var(--surface)] p-1">
          {ranges.map((item) => (
            <button
              key={item.value}
              onClick={() => updateRange(item.value)}
              className={`h-8 shrink-0 rounded px-3 text-xs font-semibold transition-colors ${filters.range === item.value ? "bg-[var(--foreground)] text-[var(--surface)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => updateRange("custom")}
            className={`flex h-8 shrink-0 items-center gap-1.5 rounded px-3 text-xs font-semibold ${filters.range === "custom" ? "bg-[var(--foreground)] text-[var(--surface)]" : "text-[var(--muted)]"}`}
          >
            <CalendarDays className="size-3.5" />
            بازه دلخواه
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="فیلتر بر اساس مدل"
            className="h-10 max-w-48 rounded-md border bg-[var(--surface)] px-3 text-sm"
            value={filters.model}
            onChange={(event) => onChange({ ...filters, model: event.target.value })}
          >
            <option value="">همه مدل‌ها</option>
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          <select
            aria-label="فیلتر بر اساس وضعیت"
            className="h-10 rounded-md border bg-[var(--surface)] px-3 text-sm"
            value={filters.status}
            onChange={(event) => onChange({ ...filters, status: event.target.value })}
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="success">موفق</option>
            <option value="failed">ناموفق</option>
          </select>
          {hasAdvanced && (
            <Button
              variant="ghost"
              size="icon"
              title="پاک کردن فیلترها"
              aria-label="پاک کردن فیلترها"
              onClick={() => onChange(defaultFilters)}
            >
              <RotateCcw className="size-4" />
            </Button>
          )}
        </div>
      </div>
      {(filters.range === "custom" || filters.minCost || filters.maxCost) && (
        <div className="flex flex-wrap items-end gap-3 rounded-md border bg-[var(--surface)] p-3">
          <SlidersHorizontal className="mb-2.5 size-4 text-[var(--muted)]" />
          {filters.range === "custom" && (
            <>
              <label className="text-xs font-semibold text-[var(--muted)]">
                از تاریخ
                <Input
                  type="date"
                  dir="ltr"
                  className="mt-1 h-9 w-40"
                  value={filters.startDate}
                  onChange={(event) => onChange({ ...filters, startDate: event.target.value })}
                />
              </label>
              <label className="text-xs font-semibold text-[var(--muted)]">
                تا تاریخ
                <Input
                  type="date"
                  dir="ltr"
                  className="mt-1 h-9 w-40"
                  value={filters.endDate}
                  onChange={(event) => onChange({ ...filters, endDate: event.target.value })}
                />
              </label>
            </>
          )}
          <label className="text-xs font-semibold text-[var(--muted)]">
            حداقل هزینه
            <Input
              type="number"
              min="0"
              step="0.0001"
              placeholder="$0"
              dir="ltr"
              className="mt-1 h-9 w-28"
              value={filters.minCost}
              onChange={(event) => onChange({ ...filters, minCost: event.target.value })}
            />
          </label>
          <label className="text-xs font-semibold text-[var(--muted)]">
            حداکثر هزینه
            <Input
              type="number"
              min="0"
              step="0.0001"
              placeholder="بدون محدودیت"
              dir="ltr"
              className="mt-1 h-9 w-28"
              value={filters.maxCost}
              onChange={(event) => onChange({ ...filters, maxCost: event.target.value })}
            />
          </label>
        </div>
      )}
      {!filters.minCost && !filters.maxCost && (
        <button
          className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--primary)]"
          onClick={() => onChange({ ...filters, minCost: "0" })}
        >
          + بازه هزینه
        </button>
      )}
    </div>
  );
}
