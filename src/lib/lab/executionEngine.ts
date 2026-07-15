import type { LabProject, RunError, RunMessage, RunResult } from './types';
import { getAdapter } from './registry';

/**
 * Execution engine. A project has at most ONE in-flight run; starting
 * a new run while one is active stops the previous one (Stop button).
 *
 * The engine is intentionally small: most of the runtime logic lives in
 * each language adapter. This file orchestrates: lifecycle, abort
 * signaling, message/error dispatching, and final summary.
 */

export interface RunState {
  running: boolean;
  aborted: boolean;
  startedAt: number;
  projectId: string;
  fileId: string;
}

let current: {
  controller: AbortController;
  state: RunState;
} | null = null;

export function getRunState(): RunState | null {
  return current?.state ?? null;
}

export function isRunning(): boolean {
  return !!current;
}

export function stop(): void {
  if (!current) return;
  current.state.aborted = true;
  current.controller.abort();
}

/**
 * Run the project's active file. Calls `onStart` once, `onMessage`/
 * `onError` repeatedly, then `onDone` exactly once with the final result.
 */
export async function runProject(
  project: LabProject,
  callbacks: {
    onStart?: (s: RunState) => void;
    onMessage: (m: RunMessage) => void;
    onError: (e: RunError) => void;
    onDone: (r: RunResult) => void;
  },
): Promise<RunResult> {
  // Stop any in-flight run.
  if (current) {
    current.state.aborted = true;
    current.controller.abort();
    current = null;
  }

  const activeFile = project.files.find((f) => f.id === project.activeId) ?? project.files[0];
  const controller = new AbortController();
  const state: RunState = {
    running: true,
    aborted: false,
    startedAt: Date.now(),
    projectId: project.id,
    fileId: activeFile.id,
  };
  current = { controller, state };
  callbacks.onStart?.(state);

  const adapter = getAdapter(activeFile.language);

  let result: RunResult;
  try {
    result = await adapter.run({
      project,
      activeFile,
      signal: controller.signal,
      onMessage: callbacks.onMessage,
      onError: callbacks.onError,
    });
  } catch (e: unknown) {
    const err: RunError = {
      message: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
    };
    callbacks.onError(err);
    result = { ok: false, outputs: [], errors: [err], durationMs: 0 };
  }

  state.running = false;
  callbacks.onDone(result);
  if (current?.controller === controller) current = null;
  return result;
}
