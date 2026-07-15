import type { LabProject, LessonHandoff } from './types';

/**
 * Per-project storage:
 *   sc_lab_project_v1:<id> → {version: 1, ...LabProject}
 *
 * Active project pointer:
 *   sc_lab_active_v1 → <id>
 *
 * Lesson handoff (one-shot, cleared after consumption):
 *   sc_lab_lesson_handoff_v1 → {stageId, unitId, language, title, content, ts}
 *
 * All reads are defensive; if the payload is malformed the key is dropped.
 * All writes are wrapped in try/catch so a quota-full failure cannot crash
 * the SPA — autosave simply no-ops and the user is informed via the status
 * bar.
 */

const PROJECT_PREFIX = 'sc_lab_project_v1:';
const KEY_ACTIVE = 'sc_lab_active_v1';
const KEY_HANDOFF = 'sc_lab_lesson_handoff_v1';
const SCHEMA_VERSION = 1 as const;

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw) as T;
    if (!obj || typeof obj !== 'object') return null;
    return obj;
  } catch {
    return null;
  }
}

export function saveProject(project: LabProject): void {
  try {
    const stamped: LabProject = { ...project, version: SCHEMA_VERSION, updatedAt: Date.now() };
    localStorage.setItem(PROJECT_PREFIX + project.id, JSON.stringify(stamped));
  } catch {
    /* ignore quota errors */
  }
}

export function loadProject(id: string): LabProject | null {
  if (!id) return null;
  return safeParse<LabProject>(localStorage.getItem(PROJECT_PREFIX + id));
}

export function deleteProject(id: string): void {
  try {
    localStorage.removeItem(PROJECT_PREFIX + id);
    if (getActiveProjectId() === id) localStorage.removeItem(KEY_ACTIVE);
  } catch {
    /* ignore */
  }
}

export function listProjectIds(): string[] {
  const ids: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PROJECT_PREFIX)) ids.push(key.slice(PROJECT_PREFIX.length));
  }
  return ids;
}

export function getActiveProjectId(): string | null {
  return localStorage.getItem(KEY_ACTIVE);
}

export function setActiveProjectId(id: string | null): void {
  try {
    if (id) localStorage.setItem(KEY_ACTIVE, id);
    else localStorage.removeItem(KEY_ACTIVE);
  } catch {
    /* ignore */
  }
}

export function setLessonHandoff(payload: LessonHandoff): void {
  try {
    localStorage.setItem(KEY_HANDOFF, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function readLessonHandoff(): LessonHandoff | null {
  return safeParse<LessonHandoff>(localStorage.getItem(KEY_HANDOFF));
}

export function clearLessonHandoff(): void {
  try {
    localStorage.removeItem(KEY_HANDOFF);
  } catch {
    /* ignore */
  }
}

/** Cross-component bus so the status bar reflects saves made by any pane. */
export const LAB_SAVED_EVENT = 'sc:lab-saved';
export function broadcastLabSaved(projectId: string): void {
  window.dispatchEvent(new CustomEvent(LAB_SAVED_EVENT, { detail: { projectId } }));
}

/* ---------- Mobile UX persistence ---------- */

/**
 * Last opened content tab on mobile (Editor | Console | Preview | Output |
 * Errors). Persisted across page reloads so the user comes back exactly
 * where they left off.
 */
export const MOBILE_TAB_KEY = 'sc_lab_mobile_tab_v1';
const VALID_MOBILE_TABS = ['editor', 'console', 'preview', 'output', 'errors'] as const;
export type MobileTabId = typeof VALID_MOBILE_TABS[number];

export function readLastMobileTab(): MobileTabId {
  if (typeof localStorage === 'undefined') return 'editor';
  try {
    const raw = localStorage.getItem(MOBILE_TAB_KEY);
    if (raw && (VALID_MOBILE_TABS as readonly string[]).includes(raw)) return raw as MobileTabId;
  } catch { /* ignore */ }
  return 'editor';
}

export function writeLastMobileTab(tab: MobileTabId): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(MOBILE_TAB_KEY, tab);
  } catch { /* ignore */ }
}

/** Last lesson-mode tab on mobile (Lesson | Lab). */
export const MOBILE_LESSON_TAB_KEY = 'sc_lab_mobile_lesson_tab_v1';
const VALID_LESSON_TABS = ['lesson', 'lab'] as const;
export type MobileLessonTab = typeof VALID_LESSON_TABS[number];

export function readLastLessonTab(): MobileLessonTab {
  if (typeof localStorage === 'undefined') return 'lesson';
  try {
    const raw = localStorage.getItem(MOBILE_LESSON_TAB_KEY);
    if (raw && (VALID_LESSON_TABS as readonly string[]).includes(raw)) return raw as MobileLessonTab;
  } catch { /* ignore */ }
  return 'lesson';
}
export function writeLastLessonTab(tab: MobileLessonTab): void {
  if (typeof localStorage === 'undefined') return;
  try { localStorage.setItem(MOBILE_LESSON_TAB_KEY, tab); } catch { /* ignore */ }
}

/* ---------- Mobile v4 persistence ---------- */

/**
 * Vertical divider ratio (viewer height as a fraction of the workspace
 * inner height, 0..1). Persisted so the user comes back to the same
 * layout they left.
 */
export const MOBILE_DIVIDER_RATIO_KEY = 'sc_lab_mobile_divider_ratio_v1';
const DIVIDER_MIN = 0.18;
const DIVIDER_MAX = 0.62;
const DIVIDER_DEFAULT = 0.36;

export function readDividerRatio(): number {
  if (typeof localStorage === 'undefined') return DIVIDER_DEFAULT;
  try {
    const raw = localStorage.getItem(MOBILE_DIVIDER_RATIO_KEY);
    const n = raw ? parseFloat(raw) : NaN;
    if (!isFinite(n)) return DIVIDER_DEFAULT;
    return Math.min(DIVIDER_MAX, Math.max(DIVIDER_MIN, n));
  } catch { return DIVIDER_DEFAULT; }
}

export function writeDividerRatio(r: number): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const clamped = Math.min(DIVIDER_MAX, Math.max(DIVIDER_MIN, r));
    localStorage.setItem(MOBILE_DIVIDER_RATIO_KEY, clamped.toFixed(3));
  } catch { /* ignore */ }
}

export const MOBILE_DIVIDER_BOUNDS = { min: DIVIDER_MIN, max: DIVIDER_MAX, default: DIVIDER_DEFAULT };
