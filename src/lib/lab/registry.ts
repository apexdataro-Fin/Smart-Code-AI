import type { LanguageAdapter, LanguageId, LanguageMeta, PreviewOpts, RunOpts, RunResult, RunError, RunMessage, LabFile } from './types';

/* ============================================================================
 * Per-language adapter definitions.
 *
 * Each adapter is a self-contained module: it owns its display name, its
 * Monaco language, its default filename + template, its file extensions,
 * its execution runtime, AND its preview assembler. The Lab UI never
 * branches on `language === '...'`; it always goes through `getAdapter()`.
 *
 * Adding a new language (Java, SQL, C++, Rust, Go, PHP…) = write one adapter
 * and append it to the `ADAPTERS` map. No UI changes needed.
 * ========================================================================= */

/* ----------------------------- JavaScript ----------------------------- */

const javascriptAdapter: LanguageAdapter = {
  meta: {
    id: 'javascript',
    displayName: 'JavaScript',
    displayNameAr: 'جافاسكربت',
    monacoLang: 'javascript',
    defaultFile: 'main.js',
    defaultCode: [
      '// 🚀 أول تجربة JavaScript في Smart Code Lab',
      "const name = 'العالم';",
      'console.log(`مرحبا ${name}!`);',
      '',
      '// جرّب: غيّر name واضغط ▶ مرة أخرى.',
      '',
    ].join('\n'),
    executable: true,
    extensions: ['js', 'mjs', 'cjs', 'jsx'],
    category: 'script',
    runtime: 'iframe-sandbox',
    glyph: 'JS',
    description: 'تشغيل فوري داخل iframe sandbox مع console.log وأحداث خطأ حقيقية.',
  },
  async run(opts) { return runInSandbox(opts, opts.activeFile.content); },
  preview(opts) { return wrapScriptPreview(opts); },
};

/* ----------------------------- TypeScript ----------------------------- */

const typescriptAdapter: LanguageAdapter = {
  meta: {
    id: 'typescript',
    displayName: 'TypeScript',
    displayNameAr: 'تايبسكربت',
    monacoLang: 'typescript',
    defaultFile: 'main.ts',
    defaultCode: [
      '// 🧩 TypeScript — أنواع تُزال تلقائيًا قبل التشغيل',
      'interface User {',
      '  name: string;',
      '  level: number;',
      '}',
      '',
      'const greet = (u: User): string =>',
      '  `${u.name} — مستوى ${u.level}`;',
      '',
      "console.log(greet({ name: 'لمى', level: 3 }));",
      '',
    ].join('\n'),
    executable: true,
    extensions: ['ts', 'tsx', 'mts', 'cts'],
    category: 'script',
    runtime: 'iframe-sandbox',
    glyph: 'TS',
    description: 'تنفيذ بعد إزالة الأنواع في المتصفح — لا يحتاج خادمًا.',
  },
  async run(opts) {
    const stripped = stripTypescript(opts.activeFile.content);
    opts.onMessage({ level: 'system', text: 'تم تنفيذ TypeScript بعد إزالة الأنواع.', ts: Date.now() });
    return runInSandbox(opts, stripped);
  },
  preview(opts) { return wrapScriptPreview(opts); },
};

/* -------------------------------- Python ------------------------------ */
/* Placeholder — replaced once Pyodide finishes loading. See pyodideLoader. */

let pythonAdapter: LanguageAdapter = {
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
      '# تحرّك خطوة للأمام',
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
  async run(opts) {
    opts.onError({
      message: 'Pyodide لم يكتمل التحميل بعد.',
      hint: 'Smart Code Lab يحمّل Python تلقائيًا عند فتح مساحة Python.',
    });
    return { ok: false, outputs: [], errors: [], durationMs: 0 };
  },
  preview() { return null; },
};

/* --------------------------------- HTML ------------------------------- */

