/**
 * Tiny helper used by the renderer to mark inline Latin or numeric
 * runs inside Arabic text. We rarely auto-wrap; instead we expose
 * `wrapLatinTokens(text, tokenSet)` that callers invoke when they
 * specifically want inline Latin terms isolated within an Arabic
 * paragraph. The default token list is curated from the curriculum.
 */

const DEFAULT_LATIN_TOKENS = [
  // Programming languages
  'Python', 'Java', 'JavaScript', 'TypeScript', 'SQL', 'Bash', 'Shell',
  // Concepts
  'Object', 'Class', 'Function', 'Method', 'API', 'HTTP', 'HTTPS',
  'JSON', 'YAML', 'XML', 'SQLAlchemy', 'ORM', 'OOP', 'O(n)', 'O(1)',
  'Big O', 'SOLID', 'DRY', 'KISS', 'YAGNI',
  // Tools
  'Docker', 'Kubernetes', 'PostgreSQL', 'MySQL', 'Redis', 'MongoDB',
  'Node', 'npm', 'pnpm', 'Express', 'Fastify', 'React', 'Vite',
  'ESLint', 'Prettier', 'Git', 'GitHub', 'GitLab', 'CI', 'CD',
  // Frameworks / libraries explicitly referenced in this book
  'ExpressJS', 'Jest', 'Vitest', 'JUnit',
  // CRLF / casing
  'LIFO', 'FIFO', 'JWT', 'CRUD',
];

const REGEX_CACHE = new Map<string, RegExp>();

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getRegex(tokenSet: ReadonlyArray<string>): RegExp {
  const key = tokenSet.join('|');
  let r = REGEX_CACHE.get(key);
  if (!r) {
    r = new RegExp(`(${tokenSet.map(escapeRegex).join('|')})`, 'g');
    REGEX_CACHE.set(key, r);
  }
  return r;
}

/**
 * Split text into an array of strings, wrapping each `token` match
 * with the literal `<<bdi>>…<</bdi>>` markers that the renderer
 * later turns into <bdi dir="ltr"> elements. We use a sentinel
 * string approach to avoid sniffing the DOM in this layer.
 */
export function wrapLatinTokens(
  text: string,
  extra: ReadonlyArray<string> = []
): Array<{ text: string; bdi: boolean }> {
  const tokens = extra.length ? Array.from(new Set([...DEFAULT_LATIN_TOKENS, ...extra])) : DEFAULT_LATIN_TOKENS;
  const r = getRegex(tokens);
  const out: Array<{ text: string; bdi: boolean }> = [];
  let last = 0;
  for (const m of text.matchAll(r)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ text: text.slice(last, i), bdi: false });
    out.push({ text: m[0], bdi: true });
    last = i + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), bdi: false });
  return out;
}

/**
 * Render a list of {text,bdi} segments as inline React children.
 * Uses React.createElement instead of JSX because this file is `.ts`
 * (TypeScript only allows JSX in `.tsx`, and renaming would force
 * import-path changes elsewhere).
 */
import React from 'react';
import type { ReactNode } from 'react';
export function renderSegments(segs: Array<{ text: string; bdi: boolean }>): ReactNode {
  return segs.map((s, i) => {
    if (s.bdi) {
      return React.createElement('bdi', { key: i, dir: 'ltr' }, s.text);
    }
    return React.createElement(React.Fragment, { key: i }, s.text);
  });
}

/**
 * Heuristic: if a paragraph is dominantly Arabic, wrap its Latin
 * tokens with `<bdi>`. Otherwise, return it unchanged.
 */
export function shouldBidiWrapParagraph(text: string): boolean {
  if (!text) return false;
  const arabic = (text.match(/[\u0600-\u06FF]/g) ?? []).length;
  const latin = (text.match(/[A-Za-z]/g) ?? []).length;
  return arabic > 8 && latin > 1 && arabic / (arabic + latin) > 0.55;
}
