import {
  addFile, getActiveProject, removeFile, renameFile, setActiveFile,
  setFileContent, updateProject, switchActiveFileLanguage,
} from '@/lib/lab/projectManager';
import { getAdapter } from '@/lib/lab/registry';
import { LabProject, RunError, RunMessage } from '@/lib/lab/types';
import { broadcastLabSaved, saveProject } from '@/lib/lab/storage';
import { runProject } from '@/lib/lab/executionEngine';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { lazy, Suspense } from 'react';

import { MonacoEditor } from './MonacoEditor';
import { ConsolePanel } from './ConsolePanel';
import { ErrorsPanel } from './ErrorsPanel';
import { OutputPanel } from './OutputPanel';
import { LogsPanel } from './LogsPanel';
import { StatusBar } from './StatusBar';
import { LabToolbar } from './LabToolbar';
import { FileTabs } from './FileTabs';
import { FileExplorer } from './FileExplorer';
import { PreviewPanel } from './PreviewPanel';
import { LanguageSelector } from './LanguageSelector';
import {
  loadPyodideSingleton, pyodideStatus, resetPyodide,
  subscribePyodide,
  type PyodideState,
} from '@/lib/lab/pyodideLoader';
import { useIsMobile } from '@/lib/lab/mobileDetect';
import { cn } from '@/lib/utils';

/**
 * LabShell — shared state host for every Lab page.
 *
 * Branches on `useIsMobile()`:
 *   - Mobile  → <MobileLabRoot/> (lazy chunk; same lab bundle)
 *   - Desktop → full split-pane layout (Smart Code Lab v2)
 *
 * MobileLabRoot is lazy-loaded so the heavier mobile-specific components
 * are fetched only when the user opens the lab from a phone. The Desktop
 * path remains the lean react-resizable-panels layout.
 */

interface LabShellProps {
  project: LabProject;
  withFileExplorer?: boolean;
  readOnly?: boolean;
  hideToolbar?: boolean;
  onProjectChange?: (p: LabProject) => void;
  className?: string;
}

type OutputTabId = 'console'|'output'|'errors'|'logs'|'preview';

const MobileLabRootLazy: React.ComponentType<{
  initial: LabProject;
  onProjectChange?: (p: LabProject) => void;
  readOnly?: boolean;
}> = lazy(() =>
  import('./mobile/MobileLabRoot').then((m) => ({ default: m.MobileLabRoot })),
);

export function LabShell({ project: initial, withFileExplorer, readOnly, hideToolbar, onProjectChange, className }: LabShellProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className={cn('h-full w-full bg-background lab-shell-mobile', className)} dir="rtl">
        <Suspense fallback={null}>
          {/* Mobile chunk ships in the same lab bundle; no visible spinner. */}
          <MobileLabRootLazy initial={initial} onProjectChange={onProjectChange} readOnly={readOnly} />
        </Suspense>
      </div>
    );
  }

  return (
    <DesktopLabShell
      project={initial}
      withFileExplorer={withFileExplorer}
      readOnly={readOnly}
      hideToolbar={hideToolbar}
      onProjectChange={onProjectChange}
      className={className}
    />
  );
}

/* =============================================================================
 * DesktopLabShell — Smart Code Lab v2 layout (unchanged).
 * =========================================================================== */

