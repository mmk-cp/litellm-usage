import { MAX_ANALYTICS_ROWS } from "../configs/constants.js";
import {
  liteLLMClient,
  type LiteLLMSpendLog,
  type SpendLogParams,
} from "../clients/litellm.client.js";
import type { RequestRecord, UsageFilters } from "../types/api.js";
import { hashApiKey, number, string } from "../utils/format.js";

const sortMap = {
  timestamp: "startTime",
  model: "model",
  tokens: "total_tokens",
  cost: "spend",
  latency: "request_duration_ms",
} as const;

function toLiteParams(apiKey: string, filters: UsageFilters): SpendLogParams {
  return {
    api_key: hashApiKey(apiKey),
    start_date: filters.startDate,
    end_date: filters.endDate,
    model: filters.model,
    status_filter: filters.status === "failed" ? "failure" : filters.status,
    min_spend: filters.minCost,
    max_spend: filters.maxCost,
  };
}

function normalize(log: LiteLLMSpendLog): RequestRecord {
  const started = log.startTime ? new Date(log.startTime).getTime() : 0;
  const ended = log.endTime ? new Date(log.endTime).getTime() : started;
  const statusValue = String(log.status ?? "").toLowerCase();
  return {
    timestamp: log.startTime ?? new Date(0).toISOString(),
    model: string(log.model),
    requestId: string(log.request_id, "-"),
    tokens: number(log.total_tokens),
    inputTokens: number(log.prompt_tokens),
    outputTokens: number(log.completion_tokens),
    cost: number(log.spend),
    status:
      log.error_code || statusValue.includes("fail") || statusValue.includes("error")
        ? "failed"
        : "success",
    latencyMs: number(log.request_duration_ms) || Math.max(0, ended - started),
  };
}

export class UsageService {
  async requests(
    apiKey: string,
    query: UsageFilters & {
      page: number;
      limit: number;
      search?: string;
      sortBy: keyof typeof sortMap;
      sortOrder: "asc" | "desc";
    },
  ) {
    const response = await liteLLMClient.getSpendLogs({
      ...toLiteParams(apiKey, query),
      page: query.page,
      page_size: query.limit,
      request_id: query.search,
      sort_by: sortMap[query.sortBy],
      sort_order: query.sortOrder,
    });
    const rows = Array.isArray(response.data) ? response.data : [];
    const total = number(response.total);
    return {
      data: rows.map(normalize),
      pagination: {
        page: number(response.page) || query.page,
        limit: number(response.page_size) || query.limit,
        total,
        pages: number(response.total_pages) || Math.ceil(total / query.limit),
      },
    };
  }

  private async allLogs(apiKey: string, filters: UsageFilters) {
    const base = toLiteParams(apiKey, filters);
    const first = await liteLLMClient.getSpendLogs({ ...base, page: 1, page_size: 1000 });
    const rows = [...(first.data ?? [])];
    const pages = Math.min(number(first.total_pages) || 1, Math.ceil(MAX_ANALYTICS_ROWS / 1000));
    for (let page = 2; page <= pages; page += 1) {
      const result = await liteLLMClient.getSpendLogs({ ...base, page, page_size: 1000 });
      rows.push(...(result.data ?? []));
    }
    return {
      logs: rows.slice(0, MAX_ANALYTICS_ROWS).map(normalize),
      truncated: number(first.total) > MAX_ANALYTICS_ROWS,
    };
  }

  async usage(apiKey: string, filters: UsageFilters) {
    const { logs, truncated } = await this.allLogs(apiKey, filters);
    const dailyMap = new Map<
      string,
      { date: string; requests: number; tokens: number; cost: number }
    >();
    const modelMap = new Map<
      string,
      { model: string; requests: number; tokens: number; cost: number }
    >();

    for (const log of logs) {
      const date = log.timestamp.slice(0, 10);
      const daily = dailyMap.get(date) ?? { date, requests: 0, tokens: 0, cost: 0 };
      daily.requests += 1;
      daily.tokens += log.tokens;
      daily.cost += log.cost;
      dailyMap.set(date, daily);

      const model = modelMap.get(log.model) ?? {
        model: log.model,
        requests: 0,
        tokens: 0,
        cost: 0,
      };
      model.requests += 1;
      model.tokens += log.tokens;
      model.cost += log.cost;
      modelMap.set(log.model, model);
    }

    return {
      summary: {
        totalRequests: logs.length,
        totalTokens: logs.reduce((sum, log) => sum + log.tokens, 0),
        totalCost: logs.reduce((sum, log) => sum + log.cost, 0),
        inputTokens: logs.reduce((sum, log) => sum + log.inputTokens, 0),
        outputTokens: logs.reduce((sum, log) => sum + log.outputTokens, 0),
        lastUsed: logs[0]?.timestamp ?? null,
        modelCount: new Set(logs.map((log) => log.model)).size,
      },
      daily: [...dailyMap.values()].sort((a, b) => a.date.localeCompare(b.date)),
      byModel: [...modelMap.values()].sort((a, b) => b.cost - a.cost),
      truncated,
    };
  }

  async models(apiKey: string) {
    const available = await liteLLMClient.getAvailableModels(apiKey);
    return (available.data ?? [])
      .map((item) => item.id)
      .filter((id): id is string => Boolean(id))
      .filter((model, index, models) => models.indexOf(model) === index)
      .sort()
      .map((model) => ({ model }));
  }

  async costs(apiKey: string, filters: UsageFilters) {
    const usage = await this.usage(apiKey, filters);
    return {
      daily: usage.daily.map(({ date, cost }) => ({ date, cost })),
      byModel: usage.byModel.map(({ model, cost }) => ({ model, cost })),
      total: usage.summary.totalCost,
      truncated: usage.truncated,
    };
  }
}

export const usageService = new UsageService();
