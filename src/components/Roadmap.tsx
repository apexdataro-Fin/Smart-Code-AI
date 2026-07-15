import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { book } from '@/data/book';
import { stageProgress, totalUnitCount, unitPath, type FlatUnit } from '@/lib/curriculum';
import type { ProgressV1 } from '@/lib/progress';

/**
 * Curriculum Roadmap. Visualized as a vertical timeline that shows:
 *   - each phase with its title and description
 *   - the educational progression (briefly summarized)
 *   - per-stage completion (completion count + percent)
 *   - a list of units (with completion checkmarks if `progress` is passed)
 *
 * Driven exclusively by the curriculum registry; no invented units.
 */
export function Roadmap({ progress }: { progress: ProgressV1 }) {
  const completed = new Set(Object.keys(progress.completed));
  const totalUnits = totalUnitCount();
  const totalDone = completed.size;
  const totalPercent = totalUnits === 0 ? 0 : Math.round((totalDone / totalUnits) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-black mb-3">خارطة المنهج</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          المسار التعليمي الكامل من الرياضيات إلى هندسة الذكاء الاصطناعي — 13 مرحلة، 78 وحدة.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm">
          <span className="font-bold">{totalPercent}%</span>
          <span className="text-muted-foreground">من إجمالي {totalUnits} وحدة مكتملة ({totalDone}/{totalUnits})</span>
        </div>
      </header>

      <ol className="space-y-8" dir="rtl">
        {book.stages.map((stage, sIdx) => {
          const sp = stageProgress(stage, completed);
          return (
            <li key={stage.id} className="relative">
              {/* connector */}
              {sIdx < book.stages.length - 1 && (
                <div className="absolute top-full right-9 w-px h-8 bg-border -translate-y-px" aria-hidden="true" />
              )}
              <div className="flex items-start gap-3 sm:gap-5">
                {/* circular stage badge */}
                <div className="shrink-0 w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-primary/10 border-2 border-primary/40 flex flex-col items-center justify-center text-primary">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">مرحلة</span>
                  <span className="text-xl font-black leading-none">{stage.stageNumber}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-3 mb-1">
                    <h2 className="text-xl sm:text-2xl font-bold">{stage.title}</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {sp.done} / {sp.total} • {sp.percent}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{stageProgressionNarrative(stage.stageNumber)}</p>
                  <ol className="space-y-2">
                    {stage.units.map((unit) => {
                      const isDone = completed.has(unit.id);
                      const flat: FlatUnit = {
                        index: 0,
                        sequentialNumber: 0,
                        stageId: stage.id,
                        stageNumber: stage.stageNumber,
                        stageTitle: stage.title,
                        unitId: unit.id,
                        unitNumber: unit.unitNumber,
                        title: unit.title,
                        description: unit.description,
                      };
                      return (
                        <li key={unit.id}>
                          <Link
                            href={unitPath(flat)}
                            className="group flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                          >
                            <span
                              className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold ${
                                isDone ? 'bg-green-600 border-green-600 text-white' : 'border-muted-foreground/30 text-muted-foreground'
                              }`}
                              aria-hidden="true"
                            >
                              {isDone ? '✓' : unit.unitNumber}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm leading-snug truncate">{unit.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{unit.description}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                          </Link>
                        </li>
                      );
                    })}
                    {stage.units.length === 0 && (
                      <li className="text-xs text-muted-foreground italic px-3 py-2">لا توجد وحدات في هذه المرحلة.</li>
                    )}
                  </ol>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * Short educational progression blurb per stage. We do NOT invent
 * units, only describe the pedagogical transition that already exists
 * in the book stages.
 */
function stageProgressionNarrative(stageNumber: number): string {
  switch (stageNumber) {
    case 1: return 'الرياضيات الأساسية للذكاء الاصطناعي — الجبر، الجبر الخطي، الاحتمالات، والتفاضل.';
    case 2: return 'NumPy — البرمجة العددية الاحترافية وأساس كل مكتبات AI.';
    case 3: return 'Pandas — تحليل البيانات الاحترافي وتنظيف البيانات الواقعية.';
    case 4: return 'Matplotlib & Seaborn — التصور البياني وسرد القصص بالبيانات.';
    case 5: return 'Machine Learning — الانحدار، التصنيف، التجميع، وخطوط الإنتاج.';
    case 6: return 'Deep Learning — PyTorch، CNN، RNN، Transformers.';
    case 7: return 'NLP & Embeddings — التضمين، الانتباه، والبحث الدلالي.';
    case 8: return 'LLMs — GPT، Claude، Gemini والنماذج مفتوحة المصدر.';
    case 9: return 'Prompt Engineering — هندسة أوامر احترافية وتقييم.';
    case 10: return 'RAG — أنظمة الاسترجاع المعزز للإنتاج.';
    case 11: return 'AI Agents — التخطيط، الأدوات، الذاكرة، والأنظمة المتعددة.';
    case 12: return 'MLOps — FastAPI، Docker، سحابة، مراقبة، CI/CD.';
    case 13: return 'المشروع النهائي — بناء منصة AI متكاملة.';
    default: return '';
  }
}
