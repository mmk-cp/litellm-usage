"use client";

import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { Pagination, RequestRecord } from "@/lib/types";
import { formatCompact, formatCost } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";

type SortBy = "timestamp" | "model" | "tokens" | "cost" | "latency";

export function RequestTable({
  rows,
  pagination,
  page,
  search,
  sortBy,
  sortOrder,
  onPage,
  onSearch,
  onSort,
}: {
  rows: RequestRecord[];
  pagination: Pagination;
  page: number;
  search: string;
  sortBy: SortBy;
  sortOrder: "asc" | "desc";
  onPage: (page: number) => void;
  onSearch: (search: string) => void;
  onSort: (sortBy: SortBy, order: "asc" | "desc") => void;
}) {
  const header = (label: string, field: SortBy) => (
    <button
      className="inline-flex items-center gap-1 font-semibold hover:text-[var(--foreground)]"
      onClick={() => onSort(field, sortBy === field && sortOrder === "desc" ? "asc" : "desc")}
    >
      {label}
      {sortBy === field &&
        (sortOrder === "desc" ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />)}
    </button>
  );
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col justify-between gap-3 border-b p-4 sm:flex-row sm:items-center sm:p-5">
        <div>
          <h3 className="text-sm font-bold">گزارش درخواست‌ها</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {pagination.total.toLocaleString("fa-IR")} درخواست در این نما
          </p>
        </div>
        <label className="relative block w-full sm:w-64">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
          <Input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="جست‌وجوی شناسه درخواست"
            className="h-9 pr-9"
          />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-right text-sm">
          <thead className="bg-[var(--surface-muted)] text-xs text-[var(--muted)]">
            <tr>
              <th className="h-11 px-5">{header("زمان", "timestamp")}</th>
              <th className="px-4">{header("مدل", "model")}</th>
              <th className="px-4">شناسه درخواست</th>
              <th className="px-4">{header("توکن‌ها", "tokens")}</th>
              <th className="px-4">{header("هزینه", "cost")}</th>
              <th className="px-4">وضعیت</th>
              <th className="px-5">{header("زمان پاسخ", "latency")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.requestId}-${row.timestamp}`}
                className="border-t transition-colors hover:bg-[color-mix(in_srgb,var(--surface-muted)_55%,transparent)]"
              >
                <td className="whitespace-nowrap px-5 py-3.5 text-xs">
                  {new Intl.DateTimeFormat("fa-IR", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }).format(new Date(row.timestamp))}
                </td>
                <td dir="ltr" className="max-w-48 truncate px-4 text-left font-medium">
                  {row.model}
                </td>
                <td
                  dir="ltr"
                  className="max-w-56 truncate px-4 text-left font-mono text-xs text-[var(--muted)]"
                  title={row.requestId}
                >
                  {row.requestId}
                </td>
                <td className="px-4 tabular-nums">{formatCompact(row.tokens)}</td>
                <td className="px-4 tabular-nums">{formatCost(row.cost)}</td>
                <td className="px-4">
                  <Badge variant={row.status === "success" ? "success" : "danger"}>
                    {row.status === "success" ? "موفق" : "ناموفق"}
                  </Badge>
                </td>
                <td className="px-5 tabular-nums text-[var(--muted)]">
                  {row.latencyMs >= 1000
                    ? `${(row.latencyMs / 1000).toLocaleString("fa-IR", { maximumFractionDigits: 2 })} ثانیه`
                    : `${Math.round(row.latencyMs).toLocaleString("fa-IR")} میلی‌ثانیه`}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={7} className="h-44 text-center">
                  <p className="text-sm font-semibold">درخواستی مطابق فیلترها پیدا نشد</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    فیلترها یا عبارت جست‌وجو را تغییر دهید.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t px-4 py-3 sm:px-5">
        <p className="text-xs text-[var(--muted)]">
          صفحه {(pagination.pages ? page : 0).toLocaleString("fa-IR")} از{" "}
          {pagination.pages.toLocaleString("fa-IR")}
        </p>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
            aria-label="صفحه قبلی"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={page >= pagination.pages}
            onClick={() => onPage(page + 1)}
            aria-label="صفحه بعدی"
          >
            <ChevronLeft className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
