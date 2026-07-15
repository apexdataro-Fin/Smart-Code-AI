import { useEffect, useState } from 'react';
import { book } from '@/data/book';
import type { ContentNode } from '@/data/types';
import { unitPath } from './curriculum';

/**
 * Quiz foundation built exclusively from existing `active-recall` nodes
 * already present in each unit's content. We never invent questions or
 * answers — only surface what the curriculum authors wrote and pair
 * each question with its verified source-unit.
 */

export interface QuizQuestion {
  /** globally unique */
  id: string;
  unitId: string;
  unitTitle: string;
  stageId: string;
  stageNumber: number;
  stageTitle: string;
  path: string;
  q: string;
  a: string;
}

export function collectQuestions(): QuizQuestion[] {
  const out: QuizQuestion[] = [];
  for (const stage of book.stages) {
    for (const unit of stage.units) {
      walk(unit.content, unit, stage, out);
    }
  }
  return out;
}

function walk(
  nodes: ContentNode[],
  unit: { id: string; title: string },
  stage: { id: string; stageNumber: number; title: string },
  out: QuizQuestion[]
) {
  for (const n of nodes) {
    if (n.type === 'active-recall') {
      for (const q of n.questions) {
        out.push({
          id: `${unit.id}#${stableHash(q.q)}`,
          unitId: unit.id,
          unitTitle: unit.title,
          stageId: stage.id,
          stageNumber: stage.stageNumber,
          stageTitle: stage.title,
          path: unitPath({
            stageId: stage.id,
            unitId: unit.id,
            stageNumber: stage.stageNumber,
            stageTitle: stage.title,
            unitNumber: 0,
            title: unit.title,
            description: '',
            index: 0,
            sequentialNumber: 0,
          }),
          q: q.q,
          a: q.a,
        });
      }
    } else if (n.type === 'callout' || n.type === 'project') {
      walk(n.content, unit, stage, out);
    } else if (n.type === 'ul' || n.type === 'ol') {
      for (const i of n.items) walk(i, unit, stage, out);
    }
  }
}

function stableHash(s: string): string {
  // djb2-ish, sufficient for stable IDs in localStorage
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

// ----------------------- progress tracking -----------------------

export interface QuizStatsV1 {
  version: 1;
  /** Map<questionId, {seen, correct, incorrect, last?}> */
  byQuestion: Record<
    string,
    { seen: number; correct: number; incorrect: number; last?: number }
  >;
}

const STATS_KEY = 'sc_quiz_stats_v1';

export function emptyStats(): QuizStatsV1 {
  return { version: 1, byQuestion: {} };
}

export function readStats(): QuizStatsV1 {
  if (typeof window === 'undefined') return emptyStats();
  try {
    const raw = window.localStorage.getItem(STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1 && parsed.byQuestion) return parsed as QuizStatsV1;
    }
  } catch {
    /* ignore */
  }
  return emptyStats();
}

export function writeStats(stats: QuizStatsV1): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    /* ignore */
  }
}

export function recordAnswer(
  qid: string,
  result: 'correct' | 'incorrect'
): QuizStatsV1 {
  const stats = readStats();
  const prev = stats.byQuestion[qid] ?? { seen: 0, correct: 0, incorrect: 0 };
  prev.seen += 1;
  if (result === 'correct') prev.correct += 1;
  else prev.incorrect += 1;
  prev.last = Date.now();
  stats.byQuestion[qid] = prev;
  writeStats(stats);
  broadcastQuizChange();
  return stats;
}

export function useQuizStats(): [QuizStatsV1, () => void] {
  const [s, setS] = useState<QuizStatsV1>(() => readStats());
  useEffect(() => {
    const sync = () => setS(readStats());
    window.addEventListener('sc:quiz-changed', sync as EventListener);
    return () => window.removeEventListener('sc:quiz-changed', sync as EventListener);
  }, []);
  const refresh = () => setS(readStats());
  return [s, refresh];
}

export function broadcastQuizChange(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('sc:quiz-changed'));
}

export function questionsByUnit(unitId: string): QuizQuestion[] {
  return collectQuestions().filter((q) => q.unitId === unitId);
}

export function incorrectQuestions(
  limit: number = 20,
  stats: QuizStatsV1 = readStats()
): QuizQuestion[] {
  const all = collectQuestions();
  const out: QuizQuestion[] = [];
  for (const q of all) {
    const s = stats.byQuestion[q.id];
    if (s && s.incorrect > s.correct) out.push(q);
    if (out.length >= limit) break;
  }
  return out;
}

export function getUnitQuestionsByPath(stageId: string, unitId: string): QuizQuestion[] {
  return collectQuestions().filter((q) => q.stageId === stageId && q.unitId === unitId);
}

export { unitPath };