const htmlAdapter: LanguageAdapter = {
  meta: {
    id: 'html',
    displayName: 'HTML',
    displayNameAr: 'إتش تي إم إل',
    monacoLang: 'html',
    defaultFile: 'index.html',
    defaultCode: [
      '<!doctype html>',
      '<html lang="ar" dir="rtl">',
      '<head>',
      '  <meta charset="utf-8">',
      '  <title>تجربة</title>',
      '  <style>',
      '    body { font-family: system-ui; padding: 2rem; background: #fafafa; }',
      '    h1 { color: #0ea5e9; }',
      '    button { padding: .5rem 1rem; border-radius: 6px; border: 0;',
      '             background: #0ea5e9; color: white; cursor: pointer; }',
      '  </style>',
      '</head>',
      '<body>',
      '  <h1>مرحبا بالعالم</h1>',
      '  <p>عدّل هذا الكود واضغط ▶ لمشاهدة المخرجات في Preview.</p>',
      '  <button onclick="alert(\'تم!\')">اضغطني</button>',
      '</body>',
      '</html>',
      '',
    ].join('\n'),
    executable: true,
    extensions: ['html', 'htm', 'xhtml'],
    category: 'markup',
    runtime: 'iframe-html',
    glyph: '<>',
    description: 'صفحة HTML تُعرض في iframe مع Preview بمقاسات مختلفة.',
  },
  async run(opts) {
    if (typeof document === 'undefined') return { ok: false, outputs: [], errors: [], durationMs: 0 };
    const begin = performance.now();
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.style.cssText = 'position:fixed;left:-99999px;top:-99999px;width:1px;height:1px;border:0;';
    iframe.srcdoc = opts.activeFile.content;
    return new Promise<RunResult>((resolve) => {
      iframe.addEventListener('load', () => {
        try { iframe.remove(); } catch { /* */ }
        opts.onMessage({ level: 'system', text: 'تم تشغيل صفحة HTML بنجاح.', ts: Date.now() });
        resolve({ ok: true, outputs: [], errors: [], durationMs: performance.now() - begin });
      });
      document.body.appendChild(iframe);
    });
  },
  preview(opts) {
    // HTML adapter handles BOTH single-html AND multi-file project preview.
    const otherFiles = opts.files.filter((f) => f.id !== opts.activeFile.id);
    if (otherFiles.length === 0) {
      return opts.activeFile.content;
    }
    return assembleProjectHtml(opts.activeFile.content, otherFiles);
  },
};

/* --------------------------------- CSS -------------------------------- */

const cssAdapter: LanguageAdapter = {
  meta: {
    id: 'css',
    displayName: 'CSS',
    displayNameAr: 'سي إس إس',
    monacoLang: 'css',
    defaultFile: 'style.css',
    defaultCode: [
      '/* 🎨 ألوان وتنسيقات جاهزة للمعاينة مع عناصر HTML افتراضية */',
      'body {',
      '  font-family: system-ui, sans-serif;',
      '  padding: 2rem;',
      '  background: #fafafa;',
      '  color: #1f2937;',
      '}',
      'h1 { color: #0ea5e9; }',
      'p  { max-width: 640px; }',
      'button {',
      '  background: #0ea5e9; color: white; border: 0;',
      '  padding: .5rem 1rem; border-radius: 6px; cursor: pointer;',
      '}',
      '',
    ].join('\n'),
    executable: false,
    extensions: ['css', 'scss', 'less'],
    category: 'style',
    glyph: '{}',
    description: 'يُحقن في Preview مع عناصر HTML عربية افتراضية. لا يُنفَّذ وحده.',
  },
  async run(opts) {
    opts.onMessage({
      level: 'system',
      text: 'CSS وحده لا يُنفَّذ. أضف index.html يستورده مع <link rel="stylesheet"> لمعاينة كاملة.',
      ts: Date.now(),
    });
    return { ok: true, outputs: [], errors: [], durationMs: 0 };
  },
  preview(opts) {
    return (
      '<!doctype html><html lang="ar" dir="rtl"><head>' +
      '<meta charset="utf-8">' +
      '<style>' + opts.activeFile.content + '</style>' +
      '</head><body>' +
      '<h1>مرحبا بالعالم</h1>' +
      '<p>عاينة مباشرة لتنسيقات CSS. عدّل الملف لمشاهدة التحديث.</p>' +
      '<button>اضغطني</button>' +
      '</body></html>'
    );
  },
};

