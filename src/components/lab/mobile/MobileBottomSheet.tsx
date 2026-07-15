import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * MobileBottomSheet — reusable slide-up modal used by Files, Settings,
 * and any other mobile overlay.
 *
 *   - Fixed 70vh height (taller option for long lists; default 60vh).
 *   - Drag handle at top — drag DOWN past a threshold to dismiss.
 *   - Backdrop tap also dismisses.
 *   - Escape key dismisses (desktop fallback path).
 *   - Locks body scroll while open.
 *   - Inert-safe: aria-labelledby + role="dialog".
 *
 * No external libraries: plain React + CSS transforms.
 */

interface MobileBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  /** Tailwind height class for the sheet content area (default 'h-[60vh]'). */
  sheetClassName?: string;
  children: React.ReactNode;
  /** Show a close button in the title bar (default true). */
  showClose?: boolean;
}

const DISMISS_THRESHOLD = 80; // px drag-down to dismiss
const SHEET_DEFAULT_HEIGHT = 'h-[60vh]';

export function MobileBottomSheet({
  open, onOpenChange, title, sheetClassName, children, showClose = true,
}: MobileBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState<number>(0);
  const dragStartY = useRef<number | null>(null);
  const dragging = useRef<boolean>(false);

  // Lock body scroll when open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Escape-to-dismiss (desktop users may resize into the breakpoint).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (!sheetRef.current) return;
    // Don't allow drag-to-dismiss unless the content is scrolled to top
    // (so users can still scroll long lists without accidentally closing).
    const scrollable = sheetRef.current.querySelector('[data-sheet-scrollable]') as HTMLElement | null;
    if (scrollable && scrollable.scrollTop > 0) {
      dragStartY.current = null;
      return;
    }
    dragStartY.current = e.touches[0].clientY;
    dragging.current = true;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null || !dragging.current) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    if (dy > 0) setDragY(dy);
  };
  const onTouchEnd = () => {
    dragging.current = false;
    if (dragY > DISMISS_THRESHOLD) {
      onOpenChange(false);
    }
    setDragY(0);
    dragStartY.current = null;
  };

  return (
    <div
      className={cn(
        'mobile-sheet-root',
        open ? 'mobile-sheet-visible' : 'mobile-sheet-hidden',
      )}
      role="dialog"
      aria-modal={open}
      aria-hidden={!open}
    >
      <div
        className="mobile-sheet-backdrop"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={sheetRef}
        className={cn(
          'mobile-sheet-panel',
          sheetClassName ?? SHEET_DEFAULT_HEIGHT,
        )}
        style={{ transform: open ? `translateY(${dragY}px)` : undefined }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="mobile-sheet-handle" aria-hidden="true">
          <span />
        </div>
        {(title || showClose) && (
          <div className="mobile-sheet-titlebar">
            <h3 className="text-base font-bold m-0">{title}</h3>
            {showClose && (
              <button
                type="button"
                aria-label="إغلاق"
                className="mobile-sheet-close"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        <div data-sheet-scrollable className="mobile-sheet-content">
          {children}
        </div>
      </div>
    </div>
  );
}
