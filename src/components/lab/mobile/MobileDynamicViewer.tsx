import { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Trash2, Check, AlertCircle, ChevronRight } from 'lucide-react';
import type { LabFile, RunError, RunMessage, LanguageId } from '@/lib/lab/types';
import { cn } from '@/lib/utils';
import { MobilePreviewFrame } from './MobilePreviewFrame';

/**
 * MobileDynamicViewer — single, language-aware viewer that replaces the
 * old MobileConsoleSheet / MobileOutputSheet / MobileErrorsSheet trio.
 *
 *   - For HTML/CSS: full immersive preview, no sub-tabs.
 *   - For Python/JS/TS/JSON/MD/Shell: a thin sub-tab strip at the top
 *     toggling Console ↔ Output inside the same viewer area.
 *   - When errors present: errors REPLACE the viewer body (per spec).
 *     A small Dismiss X clears errors locally.
 *   - Auto-scroll on new messages; user can scroll back up to pause.
 *
 * Output targeted at phones: large font, monospace where useful, copy
 * buttons, easy-to-tap rows.
 */

export type ViewerMode = 'console' | 'output';

interface MobileDynamicViewerProps {
  activeFile: LabFile | null;
  language: LanguageId;
  messages: RunMessage[];
  outputText: string;
  errors: RunError[];
  /** HTML for Preview tab. Empty string = no preview. */
  previewHtml: string;
  /** Clear console messages. */
  onClearMessages: () => void;
  /** Clear all errors locally (called from X button). */
  onClearErrors: () => void;
}

export function MobileDynamicViewer({
  activeFile, language, messages, outputText, errors,
  previewHtml, onClearMessages, onClearErrors,
}: MobileDynamicViewerProps) {
  const showPreview = !!previewHtml;
  const hasMessages = messages.length > 0;
  const hasOutput = !!outputText;
  const hasErrors = errors.length > 0;

  // Errors win over everything per the spec.
  if (hasErrors) {
    return (
      <div className="mobile-viewer mobile-viewer-errors" dir="ltr">
        <div className="mobile-viewer-head" dir="rtl">
          <button
            type="button"
            className="mobile-viewer-x"
            onClick={onClearErrors}
            aria-label="إغلاق الأخطاء"
            title="إغلاق الأخطاء"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="mobile-viewer-title">
            <AlertCircle className="w-4 h-4 text-rose-500 inline-block ml-1" />
            {errors.length} {errors.length === 1 ? 'خطأ' : 'أخطاء'}
          </span>
        </div>
        <ErrorsList errors={errors} />
      </div>
    );
  }

  // HTML/CSS: immersive preview.
  if (showPreview) {
    return (
      <div className="mobile-viewer mobile-viewer-preview">
        <MobilePreviewFrame html={previewHtml} />
      </div>
    );
  }

  // Python/JS/TS/JSON/MD/Shell: console + output sub-tabs.
  const [mode, setMode] = useState<ViewerMode>(hasMessages ? 'console' : 'output');
  // Switch back to a tab that has content if current becomes empty.
  useEffect(() => {
    if (mode === 'console' && !hasMessages && hasOutput) setMode('output');
    if (mode === 'output' && !hasOutput && hasMessages) setMode('console');
  }, [mode, hasMessages, hasOutput]);

  return (
    <div className="mobile-viewer mobile-viewer-runtime" dir="ltr">
      <div className="mobile-viewer-subtabs" dir="rtl">
        <SubTab id="console" active={mode === 'console'} count={messages.length} onClick={() => setMode('console')}>
          Console
        </SubTab>
        <SubTab id="output" active={mode === 'output'} count={outputText.length || 0} onClick={() => setMode('output')}>
          Output
        </SubTab>
        <span className="mobile-viewer-filename">{activeFile?.name ?? language}</span>
      </div>
      {mode === 'console'
        ? <ConsoleBody messages={messages} onClear={onClearMessages} />
        : <OutputBody text={outputText} />}
    </div>
  );
}

/* ---------- sub-components ---------- */

function SubTab({ id, active, count, onClick, children }: {
  id: string; active: boolean; count: number; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      data-viewer-subtab={id}
      onClick={onClick}
      className={cn('mobile-viewer-subtab', active && 'mobile-viewer-subtab-active')}
    >
      <span>{children}</span>
      {count > 0 && <span className="ml-1 opacity-60 text-[10px]">·{count}</span>}
    </button>
  );
}