/* --------------------------------- JSON ------------------------------- */

const jsonAdapter: LanguageAdapter = {
  meta: {
    id: 'json',
    displayName: 'JSON',
    displayNameAr: 'جي سون',
    monacoLang: 'json',
    defaultFile: 'data.json',
    defaultCode: [
      '{',
      '  "name": "smart-code-lab",',
      '  "version": 1,',
      '  "owner": {',
      '    "name": "Smart Code",',
      '    "level": 1',
      '  },',
      '  "tags": ["RTL", "Arabic", "Lab"]',
      '}',
      '',
    ].join('\n'),
    executable: false,
    extensions: ['json', 'jsonc', 'geojson'],
    category: 'data',
    runtime: 'parse-only',
    glyph: '{}',
    description: 'تحقّق من صحة JSON بدون تنفيذ — معاينة شجرية.',
  },
  async run(opts) {
    try {
      const parsed = JSON.parse(opts.activeFile.content);
      opts.onMessage({ level: 'result', text: 'JSON صالح ✓', ts: Date.now() });
      const shape = describeShape(parsed);
      if (shape) opts.onMessage({ level: 'info', text: shape, ts: Date.now() });
      return { ok: true, outputs: [], errors: [], durationMs: 0 };
    } catch (e) {
      const err = errFromException(e);
      opts.onError(err);
      return { ok: false, outputs: [], errors: [err], durationMs: 0 };
    }
  },
  preview(opts) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(opts.activeFile.content);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return (
        '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">' +
        '<style>.err{color:#ef4444;font-family:monospace}</style></head>' +
        '<body><h1>خطأ في JSON</h1><pre class="err">' + escapeHtml(msg) + '</pre></body></html>'
      );
    }
    const tree = renderJsonTree(parsed);
    return (
      '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">' +
      '<style>body{font-family:ui-monospace,monospace;padding:1.5rem;background:#0b1220;color:#e6edf3}' +
      '.k{color:#7dd3fc}.s{color:#a7f3d0}.n{color:#fcd34d}.b{color:#fca5a5}.indent{padding-inline-start:1rem}</style>' +
      '</head><body><h1>JSON صالح ✓</h1>' + tree + '</body></html>'
    );
  },
};

/* ------------------------------- Markdown ----------------------------- */

const markdownAdapter: LanguageAdapter = {
  meta: {
    id: 'markdown',
    displayName: 'Markdown',
    displayNameAr: 'ماركداون',
    monacoLang: 'markdown',
    defaultFile: 'README.md',
    defaultCode: [
      '# مذكرة',
      '',
      '## نقاط',
      '',
      '- نقطة ١',
      '- نقطة ٢',
      '',
      '## كود',
      '',
      '```js',
      "console.log('مرحبا');",
      '```',
      '',
      '> **ملاحظة:** Markdown لا يُنفَّذ، اضغط Preview لمعاينته.',
      '',
    ].join('\n'),
    executable: false,
    extensions: ['md', 'markdown'],
    category: 'docs',
    runtime: 'parse-only',
    glyph: 'M↓',
    description: 'محرّك Markdown خفيف داخلي للمعاينة — لا يحتاج مكتبة.',
  },
  async run(opts) {
    opts.onMessage({ level: 'system', text: 'Markdown — اضغط Preview لعرضه.', ts: Date.now() });
    return { ok: true, outputs: [], errors: [], durationMs: 0 };
  },
  preview(opts) {
    return (
      '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">' +
      '<style>body{font-family:system-ui;padding:1.5rem;max-width:780px;margin:0 auto}' +
      'h1,h2,h3{color:#0ea5e9}pre{background:#0b1220;color:#e6edf3;padding:.8rem 1rem;border-radius:8px;overflow:auto}' +
      'code{background:rgba(0,0,0,.05);padding:.1rem .3rem;border-radius:4px}blockquote{border-inline-start:4px solid #0ea5e9;padding-inline-start:1rem;color:#334155}</style>' +
      '</head><body>' + renderMarkdown(opts.activeFile.content) + '</body></html>'
    );
  },
};

