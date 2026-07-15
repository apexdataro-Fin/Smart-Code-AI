import React, { useEffect, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-docker';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  content: string;
  /** Optional human-readable label shown at the top of the block.
   *  Typically a filename (e.g. `main.ts`) or a section caption. */
  title?: string;
  /** Optional filename shown as a separate "filename pill" beside the title. */
  filename?: string;
}

const LANG_LABEL: Record<string, string> = {
  python: 'Python',
  java: 'Java',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  ts: 'TS',
  js: 'JS',
  sql: 'SQL',
  bash: 'Shell',
  text: 'Pseudocode',
  yaml: 'YAML',
  json: 'JSON',
  docker: 'Dockerfile',
};

export function CodeBlock({ language, content, title, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [content, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      // Fallback for sandboxes without clipboard permission
      const ta = document.createElement('textarea');
      ta.value = content;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  const headerLabel =
    LANG_LABEL[language?.toLowerCase()] ?? (language || '').toUpperCase();

  return (
    // P0 fix: `unicode-bidi: isolate` on the OUTER wrapper means an
    // embedded bidi run inside the code block cannot leak into the RTL
    // page direction and accidentally reverse Latin identifiers. We keep
    // `dir="ltr"` so Prism's token spans lay out left-to-right as designed.
    <div
      className="my-6 rounded-lg overflow-hidden border border-border bg-[#1d1f21] no-print-bg shadow-sm"
      dir="ltr"
      lang="en"
      style={{ unicodeBidi: 'isolate' }}
    >
      {(title || filename || language) && (
        <div className="flex items-center justify-between gap-3 px-4 py-2 bg-black/40 border-b border-white/10 text-white/80 text-xs font-mono">
          <div className="flex items-center gap-2 min-w-0">
            {headerLabel && (
              <span className="inline-block px-2 py-0.5 rounded-full bg-white/10 uppercase tracking-wider text-[10px] font-bold">
                {headerLabel}
              </span>
            )}
            {(filename || title) && (
              <span className="truncate font-bold text-white/90">{filename ?? title}</span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="hover:text-white transition-colors inline-flex items-center gap-1.5"
            title={copied ? 'تم نسخ الكود ✓' : 'نسخ الكود'}
            aria-label={copied ? 'تم نسخ الكود' : 'نسخ الكود'}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-[10px]">تم</span>
              </>
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
      {/* P2 fix: iPhone-sized screens need touch-friendly horizontal scroll
          and a visible scrollbar cue. `-webkit-overflow-scrolling: touch`
          gives momentum on iOS, thin scrollbar keeps it unobtrusive. */}
      <div
        className="p-4 overflow-x-auto text-sm font-mono text-left"
        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin' }}
      >
        <pre className={`language-${language} !m-0 !p-0 !bg-transparent`}>
          <code className={`language-${language}`}>{content}</code>
        </pre>
      </div>
    </div>
  );
}
