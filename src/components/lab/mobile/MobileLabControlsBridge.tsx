import { useSyncExternalStore } from 'react';

/**
 * MobileLabControlsBridge
 *
 * Cross-tree state bridge that allows the global Shell header to read
 * the Smart Code Lab's run-state + handlers from MobileLabRoot. We use
 * a module-level singleton + `useSyncExternalStore` so two siblings
 * (Shell header + MobileLabRoot) that live on opposite sides of the
 * React tree can stay in sync without lifting state or portals.
 *
 *   Writer: MobileLabRoot pushes a snapshot through
 *           `setMobileLabControlsSnapshot(value)` from a layout effect.
 *   Reader: <MobileShellControlBar/> in Shell.tsx calls
 *           `useMobileLabControlsSnapshot()` on mobile when on /lab/*.
 *
 * The snapshot is `null` whenever no Lab is currently mounted (e.g. on
 * /toc, /search, /quiz, while transitioning between lab projects, or
 * after MobileLabRoot unmounts). Renderers must bail out to null when
 * the snapshot is null.
 *
 * Stability: writers update only when inputs actually change so we
 * avoid re-rendering the Shell header on every MobileLabRoot commit.
 */

export type MobileLabControlsSnapshot = {
  /** True while `runProject()` is in flight. */
  isRunning: boolean;
  /** True when the language/python env is not ready yet. */
  runDisabled: boolean;
  /** True when the active language is python and pyState is loading. */
  pythonLoading: boolean;
  /** Loading progress 0..100 (only meaningful while pythonLoading). */
  pythonPercent: number;
  /** True when the active language is python and pyState is error. */
  pythonError: boolean;
  /** Imperative handlers — closures over the latest MobileLabRoot state. */
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
  onOpenFiles: () => void;
  onOpenSettings: () => void;
  /** Optional — only set when pythonError === true and a retry exists. */
  onRetryPython?: () => void;
} | null;

interface BridgeState {
  /** `null` whenever no Lab is mounted. */
  snapshot: MobileLabControlsSnapshot;
}

class MobileLabControlsStore {
  private listeners = new Set<() => void>();
  private state: BridgeState = { snapshot: null };

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): BridgeState => this.state;

  /**
   * Writes the new snapshot. Same-reference no-op so React's
   * tear-stability check in useSyncExternalStore passes by default.
   */
  setSnapshot = (next: MobileLabControlsSnapshot): void => {
    // Skip writing if the new reference is identical (covers the case
    // where MobileLabRoot re-renders without changing anything).
    if (this.state.snapshot === next) return;
    this.state = { snapshot: next };
    for (const l of this.listeners) l();
  };
}

/** Singleton. Exists exactly once per JS bundle. */
export const mobileLabControlsStore = new MobileLabControlsStore();

/**
 * React hook consumers in Shell.tsx (or anywhere downstream of a
 * Router) can subscribe to. Returns `null` while the Lab is not yet
 * mounted, after navigation away, or while a project transition is in
 * progress.
 */
export function useMobileLabControlsSnapshot(): MobileLabControlsSnapshot {
  return useSyncExternalStore(
    mobileLabControlsStore.subscribe,
    () => mobileLabControlsStore.getSnapshot().snapshot,
  );
}

/**
 * Mobile-only writers push snapshots through this function. MobileLabRoot
 * composes a fresh snapshot object whenever handlers or volatile state
 * (isRunning / pythonPercent / etc.) change.
 */
export const setMobileLabControlsSnapshot = (
  next: MobileLabControlsSnapshot,
): void => {
  mobileLabControlsStore.setSnapshot(next);
};