/* --------------------------------- Shell ------------------------------ */

const shellAdapter: LanguageAdapter = {
  meta: {
    id: 'shell',
    displayName: 'Shell',
    displayNameAr: 'شل',
    monacoLang: 'shell',
    defaultFile: 'main.sh',
    defaultCode: [
      '#!/usr/bin/env bash',
      '# 🐚 محرّك Shell — للمراجعة والتعلّم فقط',
      '# (التنفيذ الحقيقي غير متاح داخل المتصفح)',
      '',
      'echo "مرحبا بالعالم"',
      'for i in 1 2 3; do',
      '  echo "الخطوة $i"',
      'done',
      '',
    ].join('\n'),
    executable: false,
    extensions: ['sh', 'bash', 'zsh', 'ksh'],
    category: 'script',
    runtime: 'parse-only',
    glyph: '$_',
    description: 'تحليل بناء الجملة + تلوين + معاينة. لا يُنفَّذ في المتصفح (sandbox).',
  },
  async run(opts) {
    opts.onMessage({
      level: 'system',
      text: 'Shell غير قابل للتنفيذ آمنًا داخل المتصفح. عدّل النص وراجع التلوين.',
      ts: Date.now(),
    });
    return { ok: true, outputs: [], errors: [], durationMs: 0 };
  },
  preview(opts) {
    return (
      '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">' +
      '<style>body{font-family:ui-monospace,monospace;padding:1.5rem;background:#0b1220;color:#a7f3d0;white-space:pre-wrap}' +
      'h1{color:#7dd3fc;font-family:system-ui}</style>' +
      '</head><body><h1>📜 Shell — مراجعة</h1>' + escapeHtml(opts.activeFile.content) + '</body></html>'
    );
  },
};

/* ============================================================================
 * Registry
 * ========================================================================= */

const ADAPTERS: Record<LanguageId, LanguageAdapter> = {
  javascript: javascriptAdapter,
  typescript: typescriptAdapter,
  python: pythonAdapter,
  html: htmlAdapter,
  css: cssAdapter,
  json: jsonAdapter,
  markdown: markdownAdapter,
  shell: shellAdapter,
};

/* ---------- Public API ---------- */

export function getAdapter(language: LanguageId): LanguageAdapter {
  return ADAPTERS[language] ?? javascriptAdapter;
}

export function getAllAdapters(): LanguageAdapter[] {
  // Stable order: by category then displayName.
  const order: LanguageId[] = [
    'javascript', 'typescript', 'python',
    'html', 'css',
    'json', 'markdown', 'shell',
  ];
  return order.map((id) => ADAPTERS[id]);
}

export function listLanguages(): LanguageId[] {
  return getAllAdapters().map((a) => a.meta.id);
}

export function getLanguageMeta(language: LanguageId): LanguageMeta {
  return getAdapter(language).meta;
}

export function getMonacoLang(language: LanguageId): string {
  return getAdapter(language).meta.monacoLang;
}

export function setPythonAdapter(adapter: LanguageAdapter): void {
  pythonAdapter = adapter;
  ADAPTERS.python = adapter;
}

/* ============================================================================
 * Heuristics + small utilities shared by adapters.
 * ========================================================================= */

