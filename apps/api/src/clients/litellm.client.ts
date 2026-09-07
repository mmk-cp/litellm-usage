import { env } from "../configs/env.js";
import { AppError } from "../utils/app-error.js";

export interface LiteLLMSpendLog {
  request_id?: string;
  model?: string | null;
  spend?: number | null;
  total_tokens?: number | null;
  prompt_tokens?: number | null;
  completion_tokens?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  status?: string | null;
  error_code?: string | null;
  request_duration_ms?: number | null;
  [key: string]: unknown;
}

export interface SpendLogsPage {
  data: LiteLLMSpendLog[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SpendLogParams {
  api_key: string;
  page?: number;
  page_size?: number;
  start_date?: string;
  end_date?: string;
  model?: string;
  status_filter?: string;
  min_spend?: number;
  max_spend?: number;
  request_id?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

type QueryValue = string | number | boolean | undefined;

export class LiteLLMClient {
  private async request<T>(
    path: string,
    query: Record<string, QueryValue> = {},
    authorization = env.LITELLM_ADMIN_KEY,
  ): Promise<T> {
    const url = new URL(path, `${env.LITELLM_BASE_URL}/`);
    Object.entries(query).forEach(([name, value]) => {
      if (value !== undefined && value !== "") url.searchParams.set(name, String(value));
    });

    let response: Response;
    try {
      response = await fetch(url, {
        headers: { Authorization: `Bearer ${authorization}`, Accept: "application/json" },
        signal: AbortSignal.timeout(env.LITELLM_TIMEOUT_MS),
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "TimeoutError" || error.name === "AbortError")
      ) {
        throw new AppError(504, "LITELLM_TIMEOUT", "LiteLLM took too long to respond.");
      }
      throw new AppError(503, "LITELLM_UNAVAILABLE", "LiteLLM is currently unavailable.");
    }

    if (!response.ok) {
      if (response.status === 401)
        throw new AppError(401, "INVALID_API_KEY", "The API key is invalid.");
      if (response.status === 403)
        throw new AppError(403, "PERMISSION_DENIED", "This key cannot access the requested data.");
      if (response.status === 429)
        throw new AppError(429, "RATE_LIMITED", "LiteLLM rate limit reached. Try again shortly.");
      if (response.status >= 500)
        throw new AppError(503, "LITELLM_UNAVAILABLE", "LiteLLM is currently unavailable.");
      throw new AppError(502, "LITELLM_ERROR", `LiteLLM returned HTTP ${response.status}.`);
    }

    return (await response.json()) as T;
  }

  getKeyInfo(userApiKey: string): Promise<Record<string, unknown>> {
    return this.request("key/info", { key: userApiKey });
  }

  getSpendLogs(params: SpendLogParams): Promise<SpendLogsPage> {
    return this.request("spend/logs/v2", { ...params });
  }

  getKeySpendReport(userApiKey: string, startDate?: string, endDate?: string) {
    return this.request<Record<string, unknown>[]>("key/spend/report", {
      api_key: userApiKey,
      start_date: startDate,
      end_date: endDate,
    });
  }

  getAvailableModels(userApiKey: string): Promise<{ data?: Array<{ id?: string }> }> {
    return this.request("models", {}, userApiKey);
  }
}

export const liteLLMClient = new LiteLLMClient();
