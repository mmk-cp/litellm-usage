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
          <h3 className="text-sm font-bold">Request log</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {pagination.total.toLocaleString()} requests in this view
          </p>
        </div>
        <label className="relative block w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
          <Input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search request ID"
            className="h-9 pl-9"
          />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead className="bg-[var(--surface-muted)] text-xs text-[var(--muted)]">
            <tr>
              <th className="h-11 px-5">{header("Timestamp", "timestamp")}</th>
              <th className="px-4">{header("Model", "model")}</th>
              <th className="px-4">Request ID</th>
              <th className="px-4 text-right">{header("Tokens", "tokens")}</th>
              <th className="px-4 text-right">{header("Cost", "cost")}</th>
              <th className="px-4">Status</th>
              <th className="px-5 text-right">{header("Latency", "latency")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.requestId}-${row.timestamp}`}
                className="border-t transition-colors hover:bg-[color-mix(in_srgb,var(--surface-muted)_55%,transparent)]"
              >
                <td className="whitespace-nowrap px-5 py-3.5 text-xs">
                  {new Intl.DateTimeFormat("en", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }).format(new Date(row.timestamp))}
                </td>
                <td className="max-w-48 truncate px-4 font-medium">{row.model}</td>
                <td
                  className="max-w-56 truncate px-4 font-mono text-xs text-[var(--muted)]"
                  title={row.requestId}
                >
                  {row.requestId}
                </td>
                <td className="px-4 text-right tabular-nums">{formatCompact(row.tokens)}</td>
                <td className="px-4 text-right tabular-nums">{formatCost(row.cost)}</td>
                <td className="px-4">
                  <Badge variant={row.status === "success" ? "success" : "danger"}>
                    {row.status === "success" ? "Success" : "Failed"}
                  </Badge>
                </td>
                <td className="px-5 text-right tabular-nums text-[var(--muted)]">
                  {row.latencyMs >= 1000
                    ? `${(row.latencyMs / 1000).toFixed(2)}s`
                    : `${Math.round(row.latencyMs)}ms`}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={7} className="h-44 text-center">
                  <p className="text-sm font-semibold">No matching requests</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Adjust your filters or search term.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t px-4 py-3 sm:px-5">
        <p className="text-xs text-[var(--muted)]">
          Page {pagination.pages ? page : 0} of {pagination.pages}
        </p>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={page >= pagination.pages}
            onClick={() => onPage(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
