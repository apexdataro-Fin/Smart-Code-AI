import { lazy, Suspense, useEffect, useState } from 'react';
import { isTouchPrimaryDevice } from '@/lib/lab/mobileDetect';

/**
 * Lazy-loaded Monaco editor. The actual `@monaco-editor/react` library is
 * only fetched the FIRST time a Lab route mounts, keeping the homepage
 * bundle untouched.
 *
 * Configuration:
 *   - `loader.config({ paths })` points Monaco at the jsdelivr CDN so it
 *     resolves cross-origin, avoiding GitHub Pages worker 404s.
 *
 * Isolation:
 *   - The editor is wrapped in a div with explicit `dir="ltr"` and
 *     `unicode-bidi: isolate` so embedded Latin tokens don't get
 *     reordered by the RTL page.
 *
 * Touch mode (v4):
 *   - Detect touch-only devices via `(pointer: coarse) and (hover: none)`.
 *   - On touch devices, disable Monaco's desktop context menu (Command
 *     Palette / Change All Occurrences / etc.) so the native iOS/Android
 *     long-press selection handles work.
 *   - Same flip also disables hover-docs, occurrences highlight, line-
 *     number-tap selection, and middle-click paste — all desktop-only.
 *   - Desktop is unchanged.
 *
 * Theme:
 *   - Toggles `vs-dark` vs `vs` based on the document's `.dark` class so
 *     light / dark mode works out of the box.
 */

// Configure Monaco loader once, globally, BEFORE the lazy import resolves.
// Using jsdelivr (cross-origin) so GitHub Pages (which can't serve the
// monaco workers themselves) works without 404s.
const MONACO_VERSION = '0.52.2';
const MONACO_CDN = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs`;

const Editor = lazy(async () => {
  const monacoMod = await import('@monaco-editor/react');
  // Once the module is loaded, configure the loader for the CDN.
  monacoMod.loader.config({
    paths: { vs: MONACO_CDN },
  });
  return { default: monacoMod.default };
});

export interface MonacoEditorProps {
  value: string;
  language: string;
  readOnly?: boolean;
  theme?: 'auto' | 'light' | 'dark';
  fontSize?: number;
  wordWrap?: boolean;
  tabSize?: number;
  minimap?: boolean;
  height?: number | string;
  onChange?: (value: string) => void;
  onMount?: (editor: any, monaco: any) => void;
}

export function MonacoEditor(props: MonacoEditorProps) {
  const [effectiveTheme, setEffectiveTheme] = useState<'vs' | 'vs-dark'>(() => {
    if (typeof document === 'undefined') return 'vs';
    return document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs';
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const update = () => setEffectiveTheme(root.classList.contains('dark') ? 'vs-dark' : 'vs');
    // React to dark toggle by observing class attribute.
    const obs = new MutationObserver(update);
    obs.observe(root, { attributes: true, attributeFilter: ['class'] });
    update();
    return () => obs.disconnect();
  }, []);

  const theme = props.theme === 'light' ? 'vs' : props.theme === 'dark' ? 'vs-dark' : effectiveTheme;

  return (
    <div
      className="h-full w-full lab-monaco-host"
      dir="ltr"
      lang="en"
      style={{ unicodeBidi: 'isolate' }}
    >
      <Suspense fallback={<EditorSkeleton />}>
        <Editor
          value={props.value}
          language={props.language}
          theme={theme}
          options={{
            readOnly: props.readOnly ?? false,
            fontSize: props.fontSize ?? 14,
            wordWrap: props.wordWrap ? 'on' : 'off',
            tabSize: props.tabSize ?? 2,
            minimap: { enabled: props.minimap ?? false },
            automaticLayout: true,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            renderLineHighlight: 'line',
            scrollBeyondLastLine: false,
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true, indentation: true },
            mouseWheelZoom: false,
            quickSuggestions: { other: true, comments: false, strings: true },
            padding: { top: 12, bottom: 12 },
          }}
          onChange={(v) => props.onChange?.(v ?? '')}
          onMount={(editor, monaco) => {
            try {
              editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {});
            } catch { /* ignore */ }

            // Mobile UX flip — only on touch-only devices.
            // (pointer: coarse) is true on phones/tablets; (hover: none)
            // is true when no mouse pointer is attached. Both required
            // so iPad-with-Magic-Keyboard keeps the desktop feature set.
            if (isTouchPrimaryDevice()) {
              try {
                editor.updateOptions({
                  // Kill Monaco's desktop context menu so the native OS
                  // long-press selection handles (Copy / Cut / Paste)
                  // appear instead.
                  contextmenu: false,
                  // Touch has no hover; lingering tooltip chrome is noise.
                  hover: { enabled: false },
                  // Stops "Change All Occurrences" word-highlight that
                  // visually clutters touch selection.
                  occurrencesHighlight: 'off',
                  // Tap on line number → don't accidentally select whole line.
                  selectOnLineNumbers: false,
                  // Disable the desktop middle-click paste clipboard.
                  selectionClipboard: false,
                });
              } catch { /* noop */ }
            }

            props.onMount?.(editor, monaco);
          }}
          loading={<EditorSkeleton />}
        />
      </Suspense>
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div
      className="h-full w-full grid place-items-center bg-muted/40 text-muted-foreground text-sm"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-2">
        <div className="h-5 w-5 rounded-full border-2 border-primary border-r-transparent animate-spin" />
        <span>يتم تحميل المحرّر…</span>
      </div>
    </div>
  );
}
