import type { ApiError, ApiResponse, RequestsResponse } from "./types";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
const API_URL = configuredApiUrl.startsWith("/") ? configuredApiUrl : "/api";

export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = (await response.json().catch(() => null)) as ApiResponse<T> | ApiError | null;
  if (!response.ok || !body || !body.success) {
    const error = body && !body.success ? body : null;
    throw new ApiClientError(
      error?.errorCode ?? "NETWORK_ERROR",
      error?.message ?? "Unable to reach the server.",
      response.status,
    );
  }
  return body;
}

export async function apiPaginated<T>(path: string): Promise<RequestsResponse<T>> {
  const response = await fetch(`${API_URL}${path}`, { credentials: "same-origin" });
  const body = (await response.json().catch(() => null)) as RequestsResponse<T> | ApiError | null;
  if (!response.ok || !body || !body.success) {
    const error = body && !body.success ? body : null;
    throw new ApiClientError(
      error?.errorCode ?? "NETWORK_ERROR",
      error?.message ?? "Unable to reach the server.",
      response.status,
    );
  }
  return body;
}
