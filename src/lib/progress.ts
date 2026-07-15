/**
 * Versioned learning progress (localStorage-only, no backend).
 *
 * V1 schema replaces the legacy `smart_code_progress` plain-array key
 * with a structured document so future fields (lastRoute, per-question
 * quiz stats, etc.) can be added without breaking existing users.
 *
 * On first read we transparently migrate the legacy key into v1 and
 * write back, then leave the legacy key in place so an older bundle
 * version still works for at most one session before this code runs.
 */

import { useEffect, useState } from 'react';
import { book } from '@/data/book';

export const PROGRESS_KEY = 'sc_progress_v1';
const LEGACY_PROGRESS_KEY = 'smart_code_progress';
const ROUTE_KEY = 'sc_last_route_v1';
const READING_KEY = 'sc_reading_v1';
const LEGACY_READING_KEY = 'sc_reading';

export interface ProgressV1 {
  version: 1;
  /** map<unitId, completionEpochMs> */
  completed: Record<string, number>;
}

export function emptyProgress(): ProgressV1 {
  return { version: 1, completed: {} };
}

export function readProgress(): ProgressV1 {
  if (typeof window === 'undefined') return emptyProgress();
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1 && parsed.completed) return parsed as ProgressV1;
    }
    // Migration from legacy array
    const legacy = window.localStorage.getItem(LEGACY_PROGRESS_KEY);
    if (legacy) {
      const ids = JSON.parse(legacy);
      if (Array.isArray(ids)) {
        const completed: Record<string, number> = {};
        const now = Date.now();
        for (const id of ids) {
          if (typeof id === 'string' && book.stages.some((s) => s.units.some((u) => u.id === id))) {
            completed[id] = now;
          }
        }
        const migrated: ProgressV1 = { version: 1, completed };
        writeProgress(migrated);
        return migrated;
      }
    }
  } catch {
    // Ignore decode errors: treat as fresh.
  }
  return emptyProgress();
}

export function writeProgress(p: ProgressV1): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    // Quota exceeded — swallow silently.
  }
}

export function markUnitCompleted(unitId: string): ProgressV1 {
  const p = readProgress();
  if (!p.completed[unitId]) {
    p.completed[unitId] = Date.now();
    writeProgress(p);
  }
  return p;
}

export function unmarkUnitCompleted(unitId: string): ProgressV1 {
  const p = readProgress();
  delete p.completed[unitId];
  writeProgress(p);
  return p;
}

export function isUnitCompleted(unitId: string, p: ProgressV1 = readProgress()): boolean {
  return Boolean(p.completed[unitId]);
}

export function recordRoute(route: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ROUTE_KEY, route);
  } catch {
    /* ignore */
  }
}

export function readLastRoute(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(ROUTE_KEY);
  } catch {
    return null;
  }
}

export function setReadingMode(on: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (on) {
      window.localStorage.setItem(READING_KEY, '1');
      window.localStorage.setItem(LEGACY_READING_KEY, '1');
      document.documentElement.classList.add('reading-mode');
    } else {
      window.localStorage.setItem(READING_KEY, '0');
      window.localStorage.setItem(LEGACY_READING_KEY, '0');
      document.documentElement.classList.remove('reading-mode');
    }
  } catch {
    /* ignore */
  }
}

export function readReadingMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const v = window.localStorage.getItem(READING_KEY) ?? window.localStorage.getItem(LEGACY_READING_KEY);
    return v === '1';
  } catch {
    return false;
  }
}

/**
 * React hook that subscribes to progress changes driven by:
 *  - direct mutators (mark/unmark) in the same tab
 *  - cross-tab updates via the `storage` event
 *
 * Components that render progress UIs should consume this hook rather
 * than calling `readProgress()` directly.
 */
export function useProgress(): [ProgressV1, () => void] {
  const [p, setP] = useState<ProgressV1>(() => readProgress());

  useEffect(() => {
    const sync = () => setP(readProgress());
    window.addEventListener('storage', sync);
    // Also re-emit on a custom in-tab broadcast so sibling components update.
    window.addEventListener('sc:progress-changed', sync as EventListener);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('sc:progress-changed', sync as EventListener);
    };
  }, []);

  const refresh = () => setP(readProgress());
  return [p, refresh];
}

export function broadcastProgressChange(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('sc:progress-changed'));
}

export function completedCount(p: ProgressV1 = readProgress()): number {
  return Object.keys(p.completed).length;
}

export function completedSet(p: ProgressV1 = readProgress()): Set<string> {
  return new Set(Object.keys(p.completed));
}
