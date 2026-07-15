import React, { useState } from 'react';
import { Link } from 'wouter';
import { ContentNode } from '@/data/types';
import { CodeBlock } from './ui/CodeBlock';
import { Callout } from './ui/Callout';
import { ChevronDown, ChevronUp, Beaker } from 'lucide-react';
import { UnitQuiz } from './UnitQuiz';
import { renderSegments, shouldBidiWrapParagraph, wrapLatinTokens } from '@/lib/bidi';
import { pushLessonHandoff } from '@/lib/lab/lessonBridge';
import { mapCodeLanguageToLab } from '@/lib/lab/languages';
import { MermaidRenderer } from './MermaidRenderer';
import { ColabButton } from './ColabButton';

export function ContentRenderer({ nodes }: { nodes: ContentNode[] }) {
  return (
    <div className="space-y-4">
      {nodes.map((node, i) => <NodeRenderer key={i} node={node} />)}
    </div>
  );
}

/**
 * Simple LaTeX formula renderer for Book 2.
 * Renders formula text in a styled math block.
 */
function FormulaRenderer({ latex, caption }: { latex: string; caption?: string }) {
  return (
    <div className="my-6">
      <div className="p-4 bg-muted/30 rounded-lg border border-border text-center overflow-x-auto" dir="ltr">
        <code className="text-lg font-mono text-primary">{latex}</code>
      </div>
      {caption && (
        <p className="text-center text-sm text-muted-foreground mt-2" dir="rtl">{caption}</p>
      )}
    </div>
  );
}

