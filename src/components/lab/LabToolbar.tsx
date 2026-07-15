import { useRef } from 'react';
import {
  Play, Square, RotateCcw, Download, Upload, Copy, Share2, Sparkles, Loader2,
} from 'lucide-react';
import type { LabProject } from '@/lib/lab/types';
import { downloadProjectZip, importProjectFromZip } from '@/lib/lab/zip';
import { duplicateProject, getProject, updateProject } from '@/lib/lab/projectManager';
import { detectLanguageFromFilename, getLanguageDisplay } from '@/lib/lab/languages';

interface LabToolbarProps {
  project: LabProject;
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
  onFormat?: () => void;
  onProjectLoaded?: (p: LabProject) => void;
  isRunning: boolean;
  /** When true, the Run button is rendered as a non-actionable loading state. */
  runDisabled?: boolean;
  /** Reason shown as the disabled tooltip / aria-label, in Arabic. */
  runDisabledReason?: string;
}

/**
 * LabToolbar — Run / Stop / Reset / Format / Upload / Download /
 * Duplicate / Share surface. Designed for one-hand use on mobile with
 * ample touch targets (≥36 px) and short Arabic labels.
 *
 * The Run button:
 *   - Shows ▶ + "تشغيل" when ready.
 *   - Shows ⏹ + "إيقاف" while running.
 *   - Shows a Loader + reason text when the runtime is not ready
 *     (Python preloading) or the user clicks Stop.
 */
export function LabToolbar({
  project, onRun, onStop, onReset, onFormat,
  onProjectLoaded, isRunning, runDisabled, runDisabledReason,
}: LabToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = async () => {
    await downloadProjectZip(project);
  };
  const handleUploadClick = () => fileInputRef.current?.click();
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const { meta, files } = await importProjectFromZip(f);
      const updated: LabProject = {
        ...project,
        name: meta?.name ?? f.name.replace(/\.zip$/i, ''),
        description: meta?.description ?? project.description,
        settings: { ...project.settings, ...(meta?.settings ?? {}) },
        updatedAt: Date.now(),
      };
      // Replace files inline — language comes from the registry's
      // filename-extension map (single source of truth).
      updated.files = Object.entries(files).map(([name, content]) => ({
        id: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9._-]/g, ''),
        name,
        language: detectLanguageFromFilename(name) ?? project.language,
        content,
      }));
      if (updated.files.length === 0) {
        updated.files = project.files;
      }
      updated.activeId = updated.files[0].id;
      const saved = updateProject(updated, {});
      onProjectLoaded?.(saved);
    } catch (err) {
      alert('فشل استيراد الملف: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      e.target.value = '';
    }
  };
  const handleDuplicate = () => {
    const copy = duplicateProject(project);
    onProjectLoaded?.(copy);
  };
  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/lab/workspace/${project.id}`;
    try { await navigator.clipboard.writeText(url); } catch { /* fallback below */ }
    try {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch { /* ignore */ }
    alert('تم نسخ الرابط. Project id: ' + project.id);
  };

  const renderRunButton = () => {
    if (isRunning) {
      return (
        <button onClick={onStop} className="toolbar-btn toolbar-stop" title="إيقاف">
          <Square className="w-4 h-4" />
          <span className="text-xs font-bold">إيقاف</span>
        </button>
      );
    }
    if (runDisabled) {
      return (
        <button
          disabled
          aria-label={runDisabledReason ?? 'البيئة قيد التحميل'}
          className="toolbar-btn toolbar-loading"
        >
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
          <span className="text-xs font-bold">{runDisabledReason ?? 'جاري التحميل…'}</span>
        </button>
      );
    }
    return (
      <button onClick={onRun} className="toolbar-btn toolbar-run" title="تشغيل">
        <Play className="w-4 h-4" />
        <span className="text-xs font-bold">تشغيل</span>
      </button>
    );
  };

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-card">
      <div className="flex items-center gap-1.5">
        {renderRunButton()}
        <button onClick={onReset} className="toolbar-btn" title="إعادة تعيين">
          <RotateCcw className="w-4 h-4" />
        </button>
        <button onClick={() => onFormat?.()} className="toolbar-btn" title="تنسيق الكود">
          <Sparkles className="w-4 h-4" />
        </button>
        <span className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-muted text-muted-foreground" dir="ltr">
          <span>{getLanguageDisplay(project.language)}</span>
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={handleUploadClick} className="toolbar-btn" title="استيراد .zip" aria-label="استيراد .zip">
          <Upload className="w-4 h-4" />
          <input ref={fileInputRef} type="file" accept=".zip" className="hidden" onChange={handleUpload} />
        </button>
        <button onClick={handleDownload} className="toolbar-btn" title="تنزيل .zip" aria-label="تنزيل .zip">
          <Download className="w-4 h-4" />
        </button>
        <button onClick={handleDuplicate} className="toolbar-btn" title="نسخ المشروع">
          <Copy className="w-4 h-4" />
        </button>
        <button onClick={handleShare} className="toolbar-btn" title="مشاركة">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
