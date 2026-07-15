import { Play, Square, RotateCcw, FolderOpen, Settings, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * MobileRunBar — toolbar with 5 actions: Run · Stop · Reset · Files · Settings.
 *
 * Placement:
 *   - 'bottom' (default): the original sticky-bottom strip — kept for
 *     back-compat and the desktop-augmented mobile shell. Uses
 *     `position: absolute; bottom: 0` plus safe-area-inset-bottom.
 *   - 'top': sits inside the mobile IDE's 2-row top header strip. CSS
 *     uses `mobile-runbar-top` to opt out of absolute positioning and
 *     safe-area-inset-bottom (the strip now lives at the top of the
 *     viewport, where safe-area is moot).
 *
 *   - Run button shows the spinner + Python progress text when Python
 *     is still loading.
 *   - On Python error we surface a small inline Retry alongside Run.
 *   - 56–60 px tall hit targets on bottom; ~44 px on top to fit the
 *     2-row header.
 */

interface MobileRunBarProps {
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
  onOpenFiles: () => void;
  onOpenSettings: () => void;
  /** Set when the active language is Python and we're still loading. */
  pythonLoading?: boolean;
  /** Show Python loading percent on the Run button (0..100). */
  pythonPercent?: number;
  /** True when Python failed to load. */
  pythonError?: boolean;
  /** Retry handler for Python load. */
  onRetryPython?: () => void;
  /** Disable Run until env ready. */
  runDisabled?: boolean;
  /** 'top' = inside the new mobile IDE header strip; 'bottom' = absolute. */
  placement?: 'top' | 'bottom';
}

export function MobileRunBar({
  isRunning, onRun, onStop, onReset,
  onOpenFiles, onOpenSettings,
  pythonLoading, pythonPercent, pythonError, onRetryPython,
  runDisabled,
  placement = 'bottom',
}: MobileRunBarProps) {
  const renderRun = () => {
    if (isRunning) {
      return (
        <button onClick={onStop} className="mobile-run-btn mobile-run-stop" aria-label="إيقاف">
          <Square className="w-4 h-4" />
          <span>إيقاف</span>
        </button>
      );
    }
    if (runDisabled && pythonLoading) {
      return (
        <button className="mobile-run-btn mobile-run-loading" disabled aria-label={`جاري تحميل Python ${pythonPercent ?? 0}%`}>
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
          <span>Python {pythonPercent ?? 0}%</span>
        </button>
      );
    }
    if (runDisabled && pythonError && onRetryPython) {
      return (
        <button onClick={onRetryPython} className="mobile-run-btn mobile-run-error" aria-label="إعادة تحميل Python">
          <RefreshCw className="w-4 h-4" />
          <span>إعادة Python</span>
        </button>
      );
    }
    return (
      <button
        onClick={onRun}
        disabled={runDisabled}
        className="mobile-run-btn mobile-run-go"
        aria-label="تشغيل"
      >
        <Play className="w-4 h-4" />
        <span>تشغيل</span>
      </button>
    );
  };

  return (
    <div
      className={cn('mobile-runbar', placement === 'top' && 'mobile-runbar-top')}
      data-placement={placement}
      role="toolbar"
      dir="ltr"
    >
      {renderRun()}
      <button onClick={onReset} className="mobile-action-btn" aria-label="إعادة تعيين">
        <RotateCcw className="w-5 h-5" />
      </button>
      {pythonError && (
        <span className="mobile-run-error-dot" aria-label="Python فشل">
          <AlertCircle className="w-4 h-4 text-rose-500" />
        </span>
      )}
      <button onClick={onOpenFiles} className="mobile-action-btn" aria-label="الملفات">
        <FolderOpen className="w-5 h-5" />
      </button>
      <button onClick={onOpenSettings} className="mobile-action-btn" aria-label="الإعدادات">
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
}
export const MOBILE_RUNBAR_HEIGHT = 60;
