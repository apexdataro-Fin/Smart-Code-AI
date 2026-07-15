import type { LanguageId } from '@/lib/lab/types';
import { getLanguageMeta, getAllAdapters } from './registry';

/**
 * SINGLE SOURCE OF TRUTH for "what language is this file?"
 * Every component that maps a filename to a LanguageId reads from here.
 * To add support for ".java" / ".sql" / ".cpp" etc., only the adapter's
 * `meta.extensions` array needs to be extended — no UI changes.
 */

export const LANGUAGES: LanguageId[] = getAllAdapters().map((a) => a.meta.id);

/** Returns the human-readable language display name (Latin). */
export function getLanguageDisplay(language: LanguageId): string {
  return getLanguageMeta(language).displayName;
}

/** Returns the human-readable language display name (Arabic). */
export function getLanguageDisplayAr(language: LanguageId): string {
  return getLanguageMeta(language).displayNameAr;
}

/** Map CodeBlock's free-form language string into a Lab LanguageId. */
export function mapCodeLanguageToLab(lang: string): LanguageId {
  const l = (lang ?? '').toLowerCase().trim();
  if (l === 'js' || l === 'javascript' || l === 'jsx') return 'javascript';
  if (l === 'ts' || l === 'typescript' || l === 'tsx') return 'typescript';
  if (l === 'py' || l === 'python') return 'python';
  if (l === 'html' || l === 'htm' || l === 'xml' || l === 'xhtml') return 'html';
  if (l === 'css' || l === 'scss' || l === 'less') return 'css';
  if (l === 'json' || l === 'jsonc' || l === 'geojson') return 'json';
  if (l === 'md' || l === 'markdown') return 'markdown';
  if (l === 'bash' || l === 'sh' || l === 'shell' || l === 'zsh') return 'shell';
  return detectLanguageFromFilename(`x.${l}`) ?? 'javascript';
}

/**
 * Returns LanguageId inferred from a filename's extension, or null if the
 * extension doesn't match any registered language. Replaces the four
 * duplicated implementations that previously lived in LabToolbar,
 * LabShell, and projectManager.
 */
export function detectLanguageFromFilename(filename: string): LanguageId | null {
  const lower = (filename || '').toLowerCase().trim();
  const dot = lower.lastIndexOf('.');
  if (dot < 0 || dot === lower.length - 1) return null;
  const ext = lower.slice(dot + 1);
  for (const adapter of getAllAdapters()) {
    if (adapter.meta.extensions.includes(ext)) return adapter.meta.id;
  }
  return null;
}

/**
 * Pick a sensible default language for a filename that has no extension
 * or an unknown extension — falls back to the project's current language.
 */
export function inferLanguageOrFallback(filename: string, fallback: LanguageId): LanguageId {
  return detectLanguageFromFilename(filename) ?? fallback;
}
