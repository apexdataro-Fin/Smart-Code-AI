import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Shell } from '@/components/Shell';
import { SearchBar } from '@/components/SearchBar';
import { search, type SearchHit } from '@/lib/search';
import { Search as SearchIcon } from 'lucide-react';

/**
 * Full-results search page. Reads the query from the URL hash
 * fragment (wouter#hash router:
 *   `/#/search?q=Big%20O`),
 * runs the same in-memory search index the header SearchBar uses,
 * and displays the result list with stage context.
 */
export default function SearchPage() {
  const [location] = useLocation();
  const [q, setQ] = useState<string>(() => parseQ(location));

  useEffect(() => {
    setQ(parseQ(location));
  }, [location]);

  const hits: SearchHit[] = useMemo(() => (q.trim() ? search(q, 50) : []), [q]);

  return (
    <Shell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black mb-2 flex items-center gap-2">
              <SearchIcon className="w-7 h-7 text-primary" aria-hidden="true" />
              البحث في المنهج
            </h1>
            <p className="text-muted-foreground">
              ابحث في عناوين الوحدات، الأقسام، والنصوص التعليمية.
            </p>
          </div>
          <SearchBar />
        </header>

        {q.trim() ? (
          hits.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {hits.length} نتيجة لـ "<bdi dir="ltr">{q}</bdi>"
              </p>
              <ol className="space-y-3" dir="rtl">
                {hits.map((h) => (
                  <li key={`${h.unitId}-${h.matchedField}`}>
                    <Link
                      href={h.path}
                      className="block border border-border bg-card hover:border-primary/40 hover:bg-primary/5 rounded-xl px-4 py-3 transition-colors"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                        <h2 className="font-bold text-lg">{h.unitTitle}</h2>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">
                          المرحلة {h.stageNumber}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        المرحلة: {h.stageTitle} • نوع التطابق: {fieldLabel(h.matchedField)}
                      </p>
                      <p className="text-sm text-foreground/80 line-clamp-3">{h.preview}</p>
                    </Link>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <div className="border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground">
              <p className="text-lg mb-2">لا توجد نتائج</p>
              <p className="text-sm">جرّب كلمات مختلفة أو جزءاً من عنوان وحدة.</p>
            </div>
          )
        ) : (
          <div className="border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground">
            <p className="text-lg mb-2">ابدأ بكتابة استعلامك</p>
            <p className="text-sm">جرّب: <bdi dir="ltr">Docker</bdi>, <bdi dir="ltr">Big O</bdi>, <bdi dir="ltr">TypeScript</bdi>, الخوارزميات، الوراثة</p>
          </div>
        )}
      </div>
    </Shell>
  );
}

function parseQ(loc: string): string {
  // loc looks like "/search?q=foo" or "/search"
  const i = loc.indexOf('?');
  if (i < 0) return '';
  return decodeURIComponent(loc.slice(i + 1) || '').trim();
}

const FIELD_LABELS: Record<SearchHit['matchedField'], string> = {
  title: 'العنوان',
  description: 'الوصف',
  section: 'قسم',
  paragraph: 'فقرة',
};

function fieldLabel(f: SearchHit['matchedField']): string {
  return FIELD_LABELS[f] ?? f;
}
