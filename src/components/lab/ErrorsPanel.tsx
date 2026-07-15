import { AlertTriangle, ChevronRight, Lightbulb, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { RunError } from '@/lib/lab/types';

interface ErrorsPanelProps {
  errors: RunError[];
}

/**
 * Pretty errors panel. Each error has:
 *   - level (currently always "error")
 *   - the raw message
 *   - optional line + column
 *   - optional stack trace
 *   - optional heuristic hint (from the language adapter or registry hint map)
 */
export function ErrorsPanel({ errors }: ErrorsPanelProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (errors.length === 0) {
    return (
      <div className="h-full grid place-items-center text-emerald-600 text-sm font-mono gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">✅</span>
          <span>— لا توجد أخطاء. —</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-3 space-y-2" dir="ltr">
      {errors.map((e, i) => {
        const open = openIdx === i;
        const copy = (ev: React.MouseEvent) => {
          ev.stopPropagation();
          const text = [
            e.message,
            e.line !== undefined ? `line: ${e.line}` : '',
            e.column !== undefined ? `column: ${e.column}` : '',
            e.stack ?? '',
          ].filter(Boolean).join('\n');
          try { navigator.clipboard?.writeText(text); } catch { /* */ }
          setCopiedIdx(i);
          setTimeout(() => setCopiedIdx(null), 1400);
        };
        return (
          <div
            key={i}
            className="rounded-lg border border-red-300/40 bg-red-50/60 dark:bg-red-950/30 dark:border-red-900/40 overflow-hidden"
          >
            <button
              onClick={() => setOpenIdx(open ? null : i)}
              className="w-full flex items-start gap-2 p-3 text-start"
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 text-red-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm text-red-700 dark:text-red-300 break-words">
                  {e.message}
                </div>
                {(e.line !== undefined || e.column !== undefined) && (
                  <div className="text-[11px] text-red-500/80 font-mono mt-0.5">
                    {e.line !== undefined && <>سطر {e.line}</>}
                    {e.line !== undefined && e.column !== undefined && '، '}
                    {e.column !== undefined && <>عمود {e.column}</>}
                  </div>
                )}
                {e.hint && (
                  <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-300">
                    <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{e.hint}</span>
                  </div>
                )}
              </div>
              <ChevronRight
                className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-90' : ''}`}
              />
            </button>
            <div className="px-3 pb-2 flex items-center gap-2 text-xs">
              <button
                onClick={copy}
                className="px-2 py-1 rounded border border-border hover:bg-accent"
                title="نسخ تفاصيل الخطأ"
              >
                {copiedIdx === i ? (
                  <span className="inline-flex items-center gap-1 text-emerald-500"><Check className="w-3 h-3" /> تم</span>
                ) : (
                  <span className="inline-flex items-center gap-1"><Copy className="w-3 h-3" /> نسخ</span>
                )}
              </button>
            </div>
            {open && e.stack && (
              <pre
                dir="ltr"
                className="px-3 pb-3 text-[11px] font-mono text-muted-foreground whitespace-pre-wrap break-words border-t border-red-200/40 dark:border-red-900/40 pt-2"
              >{e.stack}</pre>
            )}
          </div>
        );
      })}
    </div>
  );
}
