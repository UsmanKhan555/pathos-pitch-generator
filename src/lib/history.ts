import type { HistoryEntry } from "@/lib/types";

const HISTORY_KEY = "pitch-history";
const MAX_ENTRIES = 20;

const EMPTY_HISTORY: HistoryEntry[] = [];
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function readRaw(): string | null {
  try {
    return localStorage.getItem(HISTORY_KEY);
  } catch {
    return null;
  }
}

// useSyncExternalStore requires getSnapshot to return a stable reference
// when the underlying data hasn't changed, or React re-renders forever.
// Cache the last parsed result and only re-parse when the raw string differs.
let cachedRaw: string | null = null;
let cachedSnapshot: HistoryEntry[] = EMPTY_HISTORY;

export function getHistorySnapshot(): HistoryEntry[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      cachedSnapshot = Array.isArray(parsed) ? (parsed as HistoryEntry[]) : EMPTY_HISTORY;
    } catch {
      cachedSnapshot = EMPTY_HISTORY;
    }
  }
  return cachedSnapshot;
}

// Server has no localStorage - always render the same empty list there.
export function getHistoryServerSnapshot(): HistoryEntry[] {
  return EMPTY_HISTORY;
}

export function subscribeToHistory(callback: () => void): () => void {
  listeners.add(callback);
  // Cross-tab writes fire the native "storage" event (never in the tab that
  // wrote it, which is why saveHistoryEntry/clearHistory also call notify()
  // directly for same-tab updates).
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

export function saveHistoryEntry(
  entry: HistoryEntry,
  current: HistoryEntry[],
): void {
  const next = [entry, ...current].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Storage full or unavailable (e.g. private browsing) - the write is
    // best-effort; nothing else to do here.
  }
  notify();
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // Nothing to do if storage is unavailable.
  }
  notify();
}
