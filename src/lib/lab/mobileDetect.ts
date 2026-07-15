import { useEffect, useState } from 'react';

/**
 * Mobile-first detection hook.
 *
 *   - PRIMARY: `window.matchMedia('(max-width: 768px)')` so the
 *     detection follows the actual viewport at runtime (resize + rotate).
 *   - SECONDARY: user-agent sniff to catch tablets that lie about width
 *     when portrait.
 *   - SSR-safe: returns `false` on the server until hydrated.
 *
 * Why we don't trust UA alone:
 *   - On a foldable in laptop posture, UA says mobile but viewport says desktop.
 *   - On an iPad in portrait, UA says mobile.
 */

export const MOBILE_BREAKPOINT = 768; // matches Tailwind's `md` boundary.

export function checkIsMobile(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia && window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches) {
    return true;
  }
  if (window.matchMedia && window.matchMedia('(max-width: 820px)').matches) {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const isHov = window.matchMedia('(hover: none)').matches;
    if (isTouch && isHov) return true;
  }
  const ua = (navigator.userAgent || '').toLowerCase();
  if (/iphone|ipod|android.*mobile|mobile.*android|blackberry|windows phone|opera mini/i.test(ua)) {
    return true;
  }
  return false;
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => checkIsMobile());

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const evalMobile = () => setIsMobile(checkIsMobile());
    if ('addEventListener' in query) {
      query.addEventListener('change', evalMobile);
      evalMobile();
      return () => query.removeEventListener('change', evalMobile);
    }
    // @ts-expect-error addListener is deprecated but still present on old Safari.
    query.addListener(evalMobile);
    evalMobile();
    return () => {
      // @ts-expect-error — see above
      query.removeListener(evalMobile);
    };
  }, []);

  return isMobile;
}

export function useIsLandscape(): boolean {
  const [isLandscape, setIsLandscape] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(orientation: landscape)').matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(orientation: landscape)');
    const update = () => setIsLandscape(query.matches);
    if ('addEventListener' in query) query.addEventListener('change', update);
    update();
    return () => {
      if ('removeEventListener' in query) query.removeEventListener('change', update);
    };
  }, []);
  return isLandscape;
}

/* =============================================================================
 * Touch device detection (Monaco v4 mobile UX)
 *
 * `useIsMobile()` is WIDTH-based — it captures layout decisions. But the
 * Monaco touch-mode flip depends on the *input device*, not on the screen
 * size. A Surface Pro with no Type Cover may have pointer: coarse even when
 * the layout is wide; an iPad with Magic Keyboard has pointer: fine.
 *
 * Helper: `isTouchPrimaryDevice()` returns true only when the device is
 * touch-only — `(pointer: coarse)` AND `(hover: none)`. This excludes
 * tablets with mouse pointers and desktop touchscreens with attached
 * peripherals.
 *
 * `useTouchMode()` runs the same check as a React state so consumers can
 * branch (the MonacoEditor path only needs sync detection in onMount, so
 * the synchronous helper is the primary API; the hook is provided for
 * components that want to re-render on orientation/peripheral changes).
 * =========================================================================== */

export function isTouchPrimaryDevice(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  // Both conditions must be true: a fine pointer (mouse) overrides touch.
  return (
    window.matchMedia('(pointer: coarse)').matches &&
    window.matchMedia('(hover: none)').matches
  );
}

export function useTouchMode(): boolean {
  const [touch, setTouch] = useState<boolean>(() => isTouchPrimaryDevice());
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const q1 = window.matchMedia('(pointer: coarse)');
    const q2 = window.matchMedia('(hover: none)');
    const update = () => setTouch(isTouchPrimaryDevice());
    if ('addEventListener' in q1) q1.addEventListener('change', update);
    if ('addEventListener' in q2) q2.addEventListener('change', update);
    update();
    return () => {
      if ('removeEventListener' in q1) q1.removeEventListener('change', update);
      if ('removeEventListener' in q2) q2.removeEventListener('change', update);
    };
  }, []);
  return touch;
}

/* =============================================================================
 * Visual Viewport helpers (Mobile v4)
 *
 * Two CSS custom properties are set on <html>:
 *   --vvh: viewport height NOT counting the on-screen keyboard.
 *         Equivalent to `100dvh` while keyboard is closed; shrinks when
 *         keyboard opens.
 *   --vvw: viewport width (constant per orientation).
 *
 * `keyboardOpen` flips to true when `window.innerHeight - visualViewport.height`
 * exceeds ~120px (a reasonable keyboard-ignoring threshold). This avoids
 * reacting to URL-bar collapses / Tab switcher overlays.
 *
 * ResizeObserver is preferred over the deprecated `resize` event on the
 * window. It tracks the visualViewport at 60 fps without scroll-jank.
 * =========================================================================== */

const KEYBOARD_THRESHOLD_PX = 120;

interface ViewportUnits {
  /** Current visual viewport height in pixels (excludes on-screen keyboard). */
  vh: number;
  /** Current visual viewport width in pixels. */
  vw: number;
  /** True when the on-screen keyboard is plausibly open. */
  keyboardOpen: boolean;
  /** True when the user has just rotated the device (width swap). */
  rotated: boolean;
}

/**
 * useViewportUnits — observes `window.visualViewport` and propagates its
 * dimensions as a CSS custom property on <html>. Call site: once in
 * MobileLabRoot.
 */
export function useViewportUnits(): ViewportUnits {
  const [units, setUnits] = useState<ViewportUnits>(() => readViewport());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const initial = readViewport();
    setUnits(initial);
    applyCssVars(initial);

    const vv = window.visualViewport;
    if (!vv) return;

    // visualViewport fires its own `resize` event when the keyboard
    // opens / closes or the device rotates. ResizeObserver doesn't
    // work because VisualViewport isn't an Element.
    let lastWidth = vv.width || 0;
    const onViewportChange = () => {
      const next = readViewport();
      next.rotated = Math.abs(next.vw - lastWidth) > 0.5 ? false : units.rotated;
      lastWidth = next.vw;
      setUnits(next);
      applyCssVars(next);
    };
    vv.addEventListener('resize', onViewportChange);
    window.addEventListener('orientationchange', onViewportChange);
    return () => {
      vv.removeEventListener('resize', onViewportChange);
      window.removeEventListener('orientationchange', onViewportChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return units;
}

function readViewport(): ViewportUnits {
  if (typeof window === 'undefined') {
    return { vh: 0, vw: 0, keyboardOpen: false, rotated: false };
  }
  const vv = window.visualViewport;
  const vh = vv ? Math.max(120, Math.round(vv.height)) : window.innerHeight;
  const vw = vv ? Math.round(vv.width) : window.innerWidth;
  const layoutH = window.innerHeight;
  const keyboardOpen = layoutH - vh > KEYBOARD_THRESHOLD_PX;
  return { vh, vw, keyboardOpen, rotated: false };
}

function applyCssVars(u: ViewportUnits) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--vvh', `${u.vh}px`);
  root.style.setProperty('--vvw', `${u.vw}px`);
  root.dataset.keyboard = u.keyboardOpen ? 'open' : 'closed';
}
