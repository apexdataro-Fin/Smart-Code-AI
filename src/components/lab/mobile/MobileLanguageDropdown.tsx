import { useState } from 'react';
import { Check, ChevronDown, Sparkles } from 'lucide-react';
import type { LanguageId } from '@/lib/lab/types';
import { getAllAdapters, getLanguageMeta } from '@/lib/lab/registry';
import { MobileBottomSheet } from './MobileBottomSheet';
import { cn } from '@/lib/utils';

/**
 * MobileLanguageDropdown — replaces the desktop LanguageSelector strip
 * with a one-tap compact picker.
 *
 * The picker opens a 60vh bottom sheet listing every registered language
 * with its glyph, display name, and description. One tap = select and
 * confirm — no extra confirm dialog (mobile confirm dialogs are awful).
 *
 * The trigger button sits inside the editor header.
 */

interface MobileLanguageDropdownProps {
  current: LanguageId;
  onChange: (lang: LanguageId) => void;
}

export function MobileLanguageDropdown({ current, onChange }: MobileLanguageDropdownProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<LanguageId | null>(null);
  const meta = getLanguageMeta(current);

  const request = (lang: LanguageId) => {
    if (lang === current) { setOpen(false); return; }
    setPending(lang);
  };

  const confirm = () => {
    if (pending && pending !== current) {
      onChange(pending);
    }
    setPending(null);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mobile-lang-trigger"
        aria-label={`اختيار اللغة — ${meta.displayName}`}
        aria-haspopup="dialog"
      >
        <span className="mobile-lang-glyph">{meta.glyph}</span>
        <span className="mobile-lang-name">{meta.displayName}</span>
        <ChevronDown className="w-4 h-4 opacity-70" />
      </button>

      <MobileBottomSheet
        open={open}
        onOpenChange={(o) => { if (!o) { setPending(null); setOpen(false); } }}
        title={pending ? 'تأكيد تبديل اللغة' : 'اختيار اللغة'}
        sheetClassName={pending ? 'h-[40vh]' : 'h-[60vh]'}
      >
        {!pending ? (
          <div className="mobile-lang-list" dir="ltr">
            {getAllAdapters().map((a) => {
              const active = a.meta.id === current;
              return (
                <button
                  key={a.meta.id}
                  type="button"
                  className={cn('mobile-lang-row', active && 'mobile-lang-row-active')}
                  onClick={() => request(a.meta.id)}
                  disabled={active}
                >
                  <span className="mobile-lang-glyph-lg">{a.meta.glyph}</span>
                  <div className="mobile-lang-info" dir="rtl">
                    <div className="font-bold">{a.meta.displayName}</div>
                    <div className="text-xs text-muted-foreground truncate text-right">{a.meta.description}</div>
                  </div>
                  {active && <Check className="w-4 h-4 text-emerald-500" />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="px-4 py-4 text-right" dir="rtl">
            <p className="text-sm text-muted-foreground">
              سيتم استبدال محتوى الملف الحالي بقالب اللغة الجديدة. هل تريد المتابعة؟
            </p>
            <div className="mt-4 flex items-center gap-2 justify-end">
              <button
                type="button"
                className="px-4 py-2 rounded text-sm font-bold bg-muted hover:bg-muted/80"
                onClick={() => setPending(null)}
              >
                إلغاء
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded text-sm font-bold bg-primary text-primary-foreground"
                onClick={confirm}
              >
                <Sparkles className="w-4 h-4 ml-1 inline-block" />
                متابعة
              </button>
            </div>
          </div>
        )}
      </MobileBottomSheet>
    </>
  );
}
