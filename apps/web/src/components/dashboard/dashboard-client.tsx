"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, KeyRound, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { api, apiPaginated, ApiClientError } from "@/lib/api";
import { useSavedKeys } from "@/lib/saved-keys";
import type { DashboardFilters, RequestRecord, UsageData } from "@/lib/types";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { DashboardFiltersBar, defaultFilters } from "./filters";
import { OverviewCards } from "./overview-cards";
import { RequestTable } from "./request-table";
import { UsageCharts } from "./usage-charts";

function queryString(filters: DashboardFilters) {
  const params = new URLSearchParams({ startDate: filters.startDate, endDate: filters.endDate });
  if (filters.model) params.set("model", filters.model);
  if (filters.status) params.set("status", filters.status);
  if (filters.minCost) params.set("minCost", filters.minCost);
  if (filters.maxCost) params.set("maxCost", filters.maxCost);
  return params;
}

export function DashboardClient({ keyId }: { keyId: string }) {
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"timestamp" | "model" | "tokens" | "cost" | "latency">(
    "timestamp",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const savedKeys = useSavedKeys();
  const savedKey = useMemo(() => savedKeys.find((key) => key.id === keyId), [keyId, savedKeys]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const usageQuery = useQuery({
    queryKey: ["usage", keyId, filters],
    queryFn: () =>
      api<UsageData>(`/keys/${keyId}/usage?${queryString(filters)}`).then((result) => result.data),
    placeholderData: (previous) => previous,
  });
  const modelsQuery = useQuery({
    queryKey: ["models", keyId],
    queryFn: () =>
      api<Array<{ model: string }>>(`/keys/${keyId}/models`).then((result) => result.data),
    staleTime: 5 * 60_000,
  });
  const requestParams = queryString(filters);
  requestParams.set("page", String(page));
  requestParams.set("limit", "25");
  requestParams.set("sortBy", sortBy);
  requestParams.set("sortOrder", sortOrder);
  if (search) requestParams.set("search", search);
  const requestsQuery = useQuery({
    queryKey: ["requests", keyId, filters, page, search, sortBy, sortOrder],
    queryFn: () => apiPaginated<RequestRecord>(`/keys/${keyId}/requests?${requestParams}`),
    placeholderData: (previous) => previous,
  });

  const error = usageQuery.error ?? requestsQuery.error;
  const expired = error instanceof ApiClientError && error.code === "KEY_SESSION_EXPIRED";
  const errorTitle =
    error instanceof ApiClientError
      ? ({
          RATE_LIMITED: "محدودیت تعداد درخواست",
          PERMISSION_DENIED: "دسترسی غیرمجاز",
          LITELLM_UNAVAILABLE: "سرویس LiteLLM در دسترس نیست",
          LITELLM_TIMEOUT: "پاسخ LiteLLM بیش از حد طول کشید",
        }[error.code] ?? "دریافت اطلاعات مصرف انجام نشد")
      : "دریافت اطلاعات مصرف انجام نشد";
  const changeFilters = (next: DashboardFilters) => {
    setFilters(next);
    setPage(1);
  };
  const retry = () => {
    void usageQuery.refetch();
    void requestsQuery.refetch();
    void modelsQuery.refetch();
  };
  const modelOptions =
    modelsQuery.data?.map((item) => item.model) ??
    usageQuery.data?.byModel.map((item) => item.model) ??
    [];

  return (
    <AppShell
      title={savedKey?.name ?? "داشبورد مصرف"}
      subtitle={savedKey?.maskedKey ?? "کلید مجازی LiteLLM"}
    >
      {usageQuery.isPending ? (
        <DashboardSkeleton />
      ) : error ? (
        <Card className="grid min-h-[58vh] place-items-center p-8 text-center">
          <div className="max-w-sm">
            <span className="mx-auto mb-4 grid size-12 place-items-center rounded-md bg-red-500/10 text-[var(--danger)]">
              {expired ? <KeyRound className="size-5" /> : <AlertTriangle className="size-5" />}
            </span>
            <h2 className="text-lg font-bold">
              {expired ? "نشست این کلید در دسترس نیست" : errorTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {error instanceof Error ? error.message : "خطایی پیش‌بینی‌نشده رخ داد."}
            </p>
            <div className="mt-5 flex justify-center gap-2">
              {expired ? (
                <Button asChild>
                  <Link href="/">اتصال دوباره کلید</Link>
                </Button>
              ) : (
                <Button onClick={retry}>
                  <RefreshCw className="size-4" />
                  تلاش دوباره
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : usageQuery.data && requestsQuery.data ? (
        <>
          <DashboardFiltersBar filters={filters} models={modelOptions} onChange={changeFilters} />
          {usageQuery.data.truncated && (
            <div className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/8 px-4 py-3 text-xs text-amber-800 dark:text-amber-300">
              نمای کلی بر اساس ۵۰٬۰۰۰ درخواست منطبق اخیر محاسبه شده است. جدول درخواست‌ها همچنان
              صفحه‌بندی کامل دارد.
            </div>
          )}
          <OverviewCards summary={usageQuery.data.summary} />
          <UsageCharts data={usageQuery.data} />
          <RequestTable
            rows={requestsQuery.data.data}
            pagination={requestsQuery.data.pagination}
            page={page}
            search={searchInput}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onPage={setPage}
            onSearch={setSearchInput}
            onSort={(field, order) => {
              setSortBy(field);
              setSortOrder(order);
              setPage(1);
            }}
          />
        </>
      ) : null}
    </AppShell>
  );
}
