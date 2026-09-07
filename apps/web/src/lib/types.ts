export interface SavedKey {
  id: string;
  name: string;
  maskedKey: string;
  createdAt: string;
  alias?: string | null;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
}
export interface ApiError {
  success: false;
  message: string;
  errorCode: string;
}
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
export interface RequestsResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
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

export interface UsageData {
  summary: {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    inputTokens: number;
    outputTokens: number;
    lastUsed: string | null;
    modelCount: number;
  };
  daily: Array<{ date: string; requests: number; tokens: number; cost: number }>;
  byModel: Array<{ model: string; requests: number; tokens: number; cost: number }>;
  truncated: boolean;
}

export interface DashboardFilters {
  range: "today" | "yesterday" | "7d" | "30d" | "custom";
  startDate: string;
  endDate: string;
  model: string;
  status: string;
  minCost: string;
  maxCost: string;
}
