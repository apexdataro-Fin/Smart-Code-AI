import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Search as SearchIcon, X } from 'lucide-react';
import { search, type SearchHit } from '@/lib/search';

/**
 * Header-mounted search bar with live filtering (debounced) and a
 * dropdown of up to 10 hits. Selecting a result navigates to that
 * unit's route. Pressing Enter with a non-empty query navigates to
 * the full /search results page.
 */
export function SearchBar() {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 120);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function handler(ev: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(ev.target as Node)) setOpen(false);
    }
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, []);

  const hits: SearchHit[] = useMemo(
    () => (debounced ? search(debounced, 10) : []),
    [debounced]
  );

  const submit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const clear = () => {
    setQ('');
    setDebounced('');
  };

  return (
    <div ref={wrapRef} className="relative">
      <form onSubmit={submit} role="search" aria-label="بحث في المنهج">
        <div className="flex items-center gap-2 bg-background/60 border border-border rounded-md px-2 py-1.5 min-w-[180px] focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition">
          <SearchIcon
            className="w-4 h-4 text-muted-foreground shrink-0"
            aria-hidden="true"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="بحث… Docker, Big O"
            className="bg-transparent outline-none text-sm placeholder:text-muted-foreground/70 w-32 sm:w-48"
            aria-label="استعلام البحث"
            dir="ltr"
          />
          {q && (
            <button
              type="button"
              onClick={clear}
              className="text-muted-foreground hover:text-foreground"
              aria-label="مسح الاستعلام"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {open && q && (
        <div className="absolute right-0 mt-2 w-[min(28rem,calc(100vw-2rem))] bg-card border border-border rounded-lg shadow-xl z-40 overflow-hidden">
          {hits.length === 0 && debounced && (
            <div className="p-3 text-sm text-muted-foreground">
              لا نتائج لـ "{debounced}"
            </div>
          )}
          {hits.length > 0 && (
            <ul className="max-h-80 overflow-y-auto divide-y divide-border" dir="rtl">
              {hits.map((h) => (
                <li
                  key={`${h.unitId}#${h.matchedField}`}
                  className="hover:bg-muted/60"
                >
                  <Link
                    href={h.path}
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold truncate">
                        {h.unitTitle}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">
                        المرحلة {h.stageNumber}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {h.preview}
                    </p>
                  </Link>
                </li>
              ))}
              <li className="bg-muted/30">
                <button
                  type="button"
                  onClick={() => submit()}
                  className="w-full text-right px-3 py-2 text-xs font-bold text-primary hover:underline"
                >
                  عرض كل النتائج عن "{q}" ←
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
