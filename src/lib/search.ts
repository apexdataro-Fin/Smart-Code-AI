/**
 * In-memory client-side search for the Smart Code curriculum.
 *
 * Built once at module load from the book registry.
 * No external dependency: token-based matching with simple scoring.
 * Handles Arabic (substring / normalized), Latin (case-insensitive
 * word boundary), and mixed queries.
 */

import { book } from '@/data/book';
import type { ContentNode } from '@/data/types';
import { unitPath } from './curriculum';

export interface SearchHit {
  unitId: string;
  unitTitle: string;
  stageId: string;
  stageNumber: number;
  stageTitle: string;
  path: string;
  matchedField: 'title' | 'description' | 'section' | 'paragraph';
  matchedText: string;
  score: number;
  /** A short preview around the match (≤160 chars) */
  preview: string;
}

interface IndexEntry {
  unitId: string;
  unitTitle: string;
  stageId: string;
  stageNumber: number;
  stageTitle: string;
  title: string;
  description: string;
  sections: string[];         // h2/h3/h4 in order
  paragraphs: string[];       // all <p> content
}

const MAX_PARAGRAPHS = 30;
const MAX_PARAGRAPH_CHARS = 240;
const MAX_RESULTS = 50;

let _index: IndexEntry[] | null = null;

function normalize(s: string): string {
  return s
    .toLowerCase()
    // strip Arabic diacritics (tashkeel) for forgiving Arabic search
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
}

function tokenize(s: string): string[] {
  return normalize(s)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length >= 1);
}

function previewAround(text: string, query: string): string {
  if (!text) return '';
  const lower = normalize(text);
  const q = normalize(query);
  const i = lower.indexOf(q);
  if (i < 0) return text.slice(0, 160);
  const start = Math.max(0, i - 50);
  const end = Math.min(text.length, i + q.length + 80);
  return (start > 0 ? '… ' : '') + text.slice(start, end) + (end < text.length ? ' …' : '');
}

function scoreFor(entry: IndexEntry, query: string, tokens: string[]): {
  score: number;
  matchedField: SearchHit['matchedField'] | null;
  matchedText: string;
} {
  let score = 0;
  let field: SearchHit['matchedField'] | null = null;
  let matched = '';

  if (entry.title) {
    const nt = normalize(entry.title);
    if (nt === normalize(query)) { score += 100; matched = entry.title; field = 'title'; }
    else if (nt.includes(normalize(query))) { score += 60; matched = entry.title; field = 'title'; }
  }
  if (entry.description) {
    const nd = normalize(entry.description);
    if (nd.includes(normalize(query))) {
      const s = 30 + tokens.length * 5;
      if (s > score) { score = s; matched = entry.description; field = 'description'; }
    }
  }
  for (const sec of entry.sections) {
    if (normalize(sec).includes(normalize(query))) {
      const s = 25;
      if (s > score) { score = s; matched = sec; field = 'section'; }
      break;
    }
  }
  for (const para of entry.paragraphs) {
    const np = normalize(para);
    if (np.includes(normalize(query))) {
      const s = 15;
      if (s > score) { score = s; matched = para; field = 'paragraph'; }
      break;
    }
  }

  // Token-level fallback matches if the full literal didn't hit.
  if (score === 0 && tokens.length > 0) {
    for (const tok of tokens) {
      if (!tok) continue;
      if (normalize(entry.title).includes(tok)) { score = Math.max(score, 35); matched = entry.title; field = 'title'; }
      else if (normalize(entry.description).includes(tok)) { score = Math.max(score, 18); matched = entry.description; field = 'description'; }
      else if (entry.sections.some((s) => normalize(s).includes(tok))) {
        score = Math.max(score, 14); if (!matched) { matched = entry.sections.find((s) => normalize(s).includes(tok)) ?? ''; field = 'section'; }
      }
      else if (entry.paragraphs.some((p) => normalize(p).includes(tok))) {
        score = Math.max(score, 8);
        if (!matched) { matched = entry.paragraphs.find((p) => normalize(p).includes(tok)) ?? ''; field = 'paragraph'; }
      }
    }
  }

  return { score, matchedField: field, matchedText: matched };
}

function buildIndex(): IndexEntry[] {
  const res: IndexEntry[] = [];
  for (const stage of book.stages) {
    for (const unit of stage.units) {
      const sections: string[] = [];
      const paragraphs: string[] = [];
      const walk = (nodes: ContentNode[]) => {
        for (const n of nodes) {
          if (n.type === 'h2' || n.type === 'h3' || n.type === 'h4') {
            sections.push(n.content);
          } else if (n.type === 'p') {
            if (paragraphs.length < MAX_PARAGRAPHS) paragraphs.push(n.content.slice(0, MAX_PARAGRAPH_CHARS));
          } else if (n.type === 'ul' || n.type === 'ol') {
            for (const item of n.items) walk(item);
          } else if (n.type === 'callout' || n.type === 'project') {
            walk(n.content);
          }
        }
      };
      walk(unit.content);
      res.push({
        unitId: unit.id,
        unitTitle: unit.title,
        stageId: stage.id,
        stageNumber: stage.stageNumber,
        stageTitle: stage.title,
        title: unit.title,
        description: unit.description,
        sections,
        paragraphs,
      });
    }
  }
  return res;
}

export function search(query: string, limit: number = MAX_RESULTS): SearchHit[] {
  const q = query.trim();
  if (!q) return [];
  if (!_index) _index = buildIndex();
  const tokens = tokenize(q);
  const hits: SearchHit[] = [];
  for (const entry of _index) {
    const { score, matchedField, matchedText } = scoreFor(entry, q, tokens);
    if (score > 0 && matchedField) {
      const flat = (() => { try { return unitPath({ stageId: entry.stageId, unitId: entry.unitId, stageNumber: entry.stageNumber, stageTitle: entry.stageTitle, unitNumber: 0, title: entry.unitTitle, description: '', index: 0, sequentialNumber: 0 } as never); } catch { return ''; } })();
      hits.push({
        unitId: entry.unitId,
        unitTitle: entry.unitTitle,
        stageId: entry.stageId,
        stageNumber: entry.stageNumber,
        stageTitle: entry.stageTitle,
        path: `/stage/${entry.stageId}/unit/${entry.unitId}`,
        matchedField,
        matchedText,
        score,
        preview: previewAround(matchedText, q),
      });
    }
  }
  hits.sort((a, b) => b.score - a.score || a.unitTitle.localeCompare(b.unitTitle, 'ar'));
  return hits.slice(0, limit);
}

export function clearSearchIndexForDev(): void {
  _index = null;
}
