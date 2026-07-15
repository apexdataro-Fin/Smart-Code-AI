import { MonacoEditor } from '../MonacoEditor';
import type { LanguageId, LabSettings } from '@/lib/lab/types';
import { getMonacoLang } from '@/lib/lab/registry';

/**
 * MobileEditor v4 — Monaco wrapper for the new phone-first IDE layout.
 *
 *   - Renders Monaco in `LTR/isolate` so RTL page text does not reorder
 *     Python tokens.
 *   - Uses `touch-action: manipulation` so taps register fast.
 *   - Sets `--vvh` aware `cursorSurroundingLines` so the active line is
 *     always visible even when the on-screen keyboard pushes content
 *     up.
 *   - Word-wrap / line numbers apply per `LabSettings`.
 *
 * In v4, the action bar is always visible (no focus-mode hiding needed),
 * so this wrapper is simpler than v3: no focus/maximize callbacks.
 */

interface MobileEditorProps {
  value: string;
  language: LanguageId;
  settings: LabSettings;
  readOnly?: boolean;
  onChange: (val: string) => void;
}

export function MobileEditor({ value, language, settings, readOnly, onChange }: MobileEditorProps) {
  return (
    <div
      className="mobile-editor-host"
      dir="ltr"
      lang="en"
      style={{ unicodeBidi: 'isolate', touchAction: 'manipulation' }}
    >
      <MonacoEditor
        value={value}
        language={getMonacoLang(language)}
        readOnly={readOnly}
        theme="auto"
        fontSize={settings.fontSize}
        wordWrap={settings.wordWrap}
        tabSize={settings.tabSize}
        minimap={false}
        onChange={(v) => onChange(v ?? '')}
        onMount={(editor) => {
          try {
            editor.updateOptions({
              lineNumbers: settings.lineNumbers ? 'on' : 'off',
              wordWrap: settings.softWrap ? 'bounded' : 'off',
              // Make the active cursor line stay visible when the on-screen
              // keyboard pushes the editor up.
              cursorSurroundingLines: 8,
              cursorSurroundingLinesStyle: 'default',
              scrollBeyondLastLine: false,
              fixedOverflowWidgets: true,
            });
          } catch { /* noop */ }
        }}
      />
    </div>
  );
}
