import type { RunMessage } from '@/lib/lab/types';

interface LogsPanelProps {
  messages: RunMessage[];
}

/**
 * Logs panel — currently shows system-level messages from the execution
 * engine (start/stop, validation, file selection events). Future hooks
 * can pipe debug traces here.
 */
export function LogsPanel({ messages }: LogsPanelProps) {
  if (messages.length === 0) {
    return (
      <div className="h-full grid place-items-center text-muted-foreground text-sm font-mono">
        <span>— لا توجد سجلات بعد. —</span>
      </div>
    );
  }
  return (
    <div dir="ltr" className="h-full overflow-auto p-3 font-mono text-[12px] space-y-1">
      {messages.map((m, i) => (
        <div key={i} className="text-muted-foreground">
          <span className="text-foreground/50">[{new Date(m.ts).toISOString()}]</span>{' '}
          <span className={m.level === 'error' ? 'text-red-500' : m.level === 'warn' ? 'text-amber-500' : 'text-foreground'}>
            {m.text}
          </span>
        </div>
      ))}
    </div>
  );
}