function ConsoleBody({ messages, onClear }: { messages: RunMessage[]; onClear: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef<boolean>(true);
  const [copied, setCopied] = useState(false);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    stickToBottom.current = (el.scrollHeight - el.scrollTop - el.clientHeight) < 32;
  };

  useEffect(() => {
    if (!ref.current || !stickToBottom.current) return;
    ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages]);

  const handleCopy = async () => {
    const text = messages.map((m) => `[${new Date(m.ts).toLocaleTimeString()}] ${m.text}`).join('\n');
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement('textarea'); ta.value = text;
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <>
      <div className="mobile-viewer-toolbar" dir="rtl">
        <span className="text-[11px] text-muted-foreground">{messages.length} رسالة</span>
        <div className="flex items-center gap-1">
          <button type="button" className="mobile-tool-btn" onClick={handleCopy} aria-label="نسخ">
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
          {messages.length > 0 && (
            <button type="button" className="mobile-tool-btn" onClick={onClear} aria-label="مسح">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div ref={ref} className="mobile-viewer-body" onScroll={onScroll}>
        {messages.length === 0 && (
          <div className="grid place-items-center h-full text-sm text-muted-foreground p-4 text-center">
            لا يوجد خرج بعد. اضغط ▶ تشغيل لرؤية النتائج هنا.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn('mobile-viewer-line', levelClass(m.level))}>
            <span className="mobile-viewer-time">[{new Date(m.ts).toLocaleTimeString()}]</span>
            <span className="mobile-viewer-text">{m.text}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function OutputBody({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.scrollTop = ref.current.scrollHeight;
  }, [text]);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(text ?? ''); }
    catch {
      const ta = document.createElement('textarea'); ta.value = text ?? '';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <>
      <div className="mobile-viewer-toolbar" dir="rtl">
        <span className="text-[11px] text-muted-foreground">Output — {text.length} حرف</span>
        <button type="button" className="mobile-tool-btn" onClick={handleCopy} aria-label="نسخ">
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div ref={ref} className="mobile-viewer-body mobile-viewer-body-mono">
        {!text && (
          <div className="grid place-items-center h-full text-sm text-muted-foreground p-4 text-center">
            لم يبدأ التشغيل بعد.
          </div>
        )}
        {text && <pre className="mobile-viewer-pre">{text}</pre>}
      </div>
    </>
  );
}

function ErrorsList({ errors }: { errors: RunError[] }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    const text = errors.map((e) => formatError(e)).join('\n\n');
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement('textarea'); ta.value = text;
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <>
      <div className="mobile-viewer-toolbar" dir="rtl">
        <span className="text-[11px] text-rose-500 font-bold">فشل التشغيل</span>
        <button type="button" className="mobile-tool-btn" onClick={handleCopy} aria-label="نسخ الخطأ">
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="mobile-viewer-body mobile-errors-list" dir="rtl">
        {errors.map((e, i) => (
          <article key={i} className="mobile-error-card">
            <header className="flex items-center gap-2">
              <span className="text-rose-500 font-mono text-sm">⛔</span>
              <span className="font-bold text-rose-500 truncate flex-1">{e.message}</span>
            </header>
            {(e.line || e.column) && (
              <p className="text-xs text-muted-foreground mt-1">
                {e.line ? `السطر ${e.line}` : ''}{e.line && e.column ? ' · ' : ''}{e.column ? `العمود ${e.column}` : ''}
              </p>
            )}
            {e.hint && (
              <p className="mt-2 text-sm bg-amber-100/40 dark:bg-amber-500/10 text-amber-900 dark:text-amber-200 rounded p-2 border border-amber-500/30">
                💡 {e.hint}
              </p>
            )}
            {e.stack && (
              <details className="mt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer">عرض المكدّس الكامل</summary>
                <pre className="text-[11px] mt-1 whitespace-pre-wrap break-all text-foreground/80" dir="ltr">{e.stack}</pre>
              </details>
            )}
          </article>
        ))}
      </div>
    </>
  );
}

function formatError(e: RunError): string {
  let out = `[ERROR] ${e.message}`;
  if (e.line || e.column) out += ` @ line ${e.line ?? '?'}:${e.column ?? '?'}`;
  if (e.hint) out += `\nHINT: ${e.hint}`;
  if (e.stack) out += `\n${e.stack}`;
  return out;
}

function levelClass(level: RunMessage['level']): string {
  if (level === 'error') return 'mobile-viewer-line-err';
  if (level === 'warn') return 'mobile-viewer-line-warn';
  if (level === 'system') return 'mobile-viewer-line-system';
  if (level === 'result') return 'mobile-viewer-line-result';
  return 'mobile-viewer-line-log';
}
