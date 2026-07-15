import { X, Plus } from 'lucide-react';
import type { LabFile } from '@/lib/lab/types';

interface FileTabsProps {
  files: LabFile[];
  activeId: string;
  onActivate: (fileId: string) => void;
  onClose: (fileId: string) => void;
  onAdd: () => void;
}

/**
 * Horizontal row of open file tabs. RTL-safe (visual order follows
 * document direction). Supports:
 *  - click to activate
 *  - middle-click / X button to close (never the last remaining file)
 *  - + button to add a new file
 *
 * The `+` button asks the parent for a new file via `onAdd`; the parent
 * decides which name/language to use.
 */
export function FileTabs({ files, activeId, onActivate, onClose, onAdd }: FileTabsProps) {
  return (
    <div
      className="flex items-center bg-muted/40 border-b border-border overflow-x-auto"
      role="tablist"
      aria-label="ملفات مفتوحة"
    >
      {files.map((f) => {
        const active = f.id === activeId;
        return (
          <div
            key={f.id}
            role="tab"
            aria-selected={active}
            onClick={() => onActivate(f.id)}
            className={`group flex items-center gap-2 px-3 py-1.5 border-l border-border first:border-l-0 cursor-pointer whitespace-nowrap text-sm ${
              active ? 'bg-background text-foreground' : 'text-muted-foreground hover:bg-background/60'
            }`}
          >
            <span className="font-mono">{f.name}</span>
            {f.readOnly && <span className="text-[9px] uppercase text-amber-500">اقرأ</span>}
            {files.length > 1 && (
              <button
                role="button"
                aria-label={`إغلاق ${f.name}`}
                onClick={(e) => { e.stopPropagation(); onClose(f.id); }}
                className="text-muted-foreground hover:text-red-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
      <button
        role="button"
        aria-label="ملف جديد"
        onClick={onAdd}
        className="flex items-center gap-1 px-3 py-1.5 text-muted-foreground hover:text-foreground whitespace-nowrap text-sm"
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="text-xs">جديد</span>
      </button>
    </div>
  );
}
