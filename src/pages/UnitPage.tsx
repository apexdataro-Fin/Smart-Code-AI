import { Shell } from '@/components/Shell';
import { Link } from 'wouter';
import { getUnit } from '@/data/book';
import { ContentRenderer } from '@/components/Renderer';
import { CheckCircle } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { PrevNext } from '@/components/PrevNext';
import {
  broadcastProgressChange,
  isUnitCompleted,
  markUnitCompleted,
  recordRoute,
  unmarkUnitCompleted,
  useProgress,
} from '@/lib/progress';
import { overallProgress, totalUnitCount } from '@/lib/curriculum';

export default function UnitPage({
  params,
}: {
  params: { stageId: string; unitId: string };
}) {
  const unit = getUnit(params.stageId, params.unitId);
  const [progress, refresh] = useProgress();

  useEffect(() => {
    if (!unit) return;
    // Record this as the user's last learning route, so /Cover's
    // "Continue learning" CTA can resume them here later.
    recordRoute(`/stage/${unit.stageId}/unit/${unit.id}`);
    window.scrollTo(0, 0);
  }, [unit]);

  const isCompleted = !!unit && isUnitCompleted(unit.id, progress);

  const toggleComplete = () => {
    if (!unit) return;
    if (isCompleted) {
      unmarkUnitCompleted(unit.id);
    } else {
      markUnitCompleted(unit.id);
    }
    broadcastProgressChange();
    refresh();
  };

  if (!unit) {
    return (
      <Shell>
        <div className="p-12 text-center text-muted-foreground">
          <h2 className="text-2xl font-bold mb-2 text-foreground">
            عفواً، هذه الوحدة غير موجودة.
          </h2>
          <Link href="/toc" className="text-primary hover:underline">
            العودة للفهرس
          </Link>
        </div>
      </Shell>
    );
  }

  const overall = overallProgress(new Set(Object.keys(progress.completed)));
  const total = totalUnitCount();

  return (
    <Shell>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 page-break">
        <Breadcrumbs unitId={unit.id} />

        {/* Header */}
        <header className="mb-10 text-center animate-in slide-in-from-bottom-4 duration-500">
          <div className="inline-block px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-bold tracking-wider mb-4 border border-border">
            الوحدة {unit.unitNumber}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4 leading-tight">
            {unit.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {unit.description}
          </p>
        </header>

        {/* Content */}
        <div className="prose dark:prose-invert prose-lg max-w-none text-foreground/90">
          <ContentRenderer nodes={unit.content} />
        </div>

        {/* Completion */}
        <div className="mt-16 p-6 bg-card border border-border rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 no-print shadow-sm">
          <div>
            <h3 className="font-bold text-lg mb-1">هل أتممت هذه الوحدة بنجاح؟</h3>
            <p className="text-sm text-muted-foreground">
              اضغط لتعليم الوحدة كمكتملة وتحديث شريط تقدمك.
              <span className="block mt-1 text-xs">
                إجمالاً: {overall.done} / {total} وحدة ({overall.percent}%)
              </span>
            </p>
          </div>
          <Button
            size="lg"
            variant={isCompleted ? 'default' : 'outline'}
            className={`gap-2 min-w-[200px] ${
              isCompleted ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' : ''
            }`}
            onClick={toggleComplete}
          >
            <CheckCircle className={`w-5 h-5 ${isCompleted ? 'opacity-100' : 'opacity-50'}`} />
            {isCompleted ? 'مكتملة ✓' : 'تحديد كمكتملة'}
          </Button>
        </div>

        {/* Prev / Next Navigation */}
        <PrevNext unitId={unit.id} />

      </div>
    </Shell>
  );
}
