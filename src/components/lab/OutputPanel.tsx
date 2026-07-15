interface OutputPanelProps {
  text: string;
  /** Optional title shown above the output. */
  title?: string;
}

/**
 * Generic "Output" panel — currently used to render raw text outputs such
 * as expected stdout when previewing a script with a `console.log`.
 *
 * Future use: any adapter that produces plaintext output beyond the
 * console (e.g. SQL query results, JSON diff previews) can pipe its
 * output through this panel.
 */
export function OutputPanel({ text, title }: OutputPanelProps) {
  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      {title && (
        <div className="px-3 py-2 border-b border-border bg-muted/50 text-xs font-bold text-muted-foreground">
          {title}
        </div>
      )}
      <pre
        dir="ltr"
        className="flex-1 overflow-auto px-3 py-2 font-mono text-[13px] whitespace-pre-wrap break-words"
      >{text || '— لا يوجد خرج نصّي بعد. —'}</pre>
    </div>
  );
}
