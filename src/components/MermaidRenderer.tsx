import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid once
let mermaidInitialized = false;
function initMermaid() {
  if (mermaidInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'inherit',
    themeCSS: `
      .node rect, .node circle, .node ellipse, .node polygon, .node path {
        stroke-width: 2px;
      }
    `,
  });
  mermaidInitialized = true;
}

export function MermaidRenderer({ content, caption }: { content: string; caption?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 10)}`);

  useEffect(() => {
    initMermaid();
    let cancelled = false;

    async function render() {
      try {
        const id = idRef.current;
        // Use a fresh ID each render to avoid caching issues
        const uniqueId = `${id}-${Date.now()}`;
        const { svg: rendered } = await mermaid.render(uniqueId, content.trim());
        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) {
          console.error('Mermaid render error:', e);
          setError(e?.message || 'خطأ في عرض المخطط');
          setSvg(null);
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [content]);

  if (error) {
    return (
      <div className="my-6 p-4 rounded-lg border border-red-300 bg-red-50 text-red-800 text-sm" dir="ltr">
        <div className="font-bold mb-1">⚠️ خطأ في مخطط Mermaid</div>
        <pre className="text-xs whitespace-pre-wrap font-mono">{error}</pre>
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-red-600">عرض الكود المصدري</summary>
          <pre className="mt-2 text-xs whitespace-pre-wrap font-mono bg-red-100 p-2 rounded">{content}</pre>
        </details>
      </div>
    );
  }

  return (
    <div className="my-6">
      <div
        ref={containerRef}
        className="flex justify-center p-4 bg-white rounded-lg border border-border overflow-x-auto"
        dir="ltr"
        dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
      />
      {caption && (
        <p className="text-center text-sm text-muted-foreground mt-2" dir="rtl">
          {caption}
        </p>
      )}
    </div>
  );
}

export default MermaidRenderer;
