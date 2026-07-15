import { useEffect, useRef } from 'react';
import { GripHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * DragDivider v4 — vertical drag handle between dynamic viewer (top)
 * and the Monaco editor (bottom).
 *
 *   - PointerEvents-based for unified mouse + touch + pen handling.
 *   - 18 px hit zone centred on a 32×4 px visual grip.
 *   - `setPointerCapture` so the drag survives the cursor leaving
 *     the 18 px hit zone.
 *   - Reports ratio up via `onRatioChange`.
 *   - Reports `dragging` boolean via `onDraggingChange` so the
 *     parent can suppress pointer-events on the editor + viewer
 *     (otherwise Monaco eats the pointermove and the drag breaks).
 */

interface DragDividerProps {
  ratio: number;
  onRatioChange: (ratio: number) => void;
  onDraggingChange?: (dragging: boolean) => void;
  minRatio: number;
  maxRatio: number;
  disabled?: boolean;
}

export function DragDivider({ ratio, onRatioChange, onDraggingChange, minRatio, maxRatio, disabled }: DragDividerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef<boolean>(false);
  const startY = useRef<number>(0);
  const startRatio = useRef<number>(ratio);

  useEffect(() => {
    if (!dragging.current) startRatio.current = ratio;
  }, [ratio]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    if (!ref.current) return;
    dragging.current = true;
    startY.current = e.clientY;
    startRatio.current = ratio;
    try {
      ref.current.setPointerCapture(e.pointerId);
    } catch { /* noop */ }
    document.body.style.touchAction = 'none';
    document.body.style.userSelect = 'none';
    onDraggingChange?.(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    if (typeof window === 'undefined') return;
    const totalH = window.innerHeight;
    if (totalH <= 0) return;
    const dy = e.clientY - startY.current;
    const dRatio = dy / totalH;
    const next = clamp(startRatio.current + dRatio, minRatio, maxRatio);
    if (Math.abs(next - ratio) > 0.002) onRatioChange(next);
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!ref.current) return;
    if (dragging.current && ref.current.hasPointerCapture(e.pointerId)) {
      try { ref.current.releasePointerCapture(e.pointerId); } catch { /* noop */ }
    }
    if (dragging.current) {
      dragging.current = false;
      document.body.style.touchAction = '';
      document.body.style.userSelect = '';
      onDraggingChange?.(false);
    }
  };

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="horizontal"
      aria-label="تغيير حجم المعاينة والمحرر"
      aria-valuenow={Math.round(ratio * 100)}
      aria-valuemin={Math.round(minRatio * 100)}
      aria-valuemax={Math.round(maxRatio * 100)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={cn('mobile-divider', disabled && 'mobile-divider-disabled')}
      data-dragging={dragging.current ? 'true' : 'false'}
    >
      <div className="mobile-divider-handle" aria-hidden="true">
        <GripHorizontal className="w-4 h-4 opacity-60" />
      </div>
    </div>
  );
}

function clamp(n: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, n)); }
