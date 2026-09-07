"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { SavedKey } from "./types";

const STORAGE_KEY = "litellm-usage.saved-keys.v1";

function parseSavedKeys(raw: string | null): SavedKey[] {
  try {
    const value: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is SavedKey =>
      Boolean(
        item &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.maskedKey === "string",
      ),
    );
  } catch {
    return [];
  }
}

export function getSavedKeys(): SavedKey[] {
  return typeof window === "undefined" ? [] : parseSavedKeys(localStorage.getItem(STORAGE_KEY));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("saved-keys-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("saved-keys-change", callback);
  };
}

export function useSavedKeys(): SavedKey[] {
  const raw = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(STORAGE_KEY),
    () => null,
  );
  return useMemo(() => parseSavedKeys(raw), [raw]);
}

export function saveKey(key: SavedKey): SavedKey[] {
  const keys = [key, ...getSavedKeys().filter((item) => item.id !== key.id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  window.dispatchEvent(new Event("saved-keys-change"));
  return keys;
}

export function removeSavedKey(id: string): SavedKey[] {
  const keys = getSavedKeys().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  window.dispatchEvent(new Event("saved-keys-change"));
  return keys;
}

export function clearSavedKeys(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("saved-keys-change"));
}
