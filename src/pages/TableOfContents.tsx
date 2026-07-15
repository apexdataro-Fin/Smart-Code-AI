import { Shell } from '@/components/Shell';
import { Link } from 'wouter';
import { book } from '@/data/book';
import { BookOpen, BookText } from 'lucide-react';
import { completedSet, useProgress } from '@/lib/progress';
import { overallProgress, stageProgress, totalUnitCount } from '@/lib/curriculum';

export default function TableOfContents() {
  const [progress] = useProgress();
  const completed = completedSet(progress);
  const overall = overallProgress(completed);
  const total = totalUnitCount();

  return (
    <Shell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-in fade-in duration-500">
        <header className="mb-10 text-center sm:text-right" dir="rtl">
          <h1 className="text-4xl font-black text-primary mb-2">الفهرس التفصيلي</h1>
          <p className="text-muted-foreground text-lg mb-4">خريطة طريقك لإتقان هندسة البرمجيات</p>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-muted text-sm">
            <span className="font-bold text-primary">{overall.percent}%</span>
            <span className="text-muted-foreground">
              {overall.done} / {total} وحدة
            </span>
            <Link href="/roadmap" className="ms-2 underline-offset-2 hover:underline text-primary">
              <BookText className="w-3.5 h-3.5 inline-block" /> خارطة المنهج
            </Link>
          </div>
        </header>

        <div className="space-y-12">
          {book.stages.map((stage) => {
            const sp = stageProgress(stage, completed);
            return (
              <div key={stage.id} className="relative">
                {/* Stage Header */}
                <div className="sticky top-14 bg-background/95 backdrop-blur py-4 z-10 border-b-2 border-primary/20 mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    <span className="text-primary ml-2 text-xl font-black opacity-50">مرحلة {stage.stageNumber}</span>
                    {stage.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>{sp.done} / {sp.total} ({sp.percent}%)</span>
                    <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden max-w-xs">
                      <div className="h-full bg-primary/70 transition-all duration-500" style={{ width: `${sp.percent}%` }} />
                    </div>
                  </div>
                </div>

                {/* Units Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stage.units.map((unit) => {
                    const isDone = completed.has(unit.id);
                    return (
                      <Link key={unit.id} href={`/stage/${stage.id}/unit/${unit.id}`}>
                        <div className="group border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all rounded-xl p-5 cursor-pointer h-full flex flex-col">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                              isDone ? 'bg-green-600 text-white' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
                            }`}>
                              {isDone ? '✓' : unit.unitNumber}
                            </div>
                            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                              {unit.title}
                            </h3>
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                            {unit.description}
                          </p>
                          <div className="mt-4 pt-4 border-t border-border/50 text-xs text-primary/70 font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <BookOpen className="w-3 h-3" />
                            اقرأ الوحدة
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Appendices */}
          <div className="relative pt-8">
            <div className="sticky top-14 bg-background/95 backdrop-blur py-4 z-10 border-b-2 border-secondary/20 mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                <span className="text-secondary ml-2 text-xl font-black opacity-50">ملاحق</span>
                موارد إضافية
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/prompts">
                <div className="border border-border bg-muted/30 hover:bg-secondary/5 hover:border-secondary/30 rounded-xl p-5 cursor-pointer text-center transition-colors">
                  <div className="text-3xl mb-2">🤖</div>
                  <div className="font-bold text-foreground">مكتبة الأوامر</div>
                </div>
              </Link>
              <Link href="/appendix">
                <div className="border border-border bg-muted/30 hover:bg-secondary/5 hover:border-secondary/30 rounded-xl p-5 cursor-pointer text-center transition-colors">
                  <div className="text-3xl mb-2">📚</div>
                  <div className="font-bold text-foreground">المراجع السريعة</div>
                </div>
              </Link>
              <Link href="/capstone">
                <div className="border border-border bg-muted/30 hover:bg-secondary/5 hover:border-secondary/30 rounded-xl p-5 cursor-pointer text-center transition-colors">
                  <div className="text-3xl mb-2">🚀</div>
                  <div className="font-bold text-foreground">المشروع النهائي</div>
                </div>
              </Link>
              <Link href="/roadmap">
                <div className="border border-border bg-muted/30 hover:bg-secondary/5 hover:border-secondary/30 rounded-xl p-5 cursor-pointer text-center transition-colors">
                  <div className="text-3xl mb-2">🗺️</div>
                  <div className="font-bold text-foreground">خارطة المنهج</div>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </Shell>
  );
}
