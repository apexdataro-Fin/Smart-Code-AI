import { useEffect, useMemo, useState } from 'react';
import { useRoute } from 'wouter';
import { Sparkles, Eye, RefreshCw, CheckCircle2, Lightbulb, FileText } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { LabShell } from '@/components/lab/LabShell';
import { getGuide, GUIDES } from '@/data/lab/guides';
import { createProject, updateProject, setFileContent } from '@/lib/lab/projectManager';
import type { LabProject } from '@/lib/lab/types';
import { Link } from 'wouter';

/**
 * Guided exercise page. Split:
 *  - Sidebar (right in RTL): task + hints + expected output + Reset/Reveal
 *  - Main: LabShell with the student's file active
 *
 * Verification: after each Run we check stdout for the expected substrings.
 */
export default function LabGuidedPage() {
  const [, params] = useRoute<{ exerciseId: string }>('/lab/guided/:exerciseId');
  const exerciseId = params?.exerciseId ?? '';
  const guide = useMemo(() => getGuide(exerciseId), [exerciseId]);

  const [project, setProject] = useState<LabProject | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!guide) return;
    const proj = createProject({
      name: `تمرين: ${guide.title}`,
      language: guide.language,
      mode: 'workspace',
      starterCode: guide.studentInit,
    });
    setProject(updateProject(proj, { description: guide.description }));
    setRevealed(false);
  }, [guide?.id]);

  if (!guide) {
    return (
      <Shell>
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">لم يتم العثور على التمرين.</p>
          <Link href="/lab/guided" className="text-primary mt-2 inline-block">عرض كل التمارين</Link>
        </div>
      </Shell>
    );
  }
  if (!project) {
    return (
      <Shell>
        <div className="grid place-items-center h-64 text-muted-foreground">يتم التحميل…</div>
      </Shell>
    );
  }

  const handleReveal = () => {
    if (!project) return;
    // Reveal: write teacher code into the student's file.
    const next = setFileContent(project, project.activeId, guide.teacherCode);
    setProject(next);
    setRevealed(true);
  };
  const handleReset = () => {
    if (!project) return;
    const reset = setFileContent(project, project.activeId, guide.studentInit);
    setProject(reset);
    setRevealed(false);
  };

  return (
    <Shell>
      <div className="h-[calc(100vh-3.5rem)] min-h-[500px] flex" dir="rtl">
        <aside className="hidden md:flex flex-col w-[320px] shrink-0 border-l border-border bg-card p-4 overflow-y-auto">
          <h2 className="text-xl font-bold text-primary">{guide.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{guide.description}</p>
          <div className="mt-4">
            <div className="text-xs font-bold text-muted-foreground uppercase mb-1">المهمّة</div>
            <p dir="rtl" className="text-sm leading-relaxed bg-muted/40 rounded p-3 border border-border">{guide.task}</p>
          </div>
          <div className="mt-4">
            <div className="text-xs font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1">
              <Lightbulb className="w-3 h-3" /> تلميحات (متدرّجة)
            </div>
            <ol className="list-decimal ps-5 text-sm space-y-1">
              {guide.hints.map((h, i) => (<li key={i}>{h}</li>))}
            </ol>
          </div>
          {guide.expectedOutputContains && (
            <div className="mt-4">
              <div className="text-xs font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> الخرج المتوقّع
              </div>
              <ul className="text-xs space-y-1 font-mono">
                {guide.expectedOutputContains.map((s, i) => (<li key={i}>→ {s}</li>))}
              </ul>
            </div>
          )}
          <div className="mt-auto pt-4 flex flex-col gap-2">
            <button
              onClick={handleReveal}
              className="px-3 py-2 rounded bg-amber-500 text-white font-bold text-sm flex items-center justify-center gap-1.5"
            >
              <Eye className="w-4 h-4" /> كشف حلّ المعلّم
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2 rounded border border-border bg-card hover:bg-accent font-bold text-sm flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" /> إعادة المحاولة
            </button>
            {revealed && (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                تم نسخ حلّ المعلّم إلى ملفّك. عدّل ثم اضغط إعادة المحاولة لمسح التغييرات.
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <LabShell
            project={project}
            onProjectChange={setProject}
            hideToolbar={false}
          />
        </div>
      </div>
    </Shell>
  );
}

/**
 * Companion index page: list of all guides. Mounted at /lab/guided
 * (without :exerciseId). The LabGuidedPage matches the /lab/guided/:exerciseId
 * route; this fallback handles the bare /lab/guided path.
 */
export function GuidedIndex() {
  return (
    <Shell>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-6 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">تمارين موجَّهة</h1>
            <p className="text-muted-foreground mt-1">قائمة قصيرة من التمارين بجانب درس واضح وكود معلّم يمكنك كشفه.</p>
          </div>
        </header>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {GUIDES.map((g) => (
            <li key={g.id}>
              <Link href={`/lab/guided/${g.id}`}>
                <span className="block p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-start cursor-pointer">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="font-bold">{g.title}</div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{g.description}</p>
                  <div className="text-[11px] text-muted-foreground mt-2 inline-flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {g.studentFileName} · {g.language}
                  </div>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  );
}
