import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LabProject, LabFile, RunMessage, RunError, LanguageId } from '@/lib/lab/types';
import { getAdapter } from '@/lib/lab/registry';
import {
  addFile, removeFile, renameFile, setActiveFile, setFileContent,
  switchActiveFileLanguage, updateProject,
} from '@/lib/lab/projectManager';
import { runProject } from '@/lib/lab/executionEngine';
import { saveProject, broadcastLabSaved } from '@/lib/lab/storage';
import {
  readDividerRatio, writeDividerRatio, MOBILE_DIVIDER_BOUNDS,
} from '@/lib/lab/storage';
import { useViewportUnits } from '@/lib/lab/mobileDetect';
import {
  loadPyodideSingleton, pyodideStatus, resetPyodide, subscribePyodide, type PyodideState,
} from '@/lib/lab/pyodideLoader';

import { MobileLanguageDropdown } from './MobileLanguageDropdown';
import { MobileFilesSheet } from './MobileFilesSheet';
import { MobileSettingsSheet } from './MobileSettingsSheet';
import { MobileBottomSheet } from './MobileBottomSheet';
import { MobileEditor } from './MobileEditor';
import { MobileDynamicViewer } from './MobileDynamicViewer';
import { DragDivider } from './DragDivider';
import {
  setMobileLabControlsSnapshot,
  type MobileLabControlsSnapshot,
} from './MobileLabControlsBridge';
import { cn } from '@/lib/utils';

/**
 * MobileLabRoot v5 — phone-first IDE (mobile-layout-v2).
 *
 *   ┌──────────────────────────────────────────┐  (.mobile-lab-header, ~84 px)
 *   │ 🐍 Python · main.py          [row 1]     │  Language dropdown + filename
 *   │ Run · ↺ · 📂 · ⚙           [row 2]     │  Action bar (was at the bottom)
 *   ├──────────────────────────────────────────┤
 *   │ Dynamic Viewer (--vr-h)                  │  Preview / Console · Output / Errors
 *   ├────══ DragDivider ═════════════════───── ┤  18 px hit zone + 32×4 px grip
 *   │ Monaco Editor (--er-h)                   │
 *   └────────────────────────────────────────────┘  (footer chrome gone — reclaimed for the viewport)
 *
 * Layout (no scrolling inside the lab):
 *   .mobile-lab-ide { height: var(--vvh); display: grid; grid-template-rows: 84px var(--vr-h) 18px 1fr; }
 *   Viewer height var(--vr-h) is computed as calc(var(--vvh) * ratio - 84px) so the viewer
 *   grabs `ratio * vvh` minus the new 84 px top strip. Editor fills the remaining 1fr grid row.
 *
 * Drag protection: when the user is dragging the divider, we add a
 * `mobile-lab-dragging` class on the root — CSS uses this to set
 * `pointer-events: none` on the editor host and viewer so Monaco
 * doesn't swallow pointermove events.
 *
 * Visual Viewport: useViewportUnits() publishes --vvh / --vvw to <html>.
 * When the on-screen keyboard opens, --vvh shrinks, the editor shrinks.
 * The action bar is at the TOP now (no longer affected by keyboard).
 *
 * The global Shell SearchBar is hidden on /lab/* routes by Shell.tsx,
 * so the visual space previously occupied by the search bar is reclaimed
 * for the editor + preview.
 */

interface MobileLabRootProps {
  initial: LabProject;
  onProjectChange?: (p: LabProject) => void;
  readOnly?: boolean;
}

const DEFAULT_SETTINGS = {
  fontSize: 14,
  theme: 'auto' as const,
  wordWrap: true,
  softWrap: true,
  lineNumbers: true,
  tabSize: 2,
  minimap: false,
};

// The action bar moved out of MobileLabRoot entirely — it now lives
// in the global Shell header on mobile. This constant is retained
// for back-compat with other lab modules but is no longer used.
const RUNBAR_RESERVED_PX = 60;

