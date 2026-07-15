import type { LanguageId, LessonHandoff } from './types';
import {
  setLessonHandoff,
  readLessonHandoff,
  clearLessonHandoff,
} from './storage';

/**
 * The lesson bridge is a tiny one-shot mechanism: a code block in the
 * book writes a payload via `pushLessonHandoff`, the lesson-mode lab
 * page reads it on mount via `consumeLessonHandoff`, and the payload
 * is then cleared.
 *
 * No auto-navigation: the caller navigates explicitly (so the user
 * never loses scroll context unexpectedly).
 */

export function pushLessonHandoff(opts: {
  stageId: string;
  unitId: string;
  language: LanguageId;
  title: string;
  content: string;
}): void {
  setLessonHandoff({ ...opts, ts: Date.now() });
}

export function consumeLessonHandoff(): LessonHandoff | null {
  const h = readLessonHandoff();
  clearLessonHandoff();
  return h;
}

export function peekLessonHandoff(): LessonHandoff | null {
  return readLessonHandoff();
}
