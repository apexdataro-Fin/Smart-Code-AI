import { Link, useLocation } from 'wouter';
import { breadcrumbsForUnit } from '@/lib/curriculum';
import { ChevronLeft } from 'lucide-react';

/**
 * Semantic breadcrumbs for the current unit page. Built strictly from
 * the centralized curriculum metadata; never manually authored per page.
 *
 * Visual order in RTL: المرحلة → الوحدة → العنوان (right-to-left).
 */
export function Breadcrumbs({ unitId }: { unitId: string }) {
  const crumbs = breadcrumbsForUnit(unitId);
  const [location] = useLocation();

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="مسار التنقل" className="mb-6 no-print">
      <ol
        className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
        dir="rtl"
      >
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          const isCurrentPath = location === c.href && c.isCurrent;
          return (
            <li key={`${c.href}-${i}`} className="flex items-center gap-1">
              {!isLast ? (
                <Link
                  href={c.href}
                  className="hover:text-primary transition-colors underline-offset-4 hover:underline"
                  aria-current={isCurrentPath ? 'page' : undefined}
                >
                  {c.label}
                </Link>
              ) : (
                <span className="text-foreground font-bold" aria-current="page">
                  {c.label}
                </span>
              )}
              {!isLast && (
                <ChevronLeft
                  className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