function NodeRenderer({ node }: { node: ContentNode }) {
  switch (node.type) {
    case 'h1':
      return <h1 className="text-3xl font-bold mt-8 mb-4 text-primary">{_renderText(node.content)}</h1>;
    case 'h2':
      return <h2 className="text-2xl font-bold mt-8 mb-4 border-b border-border pb-2">{_renderText(node.content)}</h2>;
    case 'h3':
      return <h3 className="text-xl font-bold mt-6 mb-3 text-secondary">{_renderText(node.content)}</h3>;
    case 'h4':
      return <h4 className="text-lg font-bold mt-4 mb-2">{_renderText(node.content)}</h4>;
    case 'p':
      return <Paragraph text={node.content} />;
    case 'ascii':
      return (
        <div className="my-6 p-4 rounded-lg bg-muted text-muted-foreground font-mono text-sm overflow-x-auto whitespace-pre border border-border" dir="ltr">
          {node.content}
        </div>
      );
    case 'code':
      return (
        <div className="my-6">
          <CodeBlock language={node.language} content={node.content} title={node.title} />
          <OpenInLabButton
            stageId={(node as any).__stageId ?? null}
            unitId={(node as any).__unitId ?? null}
            language={node.language}
            title={node.title ?? node.language}
            content={node.content}
          />
        </div>
      );
    case 'callout':
      return (
        <Callout type={node.calloutType} title={node.title}>
          <ContentRenderer nodes={node.content} />
        </Callout>
      );
    case 'ul':
      return (
        <ul className="list-disc list-outside ms-6 mb-4 space-y-2 text-foreground/80">
          {node.items.map((item, i) => (
            <li key={i}>
              <ContentRenderer nodes={item} />
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="list-decimal list-outside ms-6 mb-4 space-y-2 text-foreground/80">
          {node.items.map((item, i) => (
            <li key={i}>
              <ContentRenderer nodes={item} />
            </li>
          ))}
        </ol>
      );
    case 'table':
      return <DataTable headers={node.headers} rows={node.rows} />;
    case 'project':
      return (
        <div className="my-8 rounded-xl border border-primary/20 bg-primary/5 overflow-hidden">
          <div className="bg-primary/10 px-6 py-4 border-b border-primary/20 font-bold text-primary flex items-center gap-2">
            <span className="text-xl">🚀</span> مشروع عملي: {node.title}
          </div>
          <div className="p-6">
            <ContentRenderer nodes={node.content} />
          </div>
        </div>
      );
    case 'active-recall':
      return <ActiveRecallInteractive questions={node.questions} />;
    // ── Book 2 extensions ──
    case 'mermaid':
      return <MermaidRenderer content={node.content} caption={node.caption} />;
    case 'formula':
      return <FormulaRenderer latex={node.latex} caption={node.caption} />;
    case 'colab-link':
      return <ColabButton notebookUrl={node.notebookUrl} title={node.title} />;
    default:
      return null;
  }
}

/**
 * Selective bidi paragraph:
 *   - Pure-Arabic → keep RTL, no extra wrapping.
 *   - Mixed (Arabic dominant with embedded Latin tokens like "Big O",
 *     "PostgreSQL") → split via wrapLatinTokens and render each token
 *     wrapped in <bdi dir="ltr"> so it stays visually in place while
 *     Arabic grammatical reordering remains intact.
 */
function Paragraph({ text }: { text: string }) {
  if (shouldBidiWrapParagraph(text)) {
    return (
      <p className="text-base leading-relaxed text-foreground/80 mb-4 whitespace-pre-wrap">
        {renderSegments(wrapLatinTokens(text))}
      </p>
    );
  }
  return <p className="text-base leading-relaxed text-foreground/80 mb-4 whitespace-pre-wrap">{text}</p>;
}

/** Heading text renderer uses the same selective bidi logic. */
function _renderText(text: string) {
  if (shouldBidiWrapParagraph(text)) {
    return renderSegments(wrapLatinTokens(text));
  }
  return text;
}

/**
 * Table cell with `dir="ltr"` only when its content is pure Latin/code
 * (zero Arabic characters, at least one Latin/digit). Otherwise the
 * cell inherits the page direction and stays RTL.
 */
function DataTableCell({ content }: { content: string }) {
  const hasArabic = /[\u0600-\u06FF]/.test(content);
  const hasLatin = /[A-Za-z0-9]/.test(content);
  if (!hasArabic && hasLatin) {
    return (
      <td className="px-6 py-4" dir="ltr" lang="en">
        {content}
      </td>
    );
  }
  return <td className="px-6 py-4">{content}</td>;
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-6 border border-border rounded-lg">
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-3 font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="bg-card border-b border-border last:border-0 hover:bg-muted/30">
              {row.map((cell, j) => (
                <DataTableCell key={j} content={cell} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Interactive Active Recall block. Each question becomes a click-to-reveal
 * quiz widget (`UnitQuiz`) that records correct/incorrect answers in
 * localStorage so the learner can review mistakes later. We synthesize
 * stable question IDs from the question text (djb2 hash) — sufficient
 * for cross-session localStorage keying.
 */
function ActiveRecallInteractive({ questions }: { questions: { q: string; a: string }[] }) {
  return (
    <div className="my-8 border-2 border-secondary/30 rounded-xl overflow-hidden">
      <div className="bg-secondary/10 px-6 py-4 border-b border-secondary/30 font-bold text-secondary-foreground flex items-center gap-2">
        <span className="text-xl">🧠</span> المراجعة النشطة (Active Recall) — أجب عن كل سؤال قبل النظر للإجابة
      </div>
      <div className="p-6 space-y-4 bg-card">
        {questions.map((qq, i) => (
          <UnitQuiz
            key={`q-${i}-${qq.q.length}`}
            question={{
              id: hashId(qq.q),
              unitId: '__inline__',
              unitTitle: 'سؤال داخل الوحدة',
              stageId: '__inline__',
              stageNumber: 0,
              stageTitle: '',
              path: '',
              q: qq.q,
              a: qq.a,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function hashId(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

/**
 * "افتح في مختبر Smart Code" button rendered beneath each CodeBlock.
 * Writes a one-shot handoff to localStorage and navigates to the
 * lesson-mode page so the lab appears beside the lesson the learner
 * was just reading (or, if invoked outside a unit, to /lab directly).
 *
 * The button is intentionally RTL-friendly and uses icon + short
 * Arabic label so it does not visually compete with the code block.
 */
function OpenInLabButton({
  stageId,
  unitId,
  language,
  title,
  content,
}: {
  stageId: string | null;
  unitId: string | null;
  language: string;
  title: string;
  content: string;
}) {
  const handleClick = () => {
    try {
      pushLessonHandoff({
        stageId: stageId ?? '__external__',
        unitId: unitId ?? '__external__',
        language: mapCodeLanguageToLab(language),
        title: title || language,
        content: content || '',
      });
    } catch {
      /* ignore */
    }
  };
  const target = stageId && unitId
    ? `/lab/lesson/${stageId}/${unitId}`
    : '/lab';
  return (
    <div className="-mt-4 mb-6">
      <Link href={target} onClick={handleClick}>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 text-sm font-bold cursor-pointer">
          <Beaker className="w-4 h-4" />
          <span>افتح في مختبر Smart Code</span>
        </span>
      </Link>
    </div>
  );
}
