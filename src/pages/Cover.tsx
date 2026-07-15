import { Shell } from '@/components/Shell';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { BookOpen, GraduationCap, List, BookText, Search, ArrowLeft, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { incorrectQuestions, useQuizStats } from '@/lib/quiz';
import { readLastRoute, useProgress } from '@/lib/progress';
import { overallProgress, totalUnitCount } from '@/lib/curriculum';

export default function Cover() {
  const [progress] = useProgress();
  const [stats] = useQuizStats();
  const [, navigate] = useLocation();
  const [resumeRoute, setResumeRoute] = useState<string | null>(null);

  useEffect(() => {
    setResumeRoute(readLastRoute());
  }, []);

  const completed = Object.keys(progress.completed);
  const overall = overallProgress(new Set(completed));
  const total = totalUnitCount();
  const incorrectCount = incorrectQuestions(999, stats).length;
  const hasContinuedLearning = !!resumeRoute && resumeRoute !== '/' && resumeRoute !== '/intro' && resumeRoute !== '/toc';

  return (
    <Shell>
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">

          {/* Cover Art */}
          <div className="w-32 h-32 mx-auto bg-primary text-primary-foreground rounded-2xl flex items-center justify-center rotate-3 shadow-xl mb-12">
            <div className="text-5xl font-mono font-bold">&lt;/&gt;</div>
          </div>

          <div className="space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary font-bold text-sm tracking-widest border border-secondary/20">
              إصدار 2026
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-primary tracking-tight">
              Smart Code AI
            </h1>

            <h2 className="text-2xl md:text-3xl font-bold text-foreground/80 mt-4 leading-relaxed">
              هندسة الذكاء الاصطناعي — من الرياضيات إلى النشر
            </h2>

            <p className="text-lg text-muted-foreground max-w-lg mx-auto pt-6 leading-relaxed">
              دليل متكامل لتصبح مهندس ذكاء اصطناعي محترف. 13 مرحلة، 78 وحدة تعليمية — من الرياضيات إلى بناء منصة AI كاملة.
            </p>
          </div>

          {/* Progress card */}
          {overall.done > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5 mx-auto max-w-md text-right" dir="rtl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-muted-foreground">تقدّمك في المنهج</span>
                <span className="text-2xl font-black text-primary">
                  {overall.percent}%
                </span>
              </div>
              <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
                  style={{ width: `${overall.percent}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {overall.done} من {total} وحدة مكتملة
                {incorrectCount > 0 && (
                  <span className="block mt-1 text-secondary font-semibold">
                    لديك {incorrectCount} سؤالاً للمراجعة
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Primary CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            {hasContinuedLearning ? (
              <Button
                size="lg"
                onClick={() => navigate(resumeRoute)}
                className="w-full sm:w-auto gap-2 text-base px-8 h-14 rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
                أكمل من حيث توقفت
              </Button>
            ) : (
              <Link href="/intro">
                <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-8 h-14 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                  ابدأ القراءة
                </Button>
              </Link>
            )}
            <Link href="/toc">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-14 rounded-xl">
                <List className="w-5 h-5" />
                تصفح الفهرس
              </Button>
            </Link>
          </div>

          {/* Secondary quick-links */}
          <div className="pt-2 flex items-center justify-center flex-wrap gap-3 text-sm">
            <Link href="/roadmap" className="px-3 py-2 rounded-md border border-border bg-card hover:border-primary/40 hover:text-primary transition-colors flex items-center gap-2">
              <BookText className="w-4 h-4" />
              خارطة المنهج
            </Link>
            <Link href="/search" className="px-3 py-2 rounded-md border border-border bg-card hover:border-primary/40 hover:text-primary transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" />
              بحث في المحتوى
            </Link>
            {incorrectCount > 0 && (
              <Link href="/quiz/review" className="px-3 py-2 rounded-md border border-secondary/40 bg-secondary/5 text-secondary hover:bg-secondary/10 transition-colors flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                مراجعة {incorrectCount} سؤالاً
              </Link>
            )}
          </div>

          <div className="pt-12 text-sm text-muted-foreground font-medium">
            {total} وحدة · 13 مرحلة · مشروع AI Platform نهائي
          </div>

          {/* Small recognition badge for explorers */}
          {overall.done === total && total > 0 && (
            <div className="mx-auto max-w-md p-4 rounded-xl border-2 border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300 font-bold">
              🎉 تهانينا! لقد أتممت المنهج كاملاً. استمر في البناء!
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
