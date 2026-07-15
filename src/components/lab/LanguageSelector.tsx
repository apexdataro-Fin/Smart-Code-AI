import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { LanguageId } from '@/lib/lab/types';
import { getAllAdapters, getLanguageMeta } from '@/lib/lab/registry';
import { cn } from '@/lib/utils';

/**
 * LanguageSelector — top-of-editor control that lets the user pick any
 * registered language. The selector is exclusively data-driven: it reads
 * `getAllAdapters()` and renders one chip per language with the icon,
 * display name, and disabled hint derived from `adapter.meta`.
 *
 * Changing the language triggers `onChange(lang)` in the parent, which
 * delegates to `projectManager.switchActiveFileLanguage(project, lang)`
 * — that helper renames the active file, sets its language, and
 * replaces its content with the adapter's `defaultCode`. Other files
 * are untouched.
 *
 * On mobile: collapses into a native `<select>` for the same data.
 */

interface LanguageSelectorProps {
  current: LanguageId;
  onChange: (lang: LanguageId) => void;
  /** When true, shows the description hint (used in workspace pages). */
  showHint?: boolean;
}

export function LanguageSelector({ current, onChange, showHint }: LanguageSelectorProps) {
  const [pending, setPending] = useState<LanguageId | null>(null);
  const meta = getLanguageMeta(current);
  const adapters = getAllAdapters();

  const request = (lang: LanguageId) => {
    if (lang === current) return;
    const ok = window.confirm?.(
      'سيتم استبدال محتوى الملف الحالي بقالب اللغة الجديدة. هل تريد المتابعة؟',
    );
    if (ok === false) return; // user cancelled
    setPending(lang);
    onChange(lang);
  };

  return (
    <div className="lab-langstrip" dir="ltr" aria-label="محرّك اللغة">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30 overflow-x-auto">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold shrink-0">
          اللغة
        </span>
        <div className="flex items-center gap-1.5">
          {adapters.map((a) => {
            const isActive = a.meta.id === current;
            const isPending = a.meta.id === pending;
            return (
              <button
                key={a.meta.id}
                type="button"
                onClick={() => request(a.meta.id)}
                disabled={isActive}
                className={cn(
                  'lang-chip',
                  isActive && 'lang-chip-active',
                  isPending && 'lang-chip-pending',
                )}
                title={a.meta.description}
                aria-pressed={isActive}
                data-lang={a.meta.id}
              >
                <span className="lang-glyph" aria-hidden="true">{a.meta.glyph}</span>
                <span className="lang-name">{a.meta.displayName}</span>
              </button>
            );
          })}
        </div>
        {/* Compact mobile dropdown — same data, alternative affordance. */}
        <select
          className="lang-select md:hidden"
          value={current}
          onChange={(e) => request(e.target.value as LanguageId)}
          aria-label="اختيار اللغة"
        >
          {adapters.map((a) => (
            <option key={a.meta.id} value={a.meta.id}>
              {a.meta.displayName}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" aria-hidden="true" />
      </div>
      {showHint && (
        <p className="text-[11px] text-muted-foreground px-3 py-1.5 border-b border-border bg-background">
          {meta.description}
        </p>
      )}
    </div>
  );
}
