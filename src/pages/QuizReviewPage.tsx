import { Link } from 'wouter';
import { Shell } from '@/components/Shell';
import { useQuizStats, incorrectQuestions } from '@/lib/quiz';
import { RotateCcw, CheckCircle2 } from 'lucide-react';

/**
 * Quiz Review page. Surfaces active-recall questions whose answer
 * the learner has marked "incorrect" more often than "correct".
 * The data comes strictly from existing curriculum content — no
 * invented questions.
 *
 * If the learner has no incorrect answers yet, render an empty
 * state and explain the model.
 */
export default function QuizReviewPage() {
  const [stats] = useQuizStats();
  const items = incorrectQuestions(50, stats);
  const seenCount = Object.values(stats.byQuestion).filter((s) => s.seen > 0).length;

  return (
    <Shell>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <header className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-xs font-bold mb-3">
            <RotateCcw className="w-3.5 h-3.5" />
            المراجعة بعد الاختبار
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2">الأسئلة التي تحتاج إلى مراجعة</h1>
          <p className="text-muted-foreground">
            هذه هي أسئلة المراجعة النشطة التي أجبت عنها بشكل غير صحيح في الوحدات التعليمية.
            اضغط على الوحدة لإعادة المحاولة.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            عدد الأسئلة التي تفاعلت معها: {seenCount}
          </p>
        </header>

        {items.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-10 text-center text-muted-foreground">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-500" aria-hidden="true" />
            <p className="text-lg mb-2">لا توجد أسئلة للمراجعة الآن.</p>
            <p className="text-sm">
              أثناء قراءتك للوحدات، افتح قسم "المراجعة النشطة" وأجب بصدق. ستظهر الأسئلة التي تخطئ فيها هنا تلقائياً.
            </p>
          </div>
        ) : (
          <ol className="space-y-4" dir="rtl">
            {items.map((q) => (
              <li key={q.id} className="border border-border bg-card rounded-xl p-4">
                <p className="font-semibold text-sm mb-2 leading-relaxed">{q.q}</p>
                <details className="text-sm text-muted-foreground mb-3">
                  <summary className="cursor-pointer select-none">أظهر الإجابة</summary>
                  <p className="mt-2 whitespace-pre-wrap">{q.a}</p>
                </details>
                <Link
                  href={q.path}
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  ↳ افتح الوحدة: {q.unitTitle} (المرحلة {q.stageNumber})
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Shell>
  );
}
