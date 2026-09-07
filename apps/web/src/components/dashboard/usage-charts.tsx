"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import type { UsageData } from "@/lib/types";
import { formatCompact, formatCost } from "@/lib/utils";
import { Card } from "../ui/card";

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  fontSize: 12,
  boxShadow: "var(--shadow)",
};

export function UsageCharts({ data }: { data: UsageData }) {
  const [metric, setMetric] = useState<"tokens" | "requests" | "cost">("tokens");
  if (!data.daily.length)
    return (
      <Card className="mb-6 grid min-h-72 place-items-center p-8 text-center">
        <div>
          <div className="mx-auto mb-3 grid size-10 place-items-center rounded-md bg-[var(--surface-muted)] text-[var(--muted)]">
            0
          </div>
          <h3 className="text-sm font-bold">No usage in this period</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Try a wider date range or clear filters.
          </p>
        </div>
      </Card>
    );
  return (
    <div className="mb-6 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
      <Card className="min-w-0 p-4 sm:p-5">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h3 className="text-sm font-bold">Daily trend</h3>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Usage, request volume, and cost over time
            </p>
          </div>
          <div className="flex w-fit rounded-md bg-[var(--surface-muted)] p-1">
            {(["tokens", "requests", "cost"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setMetric(item)}
                className={`h-7 rounded px-2.5 text-xs font-semibold capitalize ${metric === item ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm" : "text-[var(--muted)]"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.daily} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted)", fontSize: 11 }}
                tickFormatter={(value: string) => value.slice(5)}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted)", fontSize: 11 }}
                tickFormatter={(value) =>
                  metric === "cost" ? formatCost(Number(value)) : formatCompact(Number(value))
                }
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) =>
                  metric === "cost" ? formatCost(Number(value)) : Number(value).toLocaleString()
                }
              />
              <Line
                type="monotone"
                dataKey={metric}
                stroke={
                  metric === "tokens"
                    ? "var(--chart-1)"
                    : metric === "requests"
                      ? "var(--chart-2)"
                      : "var(--chart-4)"
                }
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="min-w-0 p-4 sm:p-5">
        <div className="mb-5">
          <h3 className="text-sm font-bold">Cost by model</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">Highest spend models in selection</p>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.byModel.slice(0, 7)}
              layout="vertical"
              margin={{ left: 0, right: 10 }}
            >
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted)", fontSize: 11 }}
                tickFormatter={(value) => formatCost(Number(value))}
              />
              <YAxis
                dataKey="model"
                type="category"
                width={96}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted)", fontSize: 11 }}
                tickFormatter={(value: string) =>
                  value.length > 14 ? `${value.slice(0, 13)}...` : value
                }
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => formatCost(Number(value))}
              />
              <Bar dataKey="cost" fill="var(--chart-3)" radius={[0, 3, 3, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
