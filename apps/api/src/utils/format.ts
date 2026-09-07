import { createHash } from "node:crypto";

export function keyId(apiKey: string): string {
  return hashApiKey(apiKey).slice(0, 20);
}

export function hashApiKey(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex");
}

export function maskKey(apiKey: string): string {
  const prefix = apiKey.slice(0, Math.min(3, apiKey.length));
  const suffix = apiKey.slice(-4);
  return `${prefix}${"*".repeat(8)}${suffix}`;
}

export function number(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function string(value: unknown, fallback = "Unknown"): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}
