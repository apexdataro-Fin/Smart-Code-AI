import { useState } from 'react';
import { File as FileIcon, FilePlus2, Trash2, Edit3, Check, X } from 'lucide-react';
import type { LabFile } from '@/lib/lab/types';

interface FileExplorerProps {
  files: LabFile[];
  activeId: string;
  onActivate: (fileId: string) => void;
  onAdd: () => void;
  onRename: (fileId: string, newName: string) => void;
  onDelete: (fileId: string) => void;
}

/**
 * Vertical file explorer for project mode. Each row shows the file name
 * with an inline rename button (pencil). Delete only enabled when there
 * is more than one file. Pure UI: every action is delegated to the
 * parent — this component never touches localStorage directly.
 */
export function FileExplorer({ files, activeId, onActivate, onAdd, onRename, onDelete }: FileExplorerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  const startEdit = (f: LabFile) => {
    setEditingId(f.id);
    setTempName(f.name);
  };
  const commitEdit = () => {
    if (editingId && tempName.trim()) onRename(editingId, tempName.trim());
    setEditingId(null);
    setTempName('');
  };
  const cancelEdit = () => {
    setEditingId(null);
    setTempName('');
  };

  return (
    <div className="h-full flex flex-col bg-muted/30 border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/60">
        <div className="text-xs font-bold text-muted-foreground">الملفات</div>
        <button
          onClick={onAdd}
          className="p-1 rounded hover:bg-accent text-muted-foreground"
          title="ملف جديد"
          aria-label="ملف جديد"
        >
          <FilePlus2 className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-auto py-1">
        {files.map((f) => {
          const active = f.id === activeId;
          const editing = editingId === f.id;
          return (
            <div
              key={f.id}
              onClick={() => !editing && onActivate(f.id)}
              className={`group flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer ${
                active ? 'bg-primary/10 text-primary' : 'hover:bg-accent/40 text-foreground/80'
              }`}
            >
              <FileIcon className="w-3.5 h-3.5 shrink-0" />
              {editing ? (
                <input
                  dir="ltr"
                  autoFocus
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEdit();
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 min-w-0 px-1 py-0.5 rounded border border-border bg-background text-xs font-mono"
                />
              ) : (
                <span dir="ltr" className="flex-1 min-w-0 font-mono truncate">{f.name}</span>
              )}
              <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100">
                {editing ? (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); commitEdit(); }} className="text-emerald-500"><Check className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); cancelEdit(); }} className="text-red-500"><X className="w-3.5 h-3.5" /></button>
                  </>
                ) : (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); startEdit(f); }} className="hover:text-primary"><Edit3 className="w-3.5 h-3.5" /></button>
                    {files.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`حذف ${f.name}؟`)) onDelete(f.id);
                        }}
                        className="hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
