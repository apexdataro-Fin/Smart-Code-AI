import { useEffect, useRef, useState, useCallback } from 'react';
import { Maximize2, Minimize2, RotateCw, Smartphone, Tablet, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * MobilePreviewFrame — immersive preview with:
 *   - Device frame options: Phone / Tablet / Desktop.
 *   - Rotation (landscape ⇄ portrait).
 *   - Fullscreen toggle.
 *   - Pinch-to-zoom + pan via PointerEvents (not native browser default —
 *     native zoom leaks to the parent on iOS Safari).
 *   - Pull-to-refresh: pulling down near the top + threshold triggers a
 *     reload.
 *
 * The PointerEvents-based zoom traps gestures inside the wrapper so iOS
 * Safari doesn't zoom the entire Smart Code Lab layout.
 */

interface MobilePreviewFrameProps {
  /** The HTML/iframe source — full document string. */
  html: string;
}

type DeviceKind = 'phone' | 'tablet' | 'desktop';

interface DeviceSpec { w: number; h: number; label: string; icon: 'phone'|'tablet'|'monitor' }

const DEVICES: Record<DeviceKind, DeviceSpec> = {
  phone:  { w: 375, h: 720, label: 'هاتف', icon: 'phone' },
  tablet: { w: 820, h: 1180, label: 'لوحي', icon: 'tablet' },
  desktop: { w: 1280, h: 800, label: 'حاسوب', icon: 'monitor' },
};

interface Point { x: number; y: number }

export function MobilePreviewFrame({ html }: MobilePreviewFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [device, setDevice] = useState<DeviceKind>('phone');
  const [landscape, setLandscape] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  // Pinch state (PointerEvents-based so iOS Safari doesn't leak zoom).
  const pointers = useRef<Map<number, Point>>(new Map());
  const startPinchDist = useRef<number | null>(null);
  const startScale = useRef<number>(1);
  const startTx = useRef<number>(0);
  const startTy = useRef<number>(0);
  const moved = useRef<{ x: number; y: number } | null>(null);

  // Pull-to-refresh state.
  const pullStart = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);

  /* ---- iframe html sync ---- */
  useEffect(() => {
    if (!iframeRef.current || !html) return;
    iframeRef.current.srcdoc = html;
  }, [html]);

  /* ---- PointerEvents: pinch + pan ---- */
  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      startPinchDist.current = dist(pointers.current);
      startScale.current = scale;
      startTx.current = tx;
      startTy.current = ty;
    } else if (pointers.current.size === 1) {
      moved.current = { x: e.clientX, y: e.clientY };
      if (frameRef.current && frameRef.current.scrollTop <= 0) {
        pullStart.current = e.clientY;
      }
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && startPinchDist.current !== null) {
      const d = dist(pointers.current);
      const ratio = d / startPinchDist.current;
      const next = clamp(startScale.current * ratio, 0.5, 3);
      setScale(next);
    } else if (pointers.current.size === 1 && moved.current) {
      const dx = e.clientX - moved.current.x;
      const dy = e.clientY - moved.current.y;
      moved.current = { x: e.clientX, y: e.clientY };
      if (startPinchDist.current === null) {
        setTx((s) => clampPan(s + dx, scale, 0));
        setTy((s) => clampPan(s + dy, scale, 1));
        if (pullStart.current !== null && frameRef.current && frameRef.current.scrollTop <= 0) {
          setPullDistance((pd) => Math.max(0, pd + dy));
        }
      }
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) startPinchDist.current = null;
    if (pointers.current.size === 0) {
      moved.current = null;
      if (pullStart.current !== null && pullDistance > 80) {
        if (iframeRef.current) iframeRef.current.srcdoc = html;
      }
      pullStart.current = null;
      setPullDistance(0);
    }
  };

  /* ---- keyboard zoom on fullscreen ---- */
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
      if (e.key === '+' || e.key === '=') setScale((s) => clamp(s + 0.1, 0.5, 3));
      if (e.key === '-') setScale((s) => clamp(s - 0.1, 0.5, 3));
      if (e.key === '0') { setScale(1); setTx(0); setTy(0); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen, html]);

  const reload = useCallback(() => {
    if (!iframeRef.current) return;
    iframeRef.current.srcdoc = html;
  }, [html]);

  // Dimensions for the device frame.
  const spec = DEVICES[device];
  const frameW = landscape ? spec.h : spec.w;
  const frameH = landscape ? spec.w : spec.h;

  if (!html) {
    return (
      <div className="mobile-preview-empty">
        لا توجد معاينة لهذه اللغة. جرّب HTML أو CSS أو JavaScript.
      </div>
    );
  }

  return (
    <div className={cn('mobile-preview', fullscreen && 'mobile-preview-fullscreen')} dir="ltr">
      <div className="mobile-preview-toolbar" dir="rtl">
        <div className="mobile-preview-device-toggle">
          <button type="button" className={cn('mobile-preview-dev-btn', device==='phone' && 'mobile-preview-dev-active')} onClick={() => setDevice('phone')} aria-pressed={device==='phone'} aria-label="إطار هاتف">
            <Smartphone className="w-4 h-4" /><span>هاتف</span>
          </button>
          <button type="button" className={cn('mobile-preview-dev-btn', device==='tablet' && 'mobile-preview-dev-active')} onClick={() => setDevice('tablet')} aria-pressed={device==='tablet'} aria-label="إطار لوحي">
            <Tablet className="w-4 h-4" /><span>لوحي</span>
          </button>
          <button type="button" className={cn('mobile-preview-dev-btn', device==='desktop' && 'mobile-preview-dev-active')} onClick={() => setDevice('desktop')} aria-pressed={device==='desktop'} aria-label="إطار حاسوب">
            <Monitor className="w-4 h-4" /><span>حاسوب</span>
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className="mobile-output-tool-btn" onClick={() => setLandscape((l) => !l)} aria-label="تدوير" title="تدوير">
            <RotateCw className={"w-4 h-4 " + (landscape ? "rotate-90" : "")} />
          </button>
          <button type="button" className="mobile-output-tool-btn" onClick={() => setFullscreen((f) => !f)} aria-label="ملء الشاشة" title="ملء الشاشة">
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Pull-to-refresh indicator */}
      {pullDistance > 8 && (
        <div className="mobile-ptr-indicator" style={{ height: pullDistance + 'px' }}>
          {pullDistance > 80 ? '↻ حرر للتحديث' : 'اسحب للأسفل…'}
        </div>
      )}

      <div className="mobile-preview-canvas" ref={frameRef}>
        <div
          className="mobile-preview-frame-shadow"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            width: frameW + 'px',
            height: frameH + 'px',
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            transformOrigin: 'center center',
            touchAction: 'none',
          }}
        >
          <iframe
            ref={iframeRef}
            title="Smart Code Lab Preview"
            sandbox="allow-scripts"
            className="mobile-preview-iframe"
            style={{ width: frameW + 'px', height: frameH + 'px' }}
          />
        </div>
      </div>
    </div>
  );
}

function dist(set: Map<number, Point>): number {
  const a = Array.from(set.values());
  if (a.length < 2) return 0;
  return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
}
function clamp(n: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, n)); }
function clampPan(v: number, scale: number, axis: 0|1) {
  // Soft limits — cap at 50vw / vh so we don't lose the iframe off screen.
  const cap = axis === 0 ? window.innerWidth * 0.5 * (scale - 1) : window.innerHeight * 0.5 * (scale - 1);
  return clamp(v, -cap, cap);
}
