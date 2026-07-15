import { setPythonAdapter } from './registry';
import type { LanguageAdapter, RunOpts, RunResult, RunError, RunMessage } from './types';

/**
 * Pyodide (browser-Python) singleton loader — Smart Code Lab v2.
 *
 * Key improvements over v1:
 *   - Real download progress: Pyodide's `packageProgressCallback` reports
 *     bytes received during package downloads AFTER init. We blend this
 *     with deterministic milestones (script inject → wasm init → register)
 *     so the UI shows movement from 0 up to 1.0.
 *   - Retry once on transient failure (script onerror, abort, network).
 *   - Rich error reporting so the UI can offer a Retry button.
 *   - One singleton promise cached for the lifetime of the page.
 *
 * Loading is triggered lazily by `loadPyodideSingleton()` — but the Lab
 * UI now calls it eagerly whenever a Python workspace mounts so the
 * runtime is ready the moment the learner hits ▶.
 */

const PYODIDE_VERSION = '0.26.2';
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

export type PyodideStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface PyodideState {
  status: PyodideStatus;
  /** 0..1 — best-effort aggregated progress. */
  progress: number;
  /** Human-readable status message (Arabic when surfacing to UI). */
  message: string;
  /** Loaded pyodide instance, or null when not yet ready. */
  pyodide: any | null;
  /** Last error message, or null. */
  error: string | null;
  /** Number of retry attempts so far (0..MAX_RETRIES). */
  attempts: number;
  /** Maximum number of attempts before outright failure. */
  maxAttempts: number;
}

const MAX_RETRIES = 2; // initial + 1 retry

const state: PyodideState = {
  status: 'idle',
  progress: 0,
  message: '',
  pyodide: null,
  error: null,
  attempts: 0,
  maxAttempts: MAX_RETRIES,
};

const subscribers = new Set<(s: PyodideState) => void>();

export function subscribePyodide(cb: (s: PyodideState) => void): () => void {
  subscribers.add(cb);
  cb(state);
  return () => subscribers.delete(cb);
}

function setState(patch: Partial<PyodideState>): void {
  Object.assign(state, patch);
  for (const cb of subscribers) {
    try { cb({ ...state }); } catch { /* ignore */ }
  }
}

export function pyodideStatus(): PyodideState {
  return { ...state };
}

/** Reset to idle so a Retry button can kick off another attempt. */
export function resetPyodide(): void {
  setState({
    status: 'idle',
    progress: 0,
    message: '',
    error: null,
    pyodide: null,
    attempts: 0,
  });
}

let promise: Promise<any> | null = null;

/**
 * Idempotent loader. Returns the cached Promise if loading is in flight
 * or already complete. Resets the cached promise only after `resetPyodide`.
 */
export function loadPyodideSingleton(): Promise<any> {
  if (promise) return promise;
  promise = doLoadOnce(1).catch(async (firstErr) => {
    // Retry once on transient failure (script onerror, network glitch).
    const friendlyFirst = friendlyErrorMessage(firstErr);
    setState({
      status: 'error',
      message: `فشل التحميل: ${friendlyFirst} — إعادة المحاولة…`,
      error: friendlyFirst,
    });
    if (state.attempts < MAX_RETRIES) {
      await delay(1500);
      try {
        return await doLoadOnce(2);
      } catch (secondErr) {
        const friendlySecond = friendlyErrorMessage(secondErr);
        setState({
          status: 'error',
          message: `تعذّر تحميل بيئة Python. ${friendlySecond}`,
          error: friendlySecond,
        });
        throw new Error(friendlySecond);
      }
    }
    throw firstErr;
  });
  return promise;
}

