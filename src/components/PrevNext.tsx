import { Link } from 'wouter';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { getNeighbors, unitPath, type FlatUnit } from '@/lib/curriculum';

/**
 * Reusable prev/next navigation. Driven entirely by the centralized
 * curriculum registry — no per-page handcrafted relations.
 *
 * In RTL UI the visual order is:
 *   [السابق (←)] ........ [التالي (→)]
 * but the user's reading direction is right→left, so the "next"
 * arrow appears on the LEFT (start of reading flow) and the "prev"
 * arrow appears on the RIGHT (end of reading flow).
 */
export function PrevNext({ unitId }: { unitId: string }) {
  const { prev, next } = getNeighbors(unitId);

  return (
    <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 no-print" dir="rtl">
      {/* التالي (Next) appears on the LEFT in RTL — start of reading */}
      {next ? <NextItem unit={next} /> : <div className="hidden sm:block" />}

      {/* السابق (Prev) appears on the RIGHT in RTL — end of reading */}
      {prev ? <PrevItem unit={prev} /> : <div className="hidden sm:block" />}
    </div>
  );
}

function NextItem({ unit }: { unit: FlatUnit }) {
  // Visual right-pointing arrow. In RTL layout, this element is at the
  // START (left side of the visual row), pointing the user forward.
  return (
    <Link
      href={unitPath(unit)}
      className="group flex items-center gap-3 w-full sm:w-auto px-4 py-3 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors" aria-hidden="true">
        <ArrowRight className="w-4 h-4" />
      </div>
      <div className="flex flex-col items-start min-w-0 text-right">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">التالي</span>
        <span className="font-bold truncate max-w-[60ch]">{unit.title}</span>
        <span className="text-xs text-muted-foreground">المرحلة {unit.stageNumber}</span>
      </div>
    </Link>
  );
}

function PrevItem({ unit }: { unit: FlatUnit }) {
  return (
    <Link
      href={unitPath(unit)}
      className="group flex items-center gap-3 w-full sm:w-auto px-4 py-3 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors"
      dir="rtl"
    >
      <div className="flex flex-col items-end min-w-0 text-right order-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">السابق</span>
        <span className="font-bold truncate max-w-[60ch]">{unit.title}</span>
        <span className="text-xs text-muted-foreground">المرحلة {unit.stageNumber}</span>
      </div>
      <div className="w-10 h-10 rounded-full bg-muted text-foreground flex items-center justify-center shrink-0 group-hover:bg-foreground group-hover:text-background transition-colors order-1" aria-hidden="true">
        <ArrowLeft className="w-4 h-4" />
      </div>
    </Link>
  );
}