function DesktopLabShell({ project: initial, withFileExplorer, readOnly, hideToolbar, onProjectChange, className }: LabShellProps) {
  const [project, setProject] = useState<LabProject>(initial);
  const projectRef = useRef(project);
  projectRef.current = project;

  const [messages, setMessages] = useState<RunMessage[]>([]);
  const [errors, setErrors] = useState<RunError[]>([]);
  const [outputText, setOutputText] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const [pyState, setPyState] = useState<PyodideState>(() => pyodideStatus());
  useEffect(() => {
    const unsub = subscribePyodide(setPyState);
    return () => { unsub(); };
  }, []);

  const active = useMemo(
    () => project.files.find((f) => f.id === project.activeId) ?? project.files[0],
    [project],
  );
  const activeLang = active?.language ?? project.language;
  const activeAdapter = useMemo(() => getAdapter(activeLang), [activeLang]);

  const previewHtml = useMemo<string>(() => {
    if (!active) return '';
    try {
      return activeAdapter.preview({
        project,
        activeFile: active,
        files: project.files,
      }) ?? '';
    } catch (e) {
      return (
        '<!doctype html><html><body style="font-family:system-ui;padding:1rem">' +
        '<h1 style="color:#ef4444">خطأ في المعاينة</h1>' +
        '<pre>' + (e instanceof Error ? e.message : String(e)) + '</pre></body></html>'
      );
    }
  }, [project, active, activeAdapter]);

  const [tab, setTab] = useState<OutputTabId>(previewHtml ? 'preview' : 'console');

  const hasPythonFile = useMemo(
    () => project.files.some((f) => f.language === 'python'),
    [project.files],
  );
  useEffect(() => {
    if (readOnly) return;
    if (!hasPythonFile) return;
    if (pyState.status === 'ready' || pyState.status === 'loading') return;
    loadPyodideSingleton().catch(() => {});
  }, [hasPythonFile, readOnly, pyState.status]);

  useEffect(() => {
    if (onProjectChange && project.id !== initial.id) onProjectChange(project);
    saveProject(project);
    broadcastLabSaved(project.id);
  }, [project, onProjectChange, initial.id]);

  const showPreview = !!previewHtml;
  useEffect(() => {
    if (showPreview && tab === 'console' && messages.length === 0) setTab('preview');
  }, [showPreview, tab, messages.length]);

  const onRun = async () => {
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
  };

  const onStop = () => {
    import('@/lib/lab/executionEngine').then((mod) => mod.stop());
    setIsRunning(false);
  };

  const onReset = () => setProject(initial);

  const onLanguageChange = (lang: LabProject['language']) => {
    setProject((p) => switchActiveFileLanguage(p, lang));
    setTab('console');
  };

  const handleAdd = () => {
    const name = window.prompt('اسم الملف الجديد (مثال: helper.js):', 'untitled.txt');
    if (!name) return;
    const next = addFile(project, { name, content: '' });
    setProject(next);
  };

  const handleClose = (fileId: string) => setProject(removeFile(project, fileId));
  const handleActivate = (fileId: string) => setProject(setActiveFile(project, fileId));
  const handleRename = (fileId: string, newName: string) => setProject(renameFile(project, fileId, newName));
  const handleDelete = (fileId: string) => setProject(removeFile(project, fileId));

  const handleEditorChange = (val: string) => {
    const activeFile = project.files.find((f) => f.id === project.activeId);
    if (!activeFile) return;
    setProject(setFileContent(project, activeFile.id, val));
  };

  const handleProjectLoaded = (p: LabProject) => setProject(p);

  const handleRetryPython = () => {
    resetPyodide();
    loadPyodideSingleton().catch(() => {});
  };

  const isPythonWorkspace = activeLang === 'python';
  const pythonReady = pyState.status === 'ready';
  const pythonLoading = isPythonWorkspace && pyState.status === 'loading';
  const pythonError = isPythonWorkspace && pyState.status === 'error';
  const runDisabled = isRunning || (isPythonWorkspace && !pythonReady);

  return (
    <div className={cn('flex flex-col h-full bg-background text-foreground lab-shell', className)} dir="ltr">
      {!hideToolbar && (
        <LabToolbar
          project={project}
          onRun={onRun}
          onStop={onStop}
          onReset={onReset}
          onFormat={() => {}}
          onProjectLoaded={handleProjectLoaded}
          isRunning={isRunning}
          runDisabled={runDisabled}
          runDisabledReason={
            pythonLoading
              ? `Python ${Math.round((pyState.progress || 0) * 100)}%`
              : pythonError
                ? 'فشل تحميل Python'
                : isPythonWorkspace && !pythonReady
                  ? 'انتظر Python…'
                  : undefined
          }
        />
      )}
      <div className="flex-1 min-h-0">
        <PanelGroup direction="horizontal" autoSaveId="lab-shell-h">
          {withFileExplorer && (
            <>
              <Panel defaultSize={18} minSize={12} className="bg-card border border-border rounded m-1">
                <FileExplorer
                  files={project.files}
                  activeId={project.activeId}
                  onActivate={handleActivate}
                  onAdd={handleAdd}
                  onRename={handleRename}
                  onDelete={handleDelete}
                />
              </Panel>
              <PanelResizeHandle className="w-1 hover:bg-primary/40" />
            </>
          )}
          <Panel defaultSize={withFileExplorer ? 50 : 60} minSize={30}>
            <div className="flex flex-col h-full m-1 rounded border border-border overflow-hidden bg-card">
              <FileTabs
                files={project.files}
                activeId={project.activeId}
                onActivate={handleActivate}
                onClose={handleClose}
                onAdd={handleAdd}
              />
              <LanguageSelector current={activeLang} onChange={onLanguageChange} showHint />
              <div className="flex-1 min-h-0">
                {active ? (
                  <MonacoEditor
                    value={active.content}
                    language={activeAdapter.meta.monacoLang}
                    readOnly={readOnly || active.readOnly}
                    fontSize={project.settings.fontSize}
                    wordWrap={project.settings.wordWrap}
                    tabSize={project.settings.tabSize}
                    minimap={project.settings.minimap}
                    onChange={handleEditorChange}
                  />
                ) : (
                  <div className="grid place-items-center h-full text-muted-foreground text-sm">
                    لا يوجد ملف مفتوح.
                  </div>
                )}
              </div>
            </div>
          </Panel>
          <PanelResizeHandle className="w-1 hover:bg-primary/40" />
          <Panel defaultSize={withFileExplorer ? 32 : 40} minSize={20} className="m-1">
            <div className="h-full flex flex-col bg-card border border-border rounded overflow-hidden">
              <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-muted/40 overflow-x-auto" dir="ltr">
                <OutputTab id="console" label="Console" active={tab === 'console'} onClick={() => setTab('console')} />
                {showPreview && <OutputTab id="preview" label="Preview" active={tab === 'preview'} onClick={() => setTab('preview')} />}
                <OutputTab id="output" label="Output" active={tab === 'output'} onClick={() => setTab('output')} />
                <OutputTab id="errors" label={`Errors${errors.length ? ' (' + errors.length + ')' : ''}`} active={tab === 'errors'} onClick={() => setTab('errors')} />
                <OutputTab id="logs" label="Logs" active={tab === 'logs'} onClick={() => setTab('logs')} />
              </div>
              <div className="flex-1 min-h-0 relative">
                {tab === 'console' && (
                  <ConsolePanel messages={messages} onClear={() => setMessages([])} />
                )}
                {tab === 'output' && <OutputPanel text={outputText} title="خرج التشغيل" />}
                {tab === 'errors' && <ErrorsPanel errors={errors} />}
                {tab === 'logs' && <LogsPanel messages={messages} />}
                {tab === 'preview' && showPreview && <PreviewPanel html={previewHtml} />}

                {isPythonWorkspace && !pythonReady && (
                  <div
                    className={cn(
                      'py-load-banner',
                      pythonError && 'py-load-banner-error',
                    )}
                    role="status"
                    aria-live="polite"
                  >
                    {pythonError ? (
                      <div className="flex items-center gap-2 text-xs">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span className="truncate">{pyState.message || 'تعذّر تحميل Python.'}</span>
                        <button onClick={handleRetryPython} className="py-load-retry-btn">
                          <RefreshCw className="w-3 h-3 ml-1" /> إعادة المحاولة
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                        <span>جاري تحميل Python… {Math.round((pyState.progress || 0) * 100)}%</span>
                        <span className="hidden sm:inline opacity-70 truncate">{pyState.message}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
      <StatusBar
        project={project}
        isRunning={isRunning}
        pyState={pyState}
        adapter={activeAdapter}
      />
    </div>
  );
}

function OutputTab({ id, label, active, onClick }: { id: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      data-tab={id}
      onClick={onClick}
      className={cn(
        'px-3 py-1 rounded text-xs font-bold border',
        active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground hover:bg-accent',
      )}
    >
      {label}
    </button>
  );
}

export function loadActiveProject(): LabProject | null {
  return getActiveProject();
}
