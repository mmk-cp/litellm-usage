export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface RequestRecord {
  timestamp: string;
  model: string;
  requestId: string;
  tokens: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  status: "success" | "failed";
  latencyMs: number;
}

export interface UsageFilters {
  startDate?: string;
  endDate?: string;
  model?: string;
  status?: "success" | "failed";
  minCost?: number;
  maxCost?: number;
  search?: string;
}
