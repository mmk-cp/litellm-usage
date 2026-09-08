import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("fa-IR", { notation: "compact", maximumFractionDigits: 1 }).format(
    value,
  );
}

export function formatCost(value: number): string {
  const digits = value > 0 && value < 0.01 ? 4 : 2;
  return `${new Intl.NumberFormat("fa-IR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)} دلار`;
}
