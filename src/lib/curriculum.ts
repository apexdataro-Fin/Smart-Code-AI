import { book } from '@/data/book';
import type { UnitDef, StageDef } from '@/data/types';

/**
 * Single source of truth for navigation ordering across the platform.
 * Any UI that needs prev/next/breadcrumbs MUST consume these helpers
 * rather than walking `book.stages` directly.
 */

export interface FlatUnit {
  /** Sequential 0-based index in the global learning sequence */
  index: number;
  /** Sequential 1-based number for display in the UI */
  sequentialNumber: number;
  stageId: string;
  stageNumber: number;
  stageTitle: string;
  unitId: string;
  unitNumber: number;
  title: string;
  description: string;
}

let _flat: FlatUnit[] | null = null;

export function unitsFlat(): FlatUnit[] {
  if (_flat) return _flat;
  const out: FlatUnit[] = [];
  let i = 0;
  for (const stage of book.stages) {
    for (const unit of stage.units) {
      out.push({
        index: i,
        sequentialNumber: i + 1,
        stageId: stage.id,
        stageNumber: stage.stageNumber,
        stageTitle: stage.title,
        unitId: unit.id,
        unitNumber: unit.unitNumber,
        title: unit.title,
        description: unit.description,
      });
      i++;
    }
  }
  _flat = out;
  return out;
}

export function totalUnitCount(): number {
  return unitsFlat().length;
}

export function getFlatIndexByUnitId(unitId: string): number {
  const list = unitsFlat();
  for (let i = 0; i < list.length; i++) {
    if (list[i].unitId === unitId) return i;
  }
  return -1;
}

export function getFlatByUnitId(unitId: string): FlatUnit | undefined {
  return unitsFlat().find((u) => u.unitId === unitId);
}

export function getNeighbors(unitId: string): {
  prev: FlatUnit | null;
  next: FlatUnit | null;
} {
  const list = unitsFlat();
  const idx = list.findIndex((u) => u.unitId === unitId);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? list[idx - 1] : null,
    next: idx < list.length - 1 ? list[idx + 1] : null,
  };
}

export function unitPath(unit: FlatUnit): string {
  return `/stage/${unit.stageId}/unit/${unit.unitId}`;
}

export interface CrumbItem {
  label: string;
  href: string;
  isCurrent: boolean;
}

export function breadcrumbsForUnit(unitId: string): CrumbItem[] {
  const flat = getFlatByUnitId(unitId);
  if (!flat) return [];
  return [
    { label: 'غلاف الكتاب', href: '/', isCurrent: false },
    { label: 'الفهرس', href: '/toc', isCurrent: false },
    {
      label: `المرحلة ${flat.stageNumber}: ${flat.stageTitle}`,
      href: '/toc',
      isCurrent: false,
    },
    {
      label: flat.title,
      href: unitPath(flat),
      isCurrent: true,
    },
  ];
}

export function stageProgress(stage: StageDef, completedUnitIds: ReadonlySet<string>): {
  total: number;
  done: number;
  percent: number;
} {
  const total = stage.units.length;
  let done = 0;
  for (const u of stage.units) if (completedUnitIds.has(u.id)) done++;
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function overallProgress(completedUnitIds: ReadonlySet<string>): {
  total: number;
  done: number;
  percent: number;
} {
  const total = totalUnitCount();
  const done = unitsFlat().filter((u) => completedUnitIds.has(u.unitId)).length;
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function lastRouteOrFallback(fallback: string): string {
  return fallback;
}

export function findStageOfUnit(unitId: string): StageDef | undefined {
  return book.stages.find((s) => s.units.some((u) => u.id === unitId));
}

export function findUnit(stageId: string, unitId: string): UnitDef | undefined {
  return book.stages.find((s) => s.id === stageId)?.units.find((u) => u.id === unitId);
}
