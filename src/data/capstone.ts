import type { ContentNode } from './types';

export const capstonePage: { title: string; description: string; content: ContentNode[] } = {
  title: "المشروع النهائي: Smart AI Platform",
  description: "بناء منصة ذكاء اصطناعي متكاملة — تتويج لكل ما تعلمته في الكتاب. 13 مرحلة، 78 وحدة.",
  content: [
    { type: "h1", content: "المشروع النهائي: Smart AI Platform" } as const,
    { type: "p", content: "هذا المشروع هو تتويج رحلتك في Smart Code AI. تبني منصة AI كاملة: RAG + Agents + FastAPI + React + Docker. المنصة النهائية تجمع كل ما تعلمته في مرحلة واحدة متكاملة." } as const,
    { type: "h2", content: "مكونات المنصة" } as const,
    { type: "p", content: "• Frontend: React + TypeScript + Tailwind — واجهة مستخدم عصرية.\n• Backend: FastAPI — REST API + WebSocket.\n• AI Services: RAG (استرجاع معزز) + Agents (وكلاء مستقلون).\n• Database: Vector DB + PostgreSQL.\n• Deployment: Docker + GitHub Actions + Cloud." } as const,
    { type: "h2", content: "ماذا ستتعلم في Stage 13" } as const,
    { type: "p", content: "• بناء معمارية RAG كاملة من الصفر.\n• بناء Agent متعدد الأدوات (Tool Calling).\n• ربط الواجهة الأمامية بالخلفية.\n• نشر التطبيق في بيئة إنتاجية.\n• مراقبة الأداء وجمع المقاييس.\n• اختبار التحميل والتوسع الأفقي." } as const,
    { type: "callout", calloutType: "ai-tip", title: "✨ نصيحة قبل البدء", content: [
      { type: "p", content: "هذا المشروع هو محفظتك (Portfolio). عندما تنتهي منه، ستملك مشروعاً حقيقياً يمكنك عرضه في مقابلات العمل. خذ وقتك، اكتب كوداً نظيفاً، ووثق كل خطوة." } as const,
    ]} as const,
  ] as ContentNode[],
};
