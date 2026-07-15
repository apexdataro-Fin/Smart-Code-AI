import type { LabSettings } from '@/lib/lab/types';

/**
 * MobileSettingsSheet — settings as a bottom sheet on phones.
 *
 *   - Font size — −/+ buttons (limited to 12..22 px for readability).
 *   - Tab size — 2 / 4 / 8 buttons.
 *   - Word wrap, soft wrap, line numbers — toggle rows.
 *   - Theme — Auto / Light / Dark (auto = follows the system).
 */

interface MobileSettingsSheetProps {
  settings: LabSettings;
  onChange: (next: Partial<LabSettings>) => void;
  onResetDefaults: () => void;
}

export function MobileSettingsSheet({ settings, onChange, onResetDefaults }: MobileSettingsSheetProps) {
  return (
    <div dir="rtl" className="mobile-settings-sheet">
      <p className="text-xs text-muted-foreground mb-3">الإعدادات تطبَّق فورًا وتُحفظ تلقائيًا.</p>

      {/* Font size */}
      <Row title="حجم الخط في المحرر">
        <div className="mobile-stepper">
          <button type="button" aria-label="تصغير" onClick={() => onChange({ fontSize: Math.max(12, settings.fontSize - 1) })} className="mobile-stepper-btn">−</button>
          <span className="mobile-stepper-value">{settings.fontSize}</span>
          <button type="button" aria-label="تكبير" onClick={() => onChange({ fontSize: Math.min(22, settings.fontSize + 1) })} className="mobile-stepper-btn">+</button>
        </div>
      </Row>

      {/* Tab size */}
      <Row title="حجم علامة التبويب">
        <div className="mobile-segmented" role="radiogroup">
          {[2, 4, 8].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={settings.tabSize === n}
              className={'mobile-segmented-btn' + (settings.tabSize === n ? ' mobile-segmented-active' : '')}
              onClick={() => onChange({ tabSize: n })}
            >{n}</button>
          ))}
        </div>
      </Row>

      {/* Toggles */}
      <ToggleRow label="التفاف الكلمات (wordWrap)" on={settings.wordWrap} onToggle={(v) => onChange({ wordWrap: v })} />
      <ToggleRow label="التفاف تلقائي (softWrap)" on={settings.softWrap} onToggle={(v) => onChange({ softWrap: v })} />
      <ToggleRow label="أرقام الأسطر" on={settings.lineNumbers} onToggle={(v) => onChange({ lineNumbers: v })} />

      {/* Theme */}
      <Row title="السمة">
        <div className="mobile-segmented">
          {(['auto', 'light', 'dark'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={settings.theme === t}
              className={'mobile-segmented-btn' + (settings.theme === t ? ' mobile-segmented-active' : '')}
              onClick={() => onChange({ theme: t })}
            >{t === 'auto' ? 'تلقائي' : t === 'light' ? 'فاتح' : 'داكن'}</button>
          ))}
        </div>
      </Row>

      <button
        type="button"
        onClick={onResetDefaults}
        className="mobile-settings-reset-btn"
      >
        إعادة الافتراضات
      </button>
    </div>
  );
}

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mobile-settings-row">
      <div className="mobile-settings-row-title">{title}</div>
      {children}
    </div>
  );
}

function ToggleRow({ label, on, onToggle }: { label: string; on: boolean; onToggle: (v: boolean) => void }) {
  return (
    <div className="mobile-settings-row mobile-settings-toggle-row">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        className={'mobile-switch' + (on ? ' mobile-switch-on' : '')}
        onClick={() => onToggle(!on)}
      >
        <span className="mobile-switch-knob" />
      </button>
    </div>
  );
}
