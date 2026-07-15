import { BookDef, UnitDef } from './types';
import { stage1Mathematics } from './stage1Mathematics';
import { stage2NumPy } from './stage2NumPy';
import { stage3Pandas } from './stage3Pandas';
import { stage4Matplotlib } from './stage4Matplotlib';
import { stage5ML } from './stage5ML';
import { stage6DeepLearning } from './stage6DeepLearning';
import { stage7NLP } from './stage7NLP';
import { stage8LLM } from './stage8LLM';
import { stage9PromptEngineering } from './stage9PromptEngineering';
import { stage10RAG } from './stage10RAG';
import { stage11Agents } from './stage11Agents';
import { stage12MLOps } from './stage12MLOps';
import { stage13Capstone } from './stage13Capstone';

export const book: BookDef = {
  title: "Smart Code AI",
  subtitle: "هندسة الذكاء الاصطناعي — من الرياضيات إلى النشر",
  version: "2026",
  author: "دليل متكامل لتصبح مهندس ذكاء اصطناعي محترف",
  stages: [
    stage1Mathematics,
    stage2NumPy,
    stage3Pandas,
    stage4Matplotlib,
    stage5ML,
    stage6DeepLearning,
    stage7NLP,
    stage8LLM,
    stage9PromptEngineering,
    stage10RAG,
    stage11Agents,
    stage12MLOps,
    stage13Capstone,
  ]
};

export function getUnit(stageId: string, unitId: string): UnitDef | undefined {
  const stage = book.stages.find(s => s.id === stageId);
  if (!stage) return undefined;
  return stage.units.find(u => u.id === unitId);
}
