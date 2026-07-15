import { useEffect, useMemo, useRef, useState } from 'react';
import { Monitor, Smartphone, Tablet, RotateCw, ExternalLink, Globe } from 'lucide-react';

export type DeviceKind = 'desktop' | 'tablet' | 'phone';
export type Orientation = 'landscape' | 'portrait';

interface PreviewPanelProps {
  /** Plain HTML for sandboxes (single file or assembled index.html). */
  html: string;
  /** When true the preview is full-screen without device chrome. */
  fullBleed?: boolean;
}

/**
 * Live preview panel that hosts a sandboxed iframe with `srcdoc`. The
 * iframe is rebuild-only on URL change — sandbox stays `allow-scripts`
 * (no allow-same-origin) so user code cannot escape.
 *
 * Three device sizes (Desktop/Tablet/Phone) plus a landscape/portrait
 * toggle wrap the iframe in a labeled frame with realistic CSS px
 * dimensions.
 *
 * If `fullBleed` is true, the panel renders the iframe with no device
 * chrome — used by Lesson Mode where the lesson already constrains
 * width.
 */
export function PreviewPanel({ html, fullBleed }: PreviewPanelProps) {
  const [device, setDevice] = useState<DeviceKind>('desktop');
  const [orientation, setOrientation] = useState<Orientation>('landscape');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const dims = useMemo(() => {
    if (fullBleed) return { w: '100%', h: '100%', radius: 0, label: null as string | null };
    if (device === 'desktop') {
      return { w: '100%', h: 480, radius: 8, label: 'Desktop — 1280×720' };
    }
    if (device === 'tablet') {
      const w = orientation === 'landscape' ? 1024 : 768;
      const h = orientation === 'landscape' ? 768 : 1024;
      return { w, h, radius: 18, label: `Tablet — ${w}×${h}` };
    }
    const w = orientation === 'landscape' ? 740 : 380;
    const h = orientation === 'landscape' ? 380 : 740;
    return { w, h, radius: 28, label: `Phone — ${w}×${h}` };
  }, [device, orientation, fullBleed]);

  // Use a deterministic key so React fully tears down + remounts the
  // iframe on html change — this is more reliable than srcdoc mutation
  // when the underlying code executes <script> tags.
  const htmlKey = useMemo(() => hashStr(html), [html]);

  return (
    <div className="h-full w-full flex flex-col bg-muted/30 border border-border rounded-lg overflow-hidden">
      {!fullBleed && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-muted/60 border-b border-border text-xs">
          <div className="flex items-center gap-1">
            <DeviceBtn active={device === 'desktop'} onClick={() => setDevice('desktop')} icon={<Monitor className="w-3.5 h-3.5" />} title="Desktop" />
            <DeviceBtn active={device === 'tablet'} onClick={() => setDevice('tablet')} icon={<Tablet className="w-3.5 h-3.5" />} title="Tablet" />
            <DeviceBtn active={device === 'phone'} onClick={() => setDevice('phone')} icon={<Smartphone className="w-3.5 h-3.5" />} title="Phone" />
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setOrientation((o) => (o === 'landscape' ? 'portrait' : 'landscape'))}
              className="p-1.5 rounded hover:bg-accent"
              title={orientation === 'landscape' ? ' portrait' : 'landscape'}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <a
              href={`#preview-${htmlKey}`}
              onClick={(e) => {
                e.preventDefault();
                try {
                  const w = window.open('about:blank', '_blank');
                  if (w) {
                    w.document.open();
                    w.document.write(html);
                    w.document.close();
                  }
                } catch { /* ignore popup blockers */ }
              }}
              className="p-1.5 rounded hover:bg-accent"
              title="فتح في تبويب جديد"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
      <div className="flex-1 grid place-items-center p-3 overflow-auto" dir="ltr">
        <div
          className="bg-card border border-border shadow-sm overflow-hidden"
          style={{
            width: typeof dims.w === 'number' ? `${dims.w}px` : dims.w,
            height: typeof dims.h === 'number' ? `${dims.h}px` : dims.h,
            borderRadius: `${dims.radius}px`,
            maxWidth: '100%',
          }}
        >
          <iframe
            ref={iframeRef}
            key={htmlKey}
            title="preview"
            sandbox="allow-scripts"
            srcDoc={html}
            className="w-full h-full block bg-white"
          />
        </div>
        {dims.label && (
          <div className="text-[11px] text-muted-foreground mt-2">
            <Globe className="w-3 h-3 inline-block ml-1" />
            {dims.label}
          </div>
        )}
      </div>
    </div>
  );
}

function DeviceBtn({ active, onClick, icon, title }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded ${active ? 'bg-primary/20 text-primary' : 'hover:bg-accent text-muted-foreground'}`}
    >
      {icon}
    </button>
  );
}

function hashStr(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

/**
 * Assemble HTML for multi-file projects where `index.html` is the entry.
 * Inlines referenced CSS and JS, resolving relative links and `<script src>`
 * with matching filenames from the project's file list.
 */
export function assembleProjectHtml(htmlText: string, files: { name: string; content: string }[]): string {
  // 1) Inline `<link rel="stylesheet" href="style.css">`.
  let out = htmlText.replace(/<link\b[^>]*?rel=["']stylesheet["'][^>]*?href=["']([^"']+)["'][^>]*?\/?>(?:\s*<\/link>)?/gi,
    (_m, href) => {
      const file = files.find((f) => f.name === href || f.name.endsWith('/' + href) || f.name === href.replace(/^\.\//, ''));
      return file ? `<style>${file.content}</style>` : '';
    });
  // 2) Inline `<script src="main.js"></script>`.
  out = out.replace(/<script\b[^>]*?src=["']([^"']+)["'][^>]*?>(?:\s*<\/script>)?/gi,
    (_m, src) => {
      const file = files.find((f) => f.name === src || f.name.endsWith('/' + src) || f.name === src.replace(/^\.\//, ''));
      return file ? `<script>${file.content}<\/script>` : '';
    });
  return out;
}
