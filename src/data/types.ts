export type CalloutType = 'note' | 'warning' | 'best-practice' | 'ai-tip' | 'mistake';

export type ContentNode =
  | { type: 'h1' | 'h2' | 'h3' | 'h4'; content: string }
  | { type: 'p'; content: string }
  | { type: 'ascii'; content: string }
  | { type: 'code'; language: string; content: string; title?: string }
  | { type: 'callout'; calloutType: CalloutType; title?: string; content: ContentNode[] }
  | { type: 'ul' | 'ol'; items: ContentNode[][] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'project'; title: string; content: ContentNode[] }
  | { type: 'active-recall'; questions: { q: string; a: string }[] }
  // ── Book 2 extensions ──
  | { type: 'mermaid'; content: string; caption?: string }
  | { type: 'formula'; latex: string; caption?: string }
  | { type: 'colab-link'; notebookUrl: string; title: string };

export interface UnitDef {
  id: string;
  stageId: string;
  unitNumber: number;
  title: string;
  description: string;
  content: ContentNode[];
  // ── Book 2 extensions ──
  difficulty?: 1 | 2 | 3 | 4 | 5;
  prerequisites?: string[];
  estimatedHours?: number;
  tags?: string[];
  certificateId?: string;
}

export interface StageDef {
  id: string;
  stageNumber: number;
  title: string;
  description?: string;
  units: UnitDef[];
}

export interface BookDef {
  title: string;
  subtitle: string;
  version: string;
  author: string;
  stages: StageDef[];
}
