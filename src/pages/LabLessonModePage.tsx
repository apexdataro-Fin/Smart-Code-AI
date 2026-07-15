import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Shell } from '@/components/Shell';
import { LabShell } from '@/components/lab/LabShell';
import { getUnit } from '@/data/book';
import UnitPage from '@/pages/UnitPage';
import { consumeLessonHandoff } from '@/lib/lab/lessonBridge';
import { createProject, getProject, updateProject } from '@/lib/lab/projectManager';
import { BookOpen, Code2, ArrowLeft, ArrowRight } from 'lucide-react';
import type { LabProject } from '@/lib/lab/types';
import { useIsMobile } from '@/lib/lab/mobileDetect';
import { cn } from '@/lib/utils';
import { readLastLessonTab, writeLastLessonTab, type MobileLessonTab } from '@/lib/lab/storage';

/**
 * Lesson-mode lab: split view.
 *   /lab/lesson/:stageId/:unitId?hl=:labId  — opens the lesson + lab side by side.
 *   /lab/lesson/:stageId/:unitId            — opens lesson + creates lab from handoff.
 *
 * Branches on `useIsMobile()`:
 *   - Desktop → PanelGroup split between lesson pane and LabShell.
 *   - Mobile  → single Lesson / Lab tab with a lightweight tab bar at
 *               the top and a floating jump-back FAB at bottom-left so
 *               the user can switch contexts instantly without losing
 *               scroll position in either pane. Last selected tab is
 *               persisted in localStorage across reloads.
 */
export default function LabLessonModePage() {
  const [, params] = useRoute<{ stageId: string; unitId: string }>('/lab/lesson/:stageId/:unitId');
  const stageId = params?.stageId ?? '';
  const unitId = params?.unitId ?? '';
  const unit = getUnit(stageId, unitId);
  const [project, setProject] = useState<LabProject | null>(null);
  const [tab, setTab] = useState<MobileLessonTab>(() => readLastLessonTab());
  const isMobile = useIsMobile();

  useEffect(() => {
    writeLastLessonTab(tab);
  }, [tab]);

  useEffect(() => {
    if (!unit) return;
    const handoff = consumeLessonHandoff();
    if (!handoff) {
      setProject(null);
      return;
    }
    const existingId = readQueryParam('hl');
    if (existingId) {
      const p = getProject(existingId);
      if (p) { setProject(p); return; }
    }
    const starter = handoff.content;
    const p = createProject({
      name: handoff.title || 'تمرين الدرس',
      language: handoff.language,
      mode: 'workspace',
      starterCode: starter,
    });
    setProject(updateProject(p, { description: 'مثال من الدرس — يمكنك التعديل.' }));
    setQueryParam('hl', p.id);
  }, [unit]);

  if (!unit) {
    return (
      <Shell>
        <div className="grid place-items-center h-64 text-muted-foreground">تعذّر العثور على الدرس المطلوب.</div>
      </Shell>
    );
  }

  /* ----------------------- MOBILE LAYOUT ----------------------- */
  if (isMobile) {
    return (
      <Shell>
        <div className="mobile-lesson-root" dir="rtl">
          {/* Top segmented control */}
          <div className="mobile-lesson-tabbar">
            <button
              type="button"
              className={cn('mobile-lesson-tab', tab === 'lesson' && 'mobile-lesson-tab-active')}
              aria-pressed={tab === 'lesson'}
              onClick={() => setTab('lesson')}
            >
              <BookOpen className="w-4 h-4 ml-1.5" /> الدرس
            </button>
            <button
              type="button"
              className={cn('mobile-lesson-tab', tab === 'lab' && 'mobile-lesson-tab-active')}
              aria-pressed={tab === 'lab'}
              onClick={() => setTab('lab')}
              disabled={!project}
            >
              <Code2 className="w-4 h-4 ml-1.5" /> المختبر
            </button>
          </div>

          {/* Body */}
          <div className="mobile-lesson-body">
            {tab === 'lesson' || !project ? (
              <div className="h-full overflow-y-auto p-3 bg-background">
                <UnitLessonEmbedded stageId={stageId} unitId={unitId} />
              </div>
            ) : (
              <LabShell project={project} onProjectChange={setProject} />
            )}
          </div>

          {/* Floating jump-back FAB */}
          {project && (
            <button
              type="button"
              className="mobile-lesson-fab"
              aria-label={tab === 'lesson' ? 'العودة إلى المختبر' : 'العودة إلى الدرس'}
              onClick={() => setTab(tab === 'lesson' ? 'lab' : 'lesson')}
            >
              {tab === 'lesson' ? <Code2 className="w-5 h-5 ml-1.5" /> : <BookOpen className="w-5 h-5 ml-1.5" />}
              {tab === 'lesson' ? 'المختبر' : 'الدرس'}
              {tab === 'lesson' ? <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> : <ArrowRight className="w-3.5 h-3.5 mr-1.5" />}
            </button>
          )}
        </div>
      </Shell>
    );
  }

  /* ----------------------- DESKTOP LAYOUT ----------------------- */
  return (
    <Shell>
      <div className="hidden md:block h-[calc(100vh-3.5rem)] min-h-[500px]">
        <PanelGroup direction="horizontal" autoSaveId="lab-lesson">
          <Panel defaultSize={45} minSize={25}>
            {/* Lesson pane — re-use the existing UnitPage layout. */}
            <div className="h-full overflow-y-auto p-4 bg-background" dir="rtl">
              <UnitLessonEmbedded stageId={stageId} unitId={unitId} />
            </div>
          </Panel>
          <PanelResizeHandle className="w-1.5 bg-border hover:bg-primary/40" />
          <Panel defaultSize={55} minSize={30}>
            <div className="h-full">
              {project ? (
                <LabShell project={project} onProjectChange={setProject} />
              ) : (
                <div className="h-full grid place-items-center text-muted-foreground text-sm px-6 text-center">
                  اضغط زر "افتح في المختبر" داخل الدرس لإحضار مثال الكود إلى هنا.
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </Shell>
  );
}

/**
 * Lightweight wrapper that renders the unit's body inside an embedded
 * container. We re-use UnitPage's full UI but suppress the breadcrumb +
 * prev/next footer to keep the lesson pane compact.
 */
function UnitLessonEmbedded({ stageId, unitId }: { stageId: string; unitId: string }) {
  const unit = getUnit(stageId, unitId);
  if (!unit) return null;
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-2">{unit.title}</h1>
      {unit.description && <p className="text-muted-foreground mb-4">{unit.description}</p>}
      <div className="border border-border rounded-lg bg-card p-4">
        <UnitPage params={{ stageId, unitId }} />
      </div>
    </div>
  );
}

function readQueryParam(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const u = new URL(window.location.href);
  return u.searchParams.get(name);
}

function setQueryParam(name: string, value: string): void {
  if (typeof window === 'undefined') return;
  const u = new URL(window.location.href);
  u.searchParams.set(name, value);
  // Replace state without scroll jump.
  try { window.history.replaceState(null, '', u.toString()); } catch { /* ignore */ }
}
