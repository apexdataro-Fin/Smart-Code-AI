import type { ContentNode } from './types';

export interface AppendixSection {
  type: "table" | "code" | "content";
  title: string;
  headers?: string[];
  rows?: string[][];
  language?: string;
  content?: string;
  nodes?: ContentNode[];
}

export const appendixPage = {
  title: "الملاحق المرجعية — Smart Code AI",
  description: "مرجعك الكامل كمهندس ذكاء اصطناعي. اختصارات، أوامر، وصيغ رياضية.",
  sections: [
    {
      type: "table" as const,
      title: "Python & AI Libraries Cheatsheet",
      headers: ["المكتبة", "الاستخدام", "أمر التثبيت"],
      rows: [
        ["NumPy", "الحوسبة العددية والمصفوفات", "pip install numpy"],
        ["Pandas", "تحليل البيانات وDataFrames", "pip install pandas"],
        ["Matplotlib", "الرسوم البيانية والتصور", "pip install matplotlib"],
        ["Scikit-learn", "التعلم الآلي التقليدي", "pip install scikit-learn"],
        ["PyTorch", "التعلم العميق والشبكات العصبية", "pip install torch"],
        ["Transformers", "نماذج اللغة الجاهزة (HuggingFace)", "pip install transformers"],
        ["LangChain", "بناء تطبيقات LLM", "pip install langchain"],
        ["FastAPI", "بناء واجهات برمجية REST", "pip install fastapi uvicorn"],
        ["ChromaDB", "قاعدة بيانات متجهات", "pip install chromadb"],
        ["Sentence-Transformers", "تضمين النصوص", "pip install sentence-transformers"],
      ],
    },
    {
      type: "table" as const,
      title: "Mathematical Notation Reference",
      headers: ["الرمز", "المعنى", "مثال"],
      rows: [
        ["f(x)", "دالة بمتغير x", "f(x) = x²"],
        ["Σ", "مجموع (Summation)", "Σᵢ₌₁ⁿ xᵢ"],
        ["Π", "جداء (Product)", "Πᵢ₌₁ⁿ xᵢ"],
        ["∥v∥", "معيار المتجه (Norm)", "∥(3,4)∥ = 5"],
        ["Aᵀ", "منقول المصفوفة (Transpose)", "صفوف ↔ أعمدة"],
        ["A⁻¹", "معكوس المصفوفة (Inverse)", "A × A⁻¹ = I"],
        ["det(A)", "محدد المصفوفة (Determinant)", "يقيس التمدد/الانكماش"],
        ["∇f", "تدرج الدالة (Gradient)", "اتجاه أسرع زيادة"],
        ["∂f/∂x", "مشتقة جزئية", "تغير f بالنسبة لـ x فقط"],
        ["P(A|B)", "احتمال A بشرط B", "P(مطر|غيم) = 0.8"],
        ["E[X]", "القيمة المتوقعة", "متوسط التوزيع"],
        ["σ²", "التباين (Variance)", "مقياس التشتت"],
        ["λ", "قيمة ذاتية (Eigenvalue)", "Av = λv"],
        ["UΣVᵀ", "تفكيك القيمة المفردة (SVD)", "تحليل أي مصفوفة"],
      ],
    },
    {
      type: "content" as const,
      title: "Machine Learning Algorithms Quick Reference",
      nodes: [
        { type: "h3" as const, content: "التصنيف (Classification)" },
        { type: "p" as const, content: "Logistic Regression, SVM, Random Forest, XGBoost, Neural Networks — للتنبؤ بفئة (نجاح/فشل، قطة/كلب، مرض/سليم)." },
        { type: "h3" as const, content: "الانحدار (Regression)" },
        { type: "p" as const, content: "Linear Regression, Ridge, Lasso, Polynomial Regression — للتنبؤ بقيمة مستمرة (سعر، درجة حرارة، عمر)." },
        { type: "h3" as const, content: "التجميع (Clustering)" },
        { type: "p" as const, content: "K-Means, DBSCAN, Hierarchical Clustering — لتقسيم البيانات لمجموعات بدون تسميات مسبقة." },
        { type: "h3" as const, content: "التعلم العميق (Deep Learning)" },
        { type: "p" as const, content: "CNN (الصور)، RNN/LSTM (المتسلسلات)، Transformers (النصوص) — نماذج معقدة متعددة الطبقات." },
      ],
    },
    {
      type: "content" as const,
      title: "LLM Models Quick Reference",
      nodes: [
        { type: "h3" as const, content: "OpenAI" },
        { type: "p" as const, content: "GPT-4o, GPT-4 Turbo, GPT-3.5 — نماذج متعددة الوسائط، Reasoning، Tool Calling." },
        { type: "h3" as const, content: "Anthropic" },
        { type: "p" as const, content: "Claude 3.5 Sonnet, Claude 3 Opus — تركيز على الأمان والتفكير المطول." },
        { type: "h3" as const, content: "Google" },
        { type: "p" as const, content: "Gemini 1.5 Pro, Gemini Flash — نافذة سياق مليون Token، متعدد الوسائط." },
        { type: "h3" as const, content: "Open-weight" },
        { type: "p" as const, content: "Llama 3 (Meta), Mistral, Qwen, DeepSeek — نماذج مفتوحة يمكن تشغيلها محلياً." },
        { type: "h3" as const, content: "Embedding Models" },
        { type: "p" as const, content: "text-embedding-3 (OpenAI), all-MiniLM-L6-v2 (SBERT), BGE-M3 — لتحويل النص لمتجهات." },
      ],
    },
  ] as AppendixSection[],
};
