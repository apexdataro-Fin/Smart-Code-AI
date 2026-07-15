import { useState } from 'react';
import { FilePlus, Copy, Trash2, Pencil, Check, X, FolderOpen } from 'lucide-react';
import type { LabFile } from '@/lib/lab/types';
import { getLanguageDisplay } from '@/lib/lab/languages';
import { cn } from '@/lib/utils';

/**
 * MobileFilesSheet — File explorer as a bottom sheet on phones.
 *
 * Differs from desktop FileExplorer:
 *   - Per-row action menu (rename / delete / duplicate) instead of
 *     inline edit.
 *   - "Add file" is a dedicated button at the bottom.
 *   - Swipe-to-delete friendly via a confirm modal.
 *   - Tap to switch the active file.
 */

interface MobileFilesSheetProps {
  files: LabFile[];
  activeId: string;
  onActivate: (fileId: string) => void;
  onAdd: () => void;
  onRename: (fileId: string, newName: string) => void;
  onDelete: (fileId: string) => void;
  onDuplicate: (fileId: string) => void;
}

export function MobileFilesSheet({
  files, activeId, onActivate, onAdd, onRename, onDelete, onDuplicate,
}: MobileFilesSheetProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  return (
    <div dir="rtl" className="mobile-files-sheet">
      <div className="hidden" aria-hidden="true"><FolderOpen /></div>
      <p className="text-xs text-muted-foreground px-1 pb-2">
        اضغط اسمًا لتفعيله، أو استخدم الأزرار لكل صف.
      </p>
      <ul className="mobile-files-list">
        {files.map((f) => {
          const active = f.id === activeId;
          const isRenaming = renamingId === f.id;
          return (
            <li
              key={f.id}
              className={cn('mobile-files-row', active && 'mobile-files-row-active')}
              data-file-id={f.id}
            >
              <button
                type="button"
                className="mobile-files-row-main"
                onClick={() => { if (!isRenaming) onActivate(f.id); }}
                aria-pressed={active}
              >
                <span className="mobile-files-row-glyph">{glyphForFile(f)}</span>
                {isRenaming ? (
                  <input
                    autoFocus
                    className="mobile-files-rename-input"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { onRename(f.id, renameValue); setRenamingId(null); }
                      if (e.key === 'Escape') setRenamingId(null);
                    }}
                  />
                ) : (
                  <div className="text-right min-w-0">
                    <div className="font-bold truncate">{f.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {getLanguageDisplay(f.language)}
                      {f.readOnly ? ' · للقراءة فقط' : ''}
                    </div>
                  </div>
                )}
              </button>
              {isRenaming ? (
                <div className="mobile-files-actions">
                  <button
                    type="button"
                    onClick={() => onRename(f.id, renameValue)}
                    className="mobile-files-icon-btn mobile-files-icon-confirm"
                    aria-label="تأكيد إعادة التسمية"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenamingId(null)}
                    className="mobile-files-icon-btn"
                    aria-label="إلغاء"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="mobile-files-actions">
                  <button
                    type="button"
                    onClick={() => { setRenameValue(f.name); setRenamingId(f.id); }}
                    className="mobile-files-icon-btn"
                    aria-label="إعادة تسمية"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicate(f.id)}
                    className="mobile-files-icon-btn"
                    aria-label="تكرار"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(f.id)}
                    className="mobile-files-icon-btn mobile-files-icon-danger"
                    aria-label="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40" onClick={() => setConfirmDelete(null)}>
          <div className="bg-card rounded-lg p-5 w-80 max-w-[92vw] shadow-lg text-right" dir="rtl" onClick={(e) => e.stopPropagation()}>
            <h4 className="font-bold text-base mb-2">حذف الملف؟</h4>
            <p className="text-sm text-muted-foreground mb-4">
              سيتم حذف الملف نهائيًا من المشروع.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded text-sm font-bold bg-muted hover:bg-muted/80"
                onClick={() => setConfirmDelete(null)}
              >
                إلغاء
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded text-sm font-bold bg-destructive text-destructive-foreground"
                onClick={() => { onDelete(confirmDelete); setConfirmDelete(null); }}
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onAdd}
        className="mobile-files-add-btn"
      >
        <FilePlus className="w-4 h-4 ml-2 inline-block" />
        ملف جديد
      </button>
    </div>
  );
}

function glyphForFile(f: LabFile) {
  if (f.language === 'python') return '🐍';
  if (f.language === 'javascript') return '🟨';
  if (f.language === 'typescript') return '🔵';
  if (f.language === 'html') return '🌐';
  if (f.language === 'css') return '🎨';
  if (f.language === 'json') return '📄';
  if (f.language === 'markdown') return '📝';
  if (f.language === 'shell') return '🐚';
  return '📄';
}