async function doLoadOnce(attempt: number): Promise<any> {
  setState({
    status: 'loading',
    progress: 0,
    message: 'بدء تحميل بيئة Python…',
    error: null,
    pyodide: null,
    attempts: attempt,
  });
  await injectPyodideScript();
  setState({ progress: 0.4, message: 'يتم تشغيل WASM…' });
  const loadPyodide = (globalThis as any).loadPyodide;
  if (typeof loadPyodide !== 'function') {
    throw new Error('globalThis.loadPyodide غير متوفّر.');
  }
  const py = await loadPyodide({
    indexURL: PYODIDE_BASE,
    fullStdLib: true,
    // Real download progress for stdLib packages (after init).
    packageProgressCallback: (info: { name: string; received: number; total: number }) => {
      if (!info.total) return;
      const pkgShare = 0.55; // allocate 40%..95% to package downloads
      const portion = Math.max(0, Math.min(1, info.received / info.total));
      const blended = 0.4 + pkgShare * portion;
      setState({
        progress: blended,
        message: `جاري تنزيل ${info.name}… ${Math.round(portion * 100)}%`,
      });
    },
  });
  setState({ progress: 0.95, message: 'يتم تسجيل adapter Python…' });
  registerPythonAdapter(py);
  setState({
    status: 'ready',
    progress: 1,
    message: 'Python جاهز للتنفيذ.',
    pyodide: py,
    error: null,
  });
  return py;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function friendlyErrorMessage(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  if (/Failed to fetch|NetworkError|network/i.test(raw)) {
    return 'تعذّر الاتصال بـ CDN. تحقّق من الإنترنت.';
  }
  if (/loadPyodide/i.test(raw)) {
    return 'ملف Pyodide.js لم يُحمَّل. قد يكون محجوبًا في شبكتك.';
  }
  return raw || 'خطأ غير معروف.';
}

/** Dynamically inject the Pyodide loader script (only once). */
function injectPyodideScript(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (typeof document === 'undefined') return reject(new Error('No document'));
    if (document.querySelector(`script[data-pyodide]`)) {
      const check = () => {
        if ((globalThis as any).loadPyodide) resolve();
        else setTimeout(check, 80);
      };
      check();
      return;
    }
    const script = document.createElement('script');
    script.src = PYODIDE_BASE + 'pyodide.js';
    script.async = true;
    script.defer = true;
    script.dataset.pyodide = '1';
    setState({ progress: 0.05, message: 'يتم جلب Pyodide من CDN…' });
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load pyodide.js from CDN.'));
    document.head.appendChild(script);
  });
}

/** Replace the placeholder Python adapter with one that executes real code. */
function registerPythonAdapter(py: any): void {
  const adapter: LanguageAdapter = {
    meta: {
      id: 'python',
      displayName: 'Python',
      displayNameAr: 'بايثون',
      monacoLang: 'python',
      defaultFile: 'main.py',
      defaultCode: [
        '# 🐍 Smart Code Lab يستخدم Pyodide (Python في المتصفح)',
        'name = "العالم"',
        'print(f"مرحبا {name}!")',
        '',
        '# حلقة بسيطة',
        'for i in range(1, 4):',
        '    print(f"الخطوة {i}")',
        '',
      ].join('\n'),
      executable: true,
      dynamicRuntime: true,
      extensions: ['py', 'pyi', 'pyw'],
      category: 'script',
      runtime: 'wasm-python',
      glyph: 'Py',
      description: 'Python حقيقي يعمل في WASM عبر Pyodide — يُحمَّل من CDN مرة واحدة.',
    },
    async run(opts: RunOpts): Promise<RunResult> {
      const begin = performance.now();
      const outputs: RunMessage[] = [];
      const errors: RunError[] = [];
      const pushOut = (text: string, level: RunMessage['level']) => {
        const msg: RunMessage = { level, text, ts: Date.now() };
        outputs.push(msg);
        opts.onMessage(msg);
      };
      try {
        py.setStdout({ batched: (s: string) => pushOut(s, 'log') });
        py.setStderr({ batched: (s: string) => pushOut(s, 'error') });
      } catch { /* older Pyodide API */ }
      try {
        await py.runPythonAsync(opts.activeFile.content);
      } catch (e) {
        const err = errFromPyodide(e);
        errors.push(err);
        opts.onError(err);
      }
      return {
        ok: errors.length === 0,
        outputs,
        errors,
        durationMs: performance.now() - begin,
      };
    },
    preview() { return null; },
  };
  setPythonAdapter(adapter);
}

function errFromPyodide(e: unknown): RunError {
  let message = e instanceof Error ? e.message : String(e);
  let line: number | undefined;
  const m = /File "<string>", line (\d+)/.exec(message);
  if (m) line = parseInt(m[1], 10);
  let hint: string | undefined;
  if (/SyntaxError/i.test(message)) hint = 'راجع المسافات البادئة والأقواس والفواصل.';
  else if (/NameError/i.test(message)) hint = 'تأكّد أنك كتبت اسم المتغيّر بشكل صحيح.';
  else if (/IndentationError/i.test(message)) hint = 'استخدم ٤ فراغات متساوية.';
  else if (/ZeroDivisionError/i.test(message)) hint = 'لا يمكن القسمة على صفر.';
  else if (/TypeError/i.test(message)) hint = 'النوع غير متطابق — راجع توقيع الدالة.';
  return { message, line, stack: message, hint };
}
