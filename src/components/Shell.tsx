import { Link, useLocation } from 'wouter';
import { book } from '@/data/book';
import {
  BookOpen,
  List,
  GraduationCap,
  Menu,
  X,
  TerminalSquare,
  BookMarked,
  CodeXml,
  Moon,
  Sun,
  Download,
  BookText,
  RotateCcw,
  Beaker,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { downloadDocx } from '@/lib/docxExport';
import { SearchBar } from '@/components/SearchBar';
import { useIsMobile } from '@/lib/lab/mobileDetect';
import { MobileShellControlBar } from '@/components/lab/mobile/MobileShellControlBar';
import { cn } from '@/lib/utils';
import {
  broadcastProgressChange,
  completedCount,
  completedSet,
  readProgress,
  readReadingMode,
  setReadingMode,
  useProgress,
} from '@/lib/progress';
import { overallProgress } from '@/lib/curriculum';

export function Sidebar({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const [location] = useLocation();
  const [progress] = useProgress();

  const completed = completedSet(progress);
  const totalUnits = book.stages.reduce((acc, stage) => acc + stage.units.length, 0);
  const progressPercent =
    totalUnits > 0 ? Math.round((completed.size / totalUnits) * 100) : 0;

  const NavItem = ({
    href,
    icon: Icon,
    label,
    isActive,
    onClick,
  }: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    isActive: boolean;
    onClick?: () => void;
  }) => (
    <Link href={href} onClick={onClick}>
      <span
        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
          isActive
            ? 'bg-primary/10 text-primary font-semibold'
            : 'hover:bg-muted text-foreground/80 hover:text-foreground'
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="truncate">{label}</span>
      </span>
    </Link>
  );

  const closeIfMobile = () => {
    if (window.innerWidth < 1024) setOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
          data-chrome="chrome"
        />
      )}

      {/* Sidebar — desktop slides off-screen when closed, mobile slides on */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-72 bg-card border-l border-border flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        data-chrome="chrome"
      >
        <div className="h-14 border-b border-border flex items-center px-4 justify-between shrink-0">
          <Link href="/">
            <span className="font-bold text-lg text-primary flex items-center gap-2 cursor-pointer">
              <CodeXml className="w-5 h-5" />
              Smart Code
            </span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} title="إغلاق القائمة">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div
          className="p-4 border-b border-border shrink-0 bg-muted/30 progress-summary"
          data-chrome="chrome"
        >
          <div className="text-xs font-semibold mb-2 text-muted-foreground">
            نسبة الإنجاز: {progressPercent}%
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-muted-foreground mt-2">
            {completed.size} / {totalUnits} وحدة
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          <div className="space-y-1">
            <NavItem
              href="/"
              icon={BookOpen}
              label="غلاف الكتاب"
              isActive={location === '/'}
              onClick={closeIfMobile}
            />
            <NavItem
              href="/intro"
              icon={GraduationCap}
              label="المقدمة"
              isActive={location === '/intro'}
              onClick={closeIfMobile}
            />
            <NavItem
              href="/toc"
              icon={List}
              label="الفهرس التفصيلي"
              isActive={location === '/toc'}
              onClick={closeIfMobile}
            />
            <NavItem
              href="/roadmap"
              icon={BookText}
              label="خارطة المنهج"
              isActive={location === '/roadmap'}
              onClick={closeIfMobile}
            />
          </div>

          {book.stages.map((stage) => (
            <div key={stage.id} className="space-y-1">
              <div className="text-xs font-bold text-muted-foreground mb-2 px-3 uppercase tracking-wider">
                المرحلة {stage.stageNumber}: {stage.title}
              </div>
              {stage.units.map((unit) => {
                const unitPath = `/stage/${stage.id}/unit/${unit.id}`;
                const isCurrent = location === unitPath;
                const isCompleted = completed.has(unit.id);

                return (
                  <Link key={unit.id} href={unitPath} onClick={closeIfMobile}>
                    <span
                      className={`flex items-start gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer text-sm ${
                        isCurrent
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-muted text-foreground/80 hover:text-foreground'
                      }`}
                    >
                      <span
                        className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] mt-0.5 ${
                          isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-muted-foreground/30 text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? '✓' : unit.unitNumber}
                      </span>
                      <span className="leading-snug">{unit.title}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}

          <div className="space-y-1 border-t border-border pt-4">
            <NavItem
              href="/lab"
              icon={Beaker}
              label="مختبر Smart Code"
              isActive={location.startsWith('/lab')}
              onClick={closeIfMobile}
            />
            <NavItem
              href="/lab/guided"
              icon={Sparkles}
              label="تمارين موجَّهة"
              isActive={location === '/lab/guided'}
              onClick={closeIfMobile}
            />
            <NavItem
              href="/prompts"
              icon={TerminalSquare}
              label="مكتبة الـ Prompts"
              isActive={location === '/prompts'}
              onClick={closeIfMobile}
            />
            <NavItem
              href="/appendix"
              icon={BookMarked}
              label="الملاحق المرجعية"
              isActive={location === '/appendix'}
              onClick={closeIfMobile}
            />
            <NavItem
              href="/capstone"
              icon={GraduationCap}
              label="المشروع النهائي"
              isActive={location === '/capstone'}
              onClick={closeIfMobile}
            />
            <NavItem
              href="/quiz/review"
              icon={RotateCcw}
              label="مراجعة الأسئلة الخاطئة"
              isActive={location === '/quiz/review'}
              onClick={closeIfMobile}
            />
          </div>
        </div>
      </aside>
    </>
  );
}

export function Shell({ children, readingFrame = false }: { children: React.ReactNode; readingFrame?: boolean }) {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('sc_sidebar_open');
    if (saved !== null) return saved === 'true';
    return window.innerWidth >= 1024;
  });

  // Simulator view (/lab/*) gets a route-aware UX:
  //   1. The SearchBar is hidden because the lab owns the top toolbar.
  //      `lib/search` itself still works on every other route.
  //   2. On MOBILE only, we inject <MobileShellControlBar/> next to
  //      DOCX. It reads run state from the singleton bridge written by
  //      MobileLabRoot and renders the 4 Lab actions (Run · Reset ·
  //      Files · Settings) inline with the global header.
  const isLabRoute = typeof location === 'string' && location.startsWith('/lab');

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sc_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [readingOn, setReadingOn] = useState<boolean>(() => readReadingMode());
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('sc_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('sc_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    try {
      localStorage.setItem('sc_sidebar_open', String(sidebarOpen));
    } catch {
      /* ignore */
    }
  }, [sidebarOpen]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadDocx();
    } catch (e) {
      console.error('DOCX generation failed', e);
    } finally {
      setIsDownloading(false);
    }
  };

  const toggleReading = () => {
    const next = !readingOn;
    setReadingMode(next);
    setReadingOn(next);
  };

  // If the page requested a reading-frame wrapper, auto-enable reading mode
  // (the page opts in via prop so a single toggle still works globally).
  const finalReadingFrame = readingFrame || readingOn;
  const innerContent = (
    <div className={finalReadingFrame ? 'reading-container' : ''}>{children}</div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarOpen ? 'lg:pr-72' : 'lg:pr-0'
        }`}
      >
        <header
          className={cn(
            'border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30 flex items-center justify-between gap-2 no-print',
            isMobile ? 'h-12 px-2' : 'h-14 px-4'
          )}
          data-chrome="chrome"
        >
          <div className={cn('flex items-center', isMobile ? 'gap-1' : 'gap-2')}>
            <Button
              variant="ghost"
              size={isMobile ? 'sm' : 'icon'}
              onClick={() => setSidebarOpen((v) => !v)}
              className={cn(isMobile && 'h-8 w-8 p-0')}
              title={sidebarOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              aria-label="القائمة"
            >
              <Menu className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
            </Button>
            {!isLabRoute && <SearchBar />}
          </div>

          <div className={cn('flex items-center', isMobile ? 'gap-1' : 'gap-2')}>
            {/* Lesson (Reading Mode) button. On mobile we collapse the
                visible label to icon-only so it fits next to the new
                Lab control bar. */}
            <Button
              variant={readingOn ? 'default' : 'ghost'}
              size={isMobile ? 'sm' : 'sm'}
              onClick={toggleReading}
              className={cn(
                isMobile ? 'h-8 w-8 p-0' : 'gap-2 text-sm'
              )}
              title="وضع القراءة"
              aria-label="وضع القراءة"
              aria-pressed={readingOn}
            >
              <BookText className={isMobile ? 'w-4 h-4' : 'w-4 h-4'} />
              {!isMobile && (
                <span className="hidden sm:inline">
                  {readingOn ? 'إنهاء القراءة' : 'وضع القراءة'}
                </span>
              )}
            </Button>

            {/* DOCX button. The user requested: keep only the
                download icon + "DOCX". We drop both "تحميل" (in the
                idle label) and "جاري التحميل..." (during async work);
                show a small spinner in place while downloading. */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className={cn(
                'docx-download',
                isMobile
                  ? 'h-8 px-2 gap-1 text-[10px] font-bold tracking-wider'
                  : 'gap-2 text-sm text-muted-foreground hover:text-foreground'
              )}
              data-chrome="chrome"
              title="تحميل الكتاب بصيغة Word"
              aria-label="تحميل الكتاب بصيغة Word"
            >
              {isDownloading ? (
                <Loader2 className={isMobile ? 'w-3.5 h-3.5 animate-spin' : 'w-4 h-4 animate-spin'} />
              ) : (
                <Download className={isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
              )}
              DOCX
            </Button>

            {/* Lab execution toolbar (Run · Reset · Files · Settings)
                rendered INTO the global header on mobile only. Reads
                from the singleton bridge written by MobileLabRoot. */}
            {isMobile && isLabRoute && <MobileShellControlBar />}

            {/* Theme toggle. Size kept identical (icon button); the
                icon itself shrank slightly on mobile to keep the row
                tidy. */}
            <Button
              variant="ghost"
              size={isMobile ? 'sm' : 'icon'}
              onClick={() => setIsDark((d) => !d)}
              className={cn(isMobile && 'h-8 w-8 p-0')}
              title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
              aria-label={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
              {isDark ? (
                <Sun className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
              ) : (
                <Moon className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
              )}
            </Button>
          </div>
        </header>

        <main className="flex-1">{innerContent}</main>
      </div>
    </div>
  );
}

/** Headless sync of progress LocalStorage when sidebar mounts ─ unused but
 * available if any unit progress emitted changes between renders. */
export function ProgressSyncBeacon() {
  useEffect(() => {
    const handler = () => {
      // Force a re-read of completedCount by mutating a dummy state in callers.
      completedCount(readProgress());
      broadcastProgressChange();
    };
    window.addEventListener('sc:route-changed', handler);
    return () => window.removeEventListener('sc:route-changed', handler);
  }, []);
  return null;
}

// Re-export helper expected by some callers
export { overallProgress };