export function MobileLabRoot({ initial, onProjectChange, readOnly }: MobileLabRootProps) {
  /* viewport + visual viewport (drives layout height) */
  const vv = useViewportUnits();

  /* project */
  const [project, setProject] = useState<LabProject>(initial);
  const projectRef = useRef(project);
  projectRef.current = project;

  /* run state */
  const [messages, setMessages] = useState<RunMessage[]>([]);
  const [errors, setErrors] = useState<RunError[]>([]);
  const [outputText, setOutputText] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  /* ui overlays */
  const [filesSheetOpen, setFilesSheetOpen] = useState(false);
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);

  /* divider ratio (persisted) */
  const [ratio, setRatio] = useState<number>(() => readDividerRatio());
  const setAndPersistRatio = useCallback((r: number) => {
    setRatio(r);
    writeDividerRatio(r);
  }, []);

  /* dragging state (drives CSS pointer-events guard) */
  const [dragging, setDragging] = useState<boolean>(false);

  /* pyodide */
  const [pyState, setPyState] = useState<PyodideState>(() => pyodideStatus());
  useEffect(() => {
    const unsub = subscribePyodide(setPyState);
    return () => unsub();
  }, []);

  /* derived — active file + language + preview */
  const active = useMemo(
    () => project.files.find((f) => f.id === project.activeId) ?? project.files[0],
    [project],
  );
  const activeLang: LanguageId = active?.language ?? project.language;
  const activeAdapter = useMemo(() => getAdapter(activeLang), [activeLang]);

  const previewHtml = useMemo<string>(() => {
    if (!active) return '';
    try {
      return activeAdapter.preview({ project, activeFile: active, files: project.files }) ?? '';
    } catch { return ''; }
  }, [project, active, activeAdapter]);

  /* python readiness */
  const isPythonWorkspace = activeLang === 'python' || project.files.some((f) => f.language === 'python');
  const pythonReady = pyState.status === 'ready';
  const pythonLoading = isPythonWorkspace && pyState.status === 'loading';
  const pythonError = isPythonWorkspace && pyState.status === 'error';
  const pythonPercent = Math.round((pyState.progress || 0) * 100);
  const runDisabled = isRunning || (isPythonWorkspace && !pythonReady);

  /* persist project */
  useEffect(() => {
    if (onProjectChange && project.id !== initial.id) onProjectChange(project);
    saveProject(project);
    broadcastLabSaved(project.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

  /* preload pyodide when project contains Python files */
  const hasPythonFile = useMemo(
    () => project.files.some((f) => f.language === 'python'),
    [project.files],
  );
  useEffect(() => {
    if (readOnly) return;
    if (!hasPythonFile) return;
    if (pyState.status === 'ready' || pyState.status === 'loading') return;
    loadPyodideSingleton().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPythonFile, readOnly]);

  /* actions */
  const onRun = useCallback(async () => {
    setMessages([]);
    setErrors([]);
    setOutputText('');
    setIsRunning(true);
    try {
      await runProject(project, {
        onMessage: (m) => setMessages((prev) => [...prev, m]),
        onError: (e) => setErrors((prev) => [...prev, e]),
        onDone: (r) => {
          setIsRunning(false);
          setOutputText(r.outputs.map((m) => m.text).join('\n'));
        },
      });
    } catch (e) {
      const err: RunError = {
        message: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : undefined,
      };
      setErrors((prev) => [...prev, err]);
      setIsRunning(false);
    }
  }, [project]);

  const onStop = useCallback(async () => {
    try {
      const mod = await import('@/lib/lab/executionEngine');
      mod.stop();
    } catch { /* noop */ }
    setIsRunning(false);
  }, []);

  const onReset = () => setProject(initial);

  const onLanguageChange = useCallback((lang: LanguageId) => {
    setProject((p) => switchActiveFileLanguage(p, lang));
  }, []);

  const handleAddFile = () => {
    const name = window.prompt('اسم الملف الجديد (مثال: helper.js):', 'untitled.txt');
    if (!name) return;
    setProject((p) => addFile(p, { name, content: '' }));
  };
  const handleActivateFile = (fileId: string) => {
    setProject((p) => setActiveFile(p, fileId));
    setFilesSheetOpen(false);
  };
  const handleRenameFile = (fileId: string, newName: string) => {
    setProject((p) => renameFile(p, fileId, newName));
  };
  const handleDeleteFile = (fileId: string) => {
    setProject((p) => removeFile(p, fileId));
  };
  const handleDuplicateFile = (fileId: string) => {
    setProject((p) => {
      const src = p.files.find((f) => f.id === fileId);
      if (!src) return p;
      const clone: LabFile = {
        ...src,
        id: `${src.id}-copy-${Math.random().toString(36).slice(2, 6)}`,
        name: src.name.replace(/(\.[^.]+)?$/, ' (نسخة)$1'),
      };
      return addFile(p, { id: clone.id, name: clone.name, language: clone.language, content: clone.content });
    });
  };

  const handleEditorChange = (val: string) => {
    const f = projectRef.current.files.find((x) => x.id === projectRef.current.activeId);
    if (!f) return;
    setProject((p) => setFileContent(p, f.id, val));
  };

  const handleSettingsChange = (next: Partial<LabProject['settings']>) => {
    setProject((p) => updateProject(p, { settings: { ...p.settings, ...next } }));
  };
  const handleResetSettings = () => setProject((p) => updateProject(p, { settings: { ...DEFAULT_SETTINGS } }));
  const handleRetryPython = () => { resetPyodide(); loadPyodideSingleton().catch(() => {}); };
  const handleClearErrors = () => setErrors([]);

  /* CSS variables — viewer top region. editor fills remaining grid row 1fr.
   * The mobile-lab-header is now 36 px (only Language + filename) so the
   * viewer must subtract only that, reclaiming ~48 px of viewport vs v2. */
  const style = {
    '--vr-h': `calc(var(--vvh, 100dvh) * ${ratio} - 36px)`,
  } as React.CSSProperties;

  /* Stable handler refs for the bridge snapshot. We MUST capture the
     latest render's handlers, but we want the snapshot's reference
     identity to stay stable as long as nothing meaningful changed —
     otherwise useSyncExternalStore in Shell would re-render on every
     MobileLabRoot commit. */
  const onOpenFilesSnap = useCallback(() => setFilesSheetOpen(true), []);
  const onOpenSettingsSnap = useCallback(() => setSettingsSheetOpen(true), []);

  /* Push the singleton snapshot whenever volatile state changes. */
  const stableRetry = handleRetryPython; // handleRetryPython is fresh each render; OK
  useEffect(() => {
    const next: MobileLabControlsSnapshot = {
      isRunning,
      runDisabled,
      pythonLoading,
      pythonPercent,
      pythonError,
      onRun,
      onStop,
      onReset,
      onOpenFiles: onOpenFilesSnap,
      onOpenSettings: onOpenSettingsSnap,
      onRetryPython: stableRetry,
    };
    setMobileLabControlsSnapshot(next);
    return () => {
      // Clear the snapshot when leaving /lab/* so the Shell bar disappears.
      setMobileLabControlsSnapshot(null);
    };
    // Intentionally exhaustive — we push every time any field changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, runDisabled, pythonLoading, pythonPercent, pythonError, onRun, onStop, onReset, stableRetry]);

  return (
    <div
      className={cn(
        'mobile-lab-ide',
        vv.keyboardOpen && 'mobile-lab-keyboard-open',
        dragging && 'mobile-lab-dragging',
      )}
      data-keyboard={vv.keyboardOpen ? 'open' : 'closed'}
      data-dragging={dragging ? 'true' : 'false'}
      style={style}
      dir="rtl"
    >
      {/* HEADER (single-row 36 px — just Language + filename) */}
      <header className="mobile-lab-header" dir="rtl">
        <div className="mobile-lab-header-row1">
          <MobileLanguageDropdown current={activeLang} onChange={onLanguageChange} />
          <span className="mobile-lab-filename" title={active?.name}>{active?.name}</span>
        </div>
      </header>

      {/* DYNAMIC VIEWER (top, just below header) */}
      <section
        className="mobile-lab-viewer"
        role="region"
        aria-label="المعاينة والخرج"
        style={{ height: 'var(--vr-h)' }}
      >
        <MobileDynamicViewer
          activeFile={active ?? null}
          language={activeLang}
          messages={messages}
          outputText={outputText}
          errors={errors}
          previewHtml={previewHtml}
          onClearMessages={() => setMessages([])}
          onClearErrors={handleClearErrors}
        />
      </section>

      {/* DRAG DIVIDER */}
      <DragDivider
        ratio={ratio}
        onRatioChange={setAndPersistRatio}
        onDraggingChange={setDragging}
        minRatio={MOBILE_DIVIDER_BOUNDS.min}
        maxRatio={MOBILE_DIVIDER_BOUNDS.max}
      />

      {/* EDITOR (Monaco, bottom) — fills remaining grid row. */}
      <section
        className="mobile-lab-editor"
        aria-label="محرر الكود"
      >
        {active ? (
          <MobileEditor
            value={active.content}
            language={activeLang}
            settings={project.settings}
            readOnly={readOnly || active.readOnly}
            onChange={handleEditorChange}
          />
        ) : (
          <div className="grid place-items-center h-full text-sm text-muted-foreground">
            لا يوجد ملف مفتوح.
          </div>
        )}
      </section>

      {/* Sheets */}
      <MobileBottomSheet
        open={filesSheetOpen}
        onOpenChange={setFilesSheetOpen}
        title="الملفات"
        sheetClassName="h-[70vh]"
      >
        <MobileFilesSheet
          files={project.files}
          activeId={project.activeId}
          onActivate={handleActivateFile}
          onAdd={handleAddFile}
          onRename={handleRenameFile}
          onDelete={handleDeleteFile}
          onDuplicate={handleDuplicateFile}
        />
      </MobileBottomSheet>

      <MobileBottomSheet
        open={settingsSheetOpen}
        onOpenChange={setSettingsSheetOpen}
        title="الإعدادات"
        sheetClassName="h-[70vh]"
      >
        <MobileSettingsSheet
          settings={project.settings}
          onChange={handleSettingsChange}
          onResetDefaults={handleResetSettings}
        />
      </MobileBottomSheet>
    </div>
  );
}