const HINTS: Array<[RegExp, string]> = [
  [/is not defined/i, 'تأكّد أنك أعلنت المتغيّر قبل استخدامه.'],
  [/Unexpected token/i, 'هناك رمز غير متوقّع — تحقّق من الأقواس والفواصل المنقوطة.'],
  [/Cannot find name/i, 'لم يتم العثور على المعرّف. هل هناك خطأ إملائي أو استيراد ناقص؟'],
  [/SyntaxError/i, 'خطأ في بناء الجملة — راجع الأقواس والفواصل.'],
  [/ReferenceError/i, 'مرجع غير موجود. تأكّد من تعريف المتغيّر أو الدالة.'],
  [/TypeError/i, 'النوع غير متطابق — ربما استدعيت دالة على شيء ليس دالة.'],
  [/IndentationError/i, 'مسافة بادئة غير صحيحة في Python — استخدم ٤ فراغات متساوية.'],
  [/ModuleNotFoundError/i, 'لم يتم العثور على الوحدة. تأكّد من اسمها ومن توفرها.'],
  [/Permission denied/i, 'لا يوجد إذن. السبب على الأرجح sandbox المتصفح.'],
  [/self is not defined/i, 'استخدم window بدل self داخل iframe sandbox.'],
];

export function suggestHint(message: string): string | undefined {
  for (const [re, hint] of HINTS) if (re.test(message)) return hint;
  return undefined;
}

function errFromException(e: unknown, line?: number, column?: number): RunError {
  if (e instanceof Error) {
    return { message: e.message, line, column, stack: e.stack, hint: suggestHint(e.message) };
  }
  return { message: String(e), line, column, hint: suggestHint(String(e)) };
}

/* ============================================================================
 * Iframe sandbox runner (used by JS / TS). Generic — no language knowledge.
 * ========================================================================= */

function runInSandbox(opts: RunOpts, code: string): Promise<RunResult> {
  const begin = performance.now();
  const outputs: RunMessage[] = [];
  const errors: RunError[] = [];
  if (typeof document === 'undefined') return Promise.resolve({ ok: false, outputs, errors, durationMs: 0 });
  return new Promise<RunResult>((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.style.cssText = 'position:fixed;left:-99999px;top:-99999px;width:1px;height:1px;border:0;';
    const shim = `
      <script>
        (function () {
          var send = function (level, args) {
            try {
              var text = args.map(function (a) {
                if (typeof a === 'string') return a;
                try { return JSON.stringify(a); } catch (e) { return String(a); }
              }).join(' ');
              parent.postMessage({ type: 'console', level: level, text: text, ts: Date.now() }, '*');
            } catch (e) {}
          };
          ['log','info','warn','error'].forEach(function (level) {
            var orig = console[level];
            console[level] = function () {
              send(level, Array.prototype.slice.call(arguments));
              try { return orig.apply(console, arguments); } catch (e) {}
            };
          });
          window.addEventListener('error', function (ev) {
            parent.postMessage({ type: 'error', text: ev.message || 'خطأ', line: ev.lineno, column: ev.colno, stack: ev.error && ev.error.stack }, '*');
          });
          window.addEventListener('unhandledrejection', function (ev) {
            var msg = (ev.reason && ev.reason.message) || String(ev.reason);
            parent.postMessage({ type: 'error', text: msg, stack: ev.reason && ev.reason.stack }, '*');
          });
        })();
      <\/script>`;
    iframe.srcdoc = '<!doctype html><html><head><meta charset="utf-8"></head><body>' + shim + '<script>\ntry {\n' + code + '\n} catch (e) { parent.postMessage({ type: "error", text: (e && e.message) || String(e), stack: e && e.stack }, "*"); }\n<\/script></body></html>';

    const handler = (ev: MessageEvent) => {
      if (ev.source !== iframe.contentWindow) return;
      const data = ev.data as { type?: string; level?: string; text?: string; line?: number; column?: number; stack?: string; ts?: number };
      if (!data || !data.type) return;
      if (data.type === 'console') {
        const msg: RunMessage = { level: (data.level as any) ?? 'log', text: String(data.text ?? ''), ts: data.ts ?? Date.now() };
        outputs.push(msg);
        opts.onMessage(msg);
      } else if (data.type === 'error') {
        const err: RunError = { message: String(data.text ?? ''), line: data.line, column: data.column, stack: data.stack, hint: suggestHint(String(data.text ?? '')) };
        errors.push(err);
        opts.onError(err);
      }
    };
    window.addEventListener('message', handler);

    const cleanup = () => {
      window.removeEventListener('message', handler);
      try { iframe.remove(); } catch { /* */ }
    };

    let timeout: ReturnType<typeof setTimeout> | undefined;
    const finish2 = (ok: boolean) => {
      if (timeout) clearTimeout(timeout);
      cleanup();
      resolve({ ok, outputs, errors, durationMs: performance.now() - begin });
    };
    if (opts.signal) opts.signal.addEventListener('abort', () => finish2(errors.length === 0), { once: true });

    iframe.addEventListener('load', () => { try { iframe.contentWindow?.postMessage({ type: 'ready' }, '*'); } catch { /* */ } });
    timeout = setTimeout(() => {
      opts.onMessage({ level: 'system', text: 'انتهى وقت التشغيل (10 ثوانٍ).', ts: Date.now() });
      finish2(errors.length === 0);
    }, 10_000);
    document.body.appendChild(iframe);
  });
}

