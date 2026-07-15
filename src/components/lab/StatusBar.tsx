import { useEffect, useState } from 'react';
import { Cloud, Loader2, Activity, AlertCircle, Cpu } from 'lucide-react';
import type { LabProject, LanguageAdapter } from '@/lib/lab/types';
import { LAB_SAVED_EVENT } from '@/lib/lab/storage';
import type { PyodideState } from '@/lib/lab/pyodideLoader';

interface StatusBarProps {
  project: LabProject;
  isRunning: boolean;
  pyState: PyodideState;
  adapter: LanguageAdapter;
}

/**
 * Bottom status bar — v2.
 *
 * Everything here is adapter-driven: the runtime badge reads
 * `adapter.meta.runtime`, the language pill reads `adapter.meta`.
 * Python-specific items (loader % ready / error / spinner) only render
 * when the active language is Python.
 */
export function StatusBar({ project, isRunning, pyState, adapter }: StatusBarProps) {
  const [savedTick, setSavedTick] = useState(0);

  useEffect(() => {
    const onSaved = (ev: Event) => {
      const ce = ev as CustomEvent<{ projectId: string }>;
      if (ce.detail?.projectId === project.id) setSavedTick((t) => t + 1);
    };
    window.addEventListener(LAB_SAVED_EVENT, onSaved);
    return () => window.removeEventListener(LAB_SAVED_EVENT, onSaved);
  }, [project.id]);

  const active = project.files.find((f) => f.id === project.activeId) ?? project.files[0];
  const activeAdapter = active ? adapter : adapter;

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-t border-border bg-card text-[11px] text-muted-foreground">
      <div className="flex items-center gap-3 min-w-0 overflow-hidden">
        <span className="font-mono font-bold truncate max-w-[200px] text-foreground">{project.name}</span>
        <span className="text-border">|</span>
        <span dir="ltr" className="font-mono truncate">{active?.name ?? '—'}</span>
        <span className="text-border">|</span>
        <span className="uppercase tracking-wider">{active?.language ?? '—'}</span>
        <span className="hidden md:inline text-border">|</span>
        <span className="hidden md:inline truncate max-w-[260px]">{activeAdapter.meta.description}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span
          dir="ltr"
          className="flex items-center gap-1 text-emerald-600"
          title={`آخر حفظ: tick #${savedTick}`}
        >
          <Cloud className="w-3 h-3" /> محفوظ تلقائيًا
        </span>

        {/* Runtime badge — driven by adapter.meta.runtime. */}
        {activeAdapter.meta.runtime === 'wasm-python' && (
          <PythonRuntimeBadge pyState={pyState} />
        )}
        {activeAdapter.meta.runtime && activeAdapter.meta.runtime !== 'wasm-python' && (
          <span dir="ltr" className="flex items-center gap-1 text-sky-600" title={activeAdapter.meta.runtime}>
            <Cpu className="w-3 h-3" />
            {activeAdapter.meta.executable ? 'runtime: ' + activeAdapter.meta.runtime : 'static'}
          </span>
        )}

        <span className={isRunning ? 'text-primary' : ''}>
          {isRunning ? 'قيد التشغيل…' : 'جاهز'}
        </span>
      </div>
    </div>
  );
}

function PythonRuntimeBadge({ pyState }: { pyState: PyodideState }) {
  if (pyState.status === 'ready') {
    return (
      <span
        dir="ltr"
        className="flex items-center gap-1 text-emerald-600"
        title="Python جاهز"
      >
        <Activity className="w-3 h-3" /> Python
      </span>
    );
  }
  if (pyState.status === 'error') {
    return (
      <span
        dir="ltr"
        className="flex items-center gap-1 text-rose-500"
        title={pyState.message || 'فشل تحميل Python'}
      >
        <AlertCircle className="w-3 h-3" /> Python: خطأ
      </span>
    );
  }
  if (pyState.status === 'loading') {
    const pct = Math.round((pyState.progress || 0) * 100);
    return (
      <span
        dir="ltr"
        className="flex items-center gap-1 text-amber-500"
        title={pyState.message}
      >
        <Loader2 className="w-3 h-3 animate-spin" /> Python {pct}%
      </span>
    );
  }
  return (
    <span
      dir="ltr"
      className="flex items-center gap-1 text-muted-foreground"
      title="Python لم يبدأ التحميل بعد"
    >
      Python…
    </span>
  );
}
