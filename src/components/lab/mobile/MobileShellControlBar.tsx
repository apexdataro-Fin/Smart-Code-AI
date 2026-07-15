import {
  Play,
  Square,
  RotateCcw,
  FolderOpen,
  Settings,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  useMobileLabControlsSnapshot,
} from './MobileLabControlsBridge';

type IconBtnProps = {
  onClick?: () => void;
  disabled?: boolean;
  'aria-label': string;
  variant?: 'primary' | 'danger' | 'loading' | 'error' | 'ghost';
  children: React.ReactNode;
};

/**
 * Small → tiny icon-only button tuned for the global Shell header on
 * mobile. Uses `w-8 h-8` (32 px) tap target. CSS lives in index.css.
 */
function ShellIconBtn({
  onClick,
  disabled,
  'aria-label': ariaLabel,
  variant = 'ghost',
  children,
}: IconBtnProps) {
  const className = `shell-icon-btn shell-icon-btn-${variant}`;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </button>
  );
}

/**
 * MobileShellControlBar — the Lab's Run · Reset · Files · Settings
 * rendered INTO the global Shell header (mobile + /lab/* ONLY).
 *
 * Pulls its handlers + state from the singleton bridge written by
 * MobileLabRoot. Renders `null` whenever the bridge has no snapshot
 * (i.e. before MobileLabRoot mounted or after the user left /lab/*).
 *
 * Visible only when `useIsMobile()` + the parent route check return
 * true — the parent `Shell` renders this component itself under those
 * conditions, so we don't double-gate here. We only bail on `null`
 * snapshot.
 */
export function MobileShellControlBar() {
  const snap = useMobileLabControlsSnapshot();

  /* No Lab mounted → render nothing. */
  if (!snap) return null;

  /* Pick the Run-button variant + content from snapshot state. */
  const renderRun = () => {
    if (snap.isRunning) {
      return (
        <ShellIconBtn
          onClick={snap.onStop}
          aria-label="إيقاف"
          variant="danger"
        >
          <Square className="w-4 h-4" />
        </ShellIconBtn>
      );
    }
    if (snap.runDisabled && snap.pythonLoading) {
      return (
        <ShellIconBtn
          disabled
          aria-label={`جاري تحميل Python ${snap.pythonPercent}%`}
          variant="loading"
        >
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
        </ShellIconBtn>
      );
    }
    if (snap.runDisabled && snap.pythonError && snap.onRetryPython) {
      return (
        <ShellIconBtn
          onClick={snap.onRetryPython}
          aria-label="إعادة تحميل Python"
          variant="error"
        >
          <RefreshCw className="w-4 h-4" />
        </ShellIconBtn>
      );
    }
    return (
      <ShellIconBtn
        onClick={snap.onRun}
        disabled={snap.runDisabled}
        aria-label="تشغيل"
        variant="primary"
      >
        <Play className="w-4 h-4" />
      </ShellIconBtn>
    );
  };

  return (
    <div
      className="mobile-shell-control-bar"
      role="toolbar"
      aria-label="أدوات المختبر"
    >
      {renderRun()}
      <ShellIconBtn onClick={snap.onReset} aria-label="إعادة تعيين">
        <RotateCcw className="w-4 h-4" />
      </ShellIconBtn>
      {snap.pythonError && (
        <span className="mobile-run-error-dot" aria-label="Python فشل">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
        </span>
      )}
      <ShellIconBtn onClick={snap.onOpenFiles} aria-label="الملفات">
        <FolderOpen className="w-4 h-4" />
      </ShellIconBtn>
      <ShellIconBtn
        onClick={snap.onOpenSettings}
        aria-label="الإعدادات"
      >
        <Settings className="w-4 h-4" />
      </ShellIconBtn>
    </div>
  );
}