/* ============================================================================
 * Helpers used by adapters and PreviewPanel.
 * ========================================================================= */

/** Wrap JS / TS script inside a tiny RTL HTML page so Preview shows output. */
function wrapScriptPreview(opts: PreviewOpts): string {
  const code = opts.activeFile.content;
  return (
    '<!doctype html><html lang="ar" dir="rtl"><head>' +
    '<meta charset="utf-8"><title>Preview</title>' +
    '<style>body{font-family:system-ui;padding:1.5rem}#out{background:#0b1220;color:#a7f3d0;padding:1rem;border-radius:8px;white-space:pre-wrap}</style>' +
    '</head><body><pre id="out"></pre><script>try{' +
    "document.addEventListener('DOMContentLoaded',function(){var o=document.getElementById('out');var orig=console.log;console.log=function(){var line=Array.from(arguments).map(function(a){return typeof a==='string'?a:JSON.stringify(a);}).join(' ');o.textContent+=line+'\\n';orig.apply(console,arguments)};" +
    code +
    '\n});<\/script></body></html>'
  );
}

/** Inline other project files into index.html so Preview reflects them. */
function assembleProjectHtml(indexHtml: string, others: LabFile[]): string {
  let html = indexHtml;
  for (const f of others) {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!ext) continue;
    if (ext === 'css' || ext === 'scss') {
      html = html.replace(
        /<link[^>]+rel=["']stylesheet["'][^>]*>/i,
        (m) => m + '\n<style>' + f.content + '</style>',
      );
      if (!/<link[^>]+rel=["']stylesheet["'][^>]*>/i.test(html)) {
        html = html.replace(/<\/head>/i, '<style>' + f.content + '</style></head>');
      }
    } else if (ext === 'js' || ext === 'ts' || ext === 'mjs') {
      html = html.replace(
        /<script[^>]+src=["'][^"']+["'][^>]*>\s*<\/script>/gi,
        (m) => m + '\n<script>\n' + f.content + '\n<\/script>',
      );
      if (!/<script[^>]+src=["'][^"']+["'][^>]*>/i.test(html)) {
        html = html.replace(/<\/body>/i, '<script>\n' + f.content + '\n<\/script></body>');
      }
    } else {
      html = html.replace(/<\/head>/i, '<style>' + escapeHtml(`/* ${f.name} */`) + f.content + '</style></head>');
    }
  }
  return html;
}

/* ---------- JSON shape + tree preview ---------- */

function describeShape(v: unknown): string | null {
  if (Array.isArray(v)) return `مصفوفة بطول ${v.length}.`;
  if (v && typeof v === 'object') {
    const keys = Object.keys(v as object);
    return `كائن بـ ${keys.length} مفاتيح: ${keys.slice(0, 6).join('، ')}${keys.length > 6 ? '…' : ''}.`;
  }
  return null;
}

function renderJsonTree(v: unknown): string {
  if (v === null) return '<span class="b">null</span>';
  if (typeof v === 'string') return '<span class="s">"' + escapeHtml(v) + '"</span>';
  if (typeof v === 'number') return '<span class="n">' + v + '</span>';
  if (typeof v === 'boolean') return '<span class="b">' + v + '</span>';
  if (Array.isArray(v)) {
    if (v.length === 0) return '[]';
    const items = v.map((it) => '<div class="indent">• ' + renderJsonTree(it) + '</div>').join('');
    return '[' + items + ']';
  }
  if (typeof v === 'object') {
    const keys = Object.keys(v as object);
    if (keys.length === 0) return '{}';
    const rows = keys
      .map((k) => '<div class="indent"><span class="k">"' + escapeHtml(k) + '"</span>: ' + renderJsonTree((v as any)[k]) + '</div>')
      .join('');
    return '{' + rows + '}';
  }
  return escapeHtml(String(v));
}

/* ---------- Tiny Markdown renderer ---------- */

function renderMarkdown(src: string): string {
  const lines = src.split(/\r?\n/);
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const ln = lines[i];
    const h = /^(#{1,4})\s+(.*)$/.exec(ln);
    if (h) {
      const level = h[1].length;
      out.push('<h' + level + '>' + inlineMd(h[2]) + '</h' + level + '>');
      i++;
      continue;
    }
    const li = /^\s*[-*]\s+(.*)$/.exec(ln);
    if (li) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push('<li>' + inlineMd(lines[i].replace(/^\s*[-*]\s+/, '')) + '</li>');
        i++;
      }
      out.push('<ul>' + items.join('') + '</ul>');
      continue;
    }
    const ol = /^\s*\d+\.\s+(.*)$/.exec(ln);
    if (ol) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push('<li>' + inlineMd(lines[i].replace(/^\s*\d+\.\s+/, '')) + '</li>');
        i++;
      }
      out.push('<ol>' + items.join('') + '</ol>');
      continue;
    }
    const f = /^```/.exec(ln);
    if (f) {
      const lang = ln.slice(3).trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      out.push('<pre' + (lang ? ' data-lang="' + escapeHtml(lang) + '"' : '') + '><code>' + escapeHtml(buf.join('\n')) + '</code></pre>');
      continue;
    }
    if (/^>\s?/.test(ln)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      out.push('<blockquote>' + inlineMd(buf.join(' ')) + '</blockquote>');
      continue;
    }
    if (ln.trim() === '') { i++; continue; }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,4}\s|\s*[-*]\s|\s*\d+\.\s|>|```)/.test(lines[i])) {
      para.push(lines[i]); i++;
    }
    out.push('<p>' + inlineMd(para.join(' ')) + '</p>');
  }
  return out.join('\n');
}

function inlineMd(s: string): string {
  s = escapeHtml(s);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|\W)\*([^*]+)\*(?=\W|$)/g, '$1<em>$2</em>');
  return s;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ---------- Minimal TypeScript → JavaScript type-stripping pass ---------- */

function stripTypescript(src: string): string {
  let s = src;
  s = s.replace(/(^|\n)\s*interface\s+\w[^\n{]*\{[\s\S]*?\}\s*/g, '\n');
  s = s.replace(/(^|\n)\s*type\s+\w[^\n=]*=[^\n;]+;?/g, '\n');
  s = s.replace(/\s+as\s+[A-Za-z0-9_<>[\]\|\\& ,\."'`$]+/g, '');
  s = s.replace(/(\(|,)\s*([A-Za-z_$][\w$]*)\s*:\s*[^,()\n=]+(?=[,)])/g, '$1$2');
  s = s.replace(/\)\s*:\s*[A-Za-z0-9_<>[\]\|\\& ,\."'`$\n{]+\s*\{/g, ') {');
  s = s.replace(/\b([A-Za-z_$][\w$]*)<[^<>()\n]{1,80}>\(/g, '$1(');
  return s;
}
