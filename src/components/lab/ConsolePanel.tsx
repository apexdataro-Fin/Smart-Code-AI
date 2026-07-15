import { useEffect, useRef, useState } from 'react';
import { Trash2, Copy, Check } from 'lucide-react';
import type { RunMessage } from '@/lib/lab/types';

interface ConsolePanelProps {
  messages: RunMessage[];
  onClear: () => void;
}

/**
 * Console panel. Renders console.log/info/warn/error/result/system
 * streams from the execution engine. Each entry is timestamped with a
 * friendly short format. Auto-scrolls to the latest entry unless the
 * user has scrolled up.
 *
 * Has copy-all and clear buttons. Touch-friendly on mobile.
 */
export function ConsolePanel({ messages, onClear }: ConsolePanelProps) {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  useEffect(() => {
    if (!ref.current || !stickToBottom.current) return;
    ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages]);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const fromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottom.current = fromBottom < 80;
  };

  const handleCopy = async () => {
    const text = messages
      .map((m) => `${formatTs(m.ts)} ${m.level.toUpperCase()} ${m.text}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(text || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* */ }
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-muted/50">
        <div className="text-xs font-bold text-muted-foreground">Console</div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-accent"
            title="نسخ كل المخرجات"
            aria-label="نسخ كل المخرجات"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={onClear}
            className="p-1.5 rounded hover:bg-accent"
            title="مسح الكونسول"
            aria-label="مسح الكونسول"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div
        ref={ref}
        onScroll={onScroll}
        className="flex-1 overflow-auto px-3 py-2 font-mono text-[13px] leading-relaxed"
        dir="ltr"
      >
        {messages.length === 0 && (
          <div className="text-muted-foreground text-center mt-6">— لا توجد رسائل بعد. اضغط تشغيل. —</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${levelClass(m.level)}`}>
            <span className="shrink-0 text-muted-foreground">[{formatTs(m.ts)}]</span>
            <span className="shrink-0 font-bold uppercase text-[10px] tracking-wider mt-1">{levelLabel(m.level)}</span>
            <pre className="whitespace-pre-wrap break-words m-0 flex-1">{m.text}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

function levelClass(l: RunMessage['level']): string {
  switch (l) {
    case 'error': return 'text-red-500';
    case 'warn': return 'text-amber-500';
    case 'result': return 'text-emerald-500';
    case 'info': return 'text-sky-500';
    case 'system': return 'text-muted-foreground italic';
    default: return 'text-foreground';
  }
}

function levelLabel(l: RunMessage['level']): string {
  switch (l) {
    case 'error': return 'ERR';
    case 'warn': return 'WARN';
    case 'result': return 'OK';
    case 'info': return 'INFO';
    case 'system': return 'SYS';
    default: return 'LOG';
  }
}

function formatTs(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${hh}:${mm}:${ss}.${ms}`;
}
