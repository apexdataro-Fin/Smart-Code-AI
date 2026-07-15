/**
 * Core types shared across the Smart Code Lab.
 * No runtime imports; this file is the single source of truth referenced by
 * `registry.ts`, `storage.ts`, `projectManager.ts`, `executionEngine.ts`,
 * `pyodideLoader.ts`, `zip.ts`, and every component under `src/components/lab/`.
 */

export type LanguageId =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'html'
  | 'css'
  | 'json'
  | 'markdown'
  | 'shell';

/** Coarse category used by the UI to group language chips. */
export type LanguageCategory =
  | 'script'      // JS, TS, Python, Shell
  | 'markup'      // HTML
  | 'style'       // CSS
  | 'data'        // JSON
  | 'docs';       // Markdown

/**
 * Static, language-level metadata. EVERY UI surface reads from this map;
 * there is no hardcoded language logic in components. Adding Java, SQL,
 * C++, Rust, Go, or PHP = one new entry here + one adapter in registry.
 */
export interface LanguageMeta {
  id: LanguageId;
  displayName: string;
  /** Native name shown on RTL surfaces (Arabic display for some langs). */
  displayNameAr: string;
  /** Monaco language id consumed by @monaco-editor/react. */
  monacoLang: string;
  /** Default filename when a fresh project is created (e.g. "main.py"). */
  defaultFile: string;
  /** Default starter content shown when the project is empty / reset. */
  defaultCode: string;
  /** True if the Lab has a real in-browser runtime for this language. */
  executable: boolean;
  /** True if the runtime loads dynamically (Pyodide). UI can preload. */
  dynamicRuntime?: boolean;
  /** File extensions without the dot, lower-cased. */
  extensions: string[];
  /** Coarse category used for chip styling and groupings. */
  category: LanguageCategory;
  /** Optional subclass for runtime-specific UI (e.g. Pyodide). */
  runtime?: 'wasm-python' | 'iframe-sandbox' | 'iframe-html' | 'parse-only';
  /** Short icon character (emoji-free preferred but allowed for visual cues). */
  glyph: string;
  /** Single-line description shown on hover / language selector. */
  description: string;
}

export interface LabFile {
  /** Stable id within a project (filename-derived, no spaces). */
  id: string;
  /** Display filename e.g. "main.py". */
  name: string;
  language: LanguageId;
  content: string;
  /** Locked in guided mode so changes do not persist. */
  readOnly?: boolean;
}

export interface LabSettings {
  fontSize: number;
  theme: 'auto' | 'light' | 'dark';
  wordWrap: boolean;
  /** Mobile-friendly soft-wrap inside editor (long lines break on viewport). */
  softWrap: boolean;
  /** Show line numbers in the gutter. */
  lineNumbers: boolean;
  tabSize: number;
  minimap: boolean;
}

export interface LabProject {
  /** Schema version. Bump to invalidate older localStorage payloads. */
  version: 1;
  id: string;
  name: string;
  description?: string;
  /** Default language of the active file. */
  language: LanguageId;
  files: LabFile[];
  activeId: string;
  createdAt: number;
  updatedAt: number;
  /**
   * `workspace` = single-file playground; `project` = multi-file with file
   * explorer / tabs. The same LabProject shape is used for both; mode only
   * affects which UI surface is rendered around it.
   */
  mode: 'workspace' | 'project';
  settings: LabSettings;
}

export type RunMessageLevel =
  | 'log'
  | 'info'
  | 'warn'
  | 'error'
  | 'result'
  | 'system';

export interface RunMessage {
  level: RunMessageLevel;
  text: string;
  ts: number;
}

export interface RunError {
  message: string;
  line?: number;
  column?: number;
  /** Optional raw stack trace when available. */
  stack?: string;
  /** Optional heuristic hint from the language adapter. */
  hint?: string;
}

export interface RunResult {
  ok: boolean;
  outputs: RunMessage[];
  errors: RunError[];
  durationMs: number;
}

/**
 * Adapter contract — every language conforms to this. The Lab UI never
 * branches on `language === '...'`; it always goes through the adapter.
 * To add a new language: write one adapter, register it in
 * `registry.ts`, and the LanguageSelector will pick it up.
 */
export interface LanguageAdapter {
  /** Static metadata describing the language. */
  meta: LanguageMeta;
  /** Optional pretty formatter. Returns code unchanged when unsupported. */
  format?(code: string): Promise<string>;
  /** Run the active file (or the whole project) within an AbortSignal scope. */
  run(opts: RunOpts): Promise<RunResult>;
  /**
   * Assemble a preview HTML for the active file (used by PreviewPanel).
   * Returning `null` means: no preview available for this language.
   */
  preview(opts: PreviewOpts): string | null;
}

export interface RunOpts {
  project: LabProject;
  activeFile: LabFile;
  /** Fires repeatedly with streamed console messages. */
  onMessage: (m: RunMessage) => void;
  /** Fires when a structured error is captured. */
  onError: (e: RunError) => void;
  signal: AbortSignal;
}

export interface PreviewOpts {
  project: LabProject;
  activeFile: LabFile;
  /** All project files (for multi-file previews). */
  files: LabFile[];
}

export interface StarterProject {
  id: string;
  title: string;
  description: string;
  language: LanguageId;
  mode: 'workspace' | 'project';
  icon: string;
  /** Optional multi-file seed (project mode). */
  files?: LabFile[];
  /** Single-file seed (workspace mode). Optional when files[] provides seed. */
  defaultCode?: string;
  hint?: string;
}

export interface GuidedExercise {
  id: string;
  title: string;
  description: string;
  language: LanguageId;
  /** Locked reference implementation the learner can reveal. */
  teacherCode: string;
  /** File the learner edits in this guided exercise. */
  studentFileName: string;
  /** Starter content of the student's file. */
  studentInit: string;
  task: string;
  hints: string[];
  expectedOutputContains?: string[];
}

/** Payload used by the "Open in Lab" lesson-button handoff. */
export interface LessonHandoff {
  stageId: string;
  unitId: string;
  language: LanguageId;
  title: string;
  content: string;
  ts: number;
}
