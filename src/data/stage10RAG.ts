import { StageDef } from './types';

export const stage10RAG: StageDef = {
  id: "stage-10",
  stageNumber: 10,
  title: "RAG — أنظمة الاسترجاع المعزز",
  description: "بناء أنظمة RAG إنتاجية — تقسيم، تضمين، قواعد متجهات، استرجاع هجين، تقييم.",
  units: [
    {
      id: "unit-ai-55", stageId: "stage-10", unitNumber: 55,
      title: "معمارية RAG",
      description: "Retrieval → Augmentation → Generation pipeline.",
      difficulty: 4, estimatedHours: 4, tags: ["rag", "architecture"],
      content: [
        { type: "h1", content: "الوحدة 55: معمارية RAG" },
        { type: "p", content: "RAG (Retrieval-Augmented Generation) هو أهم نمط معماري في تطبيقات LLM العملية. الفكرة: بدل الاعتماد على معلومات النموذج الداخلية (التي قد تكون قديمة أو غير دقيقة)، نبحث في مستندات خارجية، نضيف المعلومات المسترجعة إلى السياق، ثم نطلب من النموذج الإجابة. هذا يقلل الهلوسة (hallucination) ويسمح بتحديث المعرفة دون إعادة تدريب." },
        { type: "mermaid", content: "flowchart LR\n  Q[\"سؤال المستخدم\"] --> EMB[\"تضمين السؤال\"]\n  DOCS[\"(قاعدة المستندات)\"] --> IDX[\"فهرس متجهات\"]\n  EMB --> SEARCH[\"بحث عن التشابه\"]\n  IDX --> SEARCH\n  SEARCH --> CTX[\"تجميع السياق\"]\n  CTX --> PROMPT[\"بناء الأمر: سياق + سؤال\"]\n  PROMPT --> LLM[\"LLM\"]\n  LLM --> ANS[\"الإجابة النهائية\"]\n  style Q fill:#e3f2fd\n  style ANS fill:#c8e6c9", caption: "خط أنابيب RAG الكامل" },
        { type: "code", language: "python", content: `# RAG Minimal — فهم التدفق الأساسي
# 1. Embed المستندات مرة واحدة
docs = ["Python was created by Guido van Rossum in 1991.",
        "PyTorch was developed by Facebook's AI Research lab.",
        "TensorFlow was created by Google Brain team."]
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')
doc_embs = model.encode(docs)

# 2. عند الاستفسار: ابحث
import numpy as np
query = "Who created Python?"
q_emb = model.encode([query])
scores = np.dot(doc_embs, q_emb.T).flatten()
best_idx = np.argmax(scores)

# 3. ابنِ الـ prompt بالسياق المسترجع
context = docs[best_idx]
final_prompt = f"Context: {context}\\n\\nQuestion: {query}\\nAnswer:"
print(f"✓ المستند المسترجع: {context}")
print(f"✓ الأمر النهائي: {final_prompt}")
print(f"\\nهذا هو RAG — بسيط لكنه فعال جداً!")` }
      ]
    },
    {
      id: "unit-ai-56", stageId: "stage-10", unitNumber: 56,
      title: "معالجة المستندات والتقسيم",
      description: "Recursive, semantic, agentic chunking strategies.",
      difficulty: 4, estimatedHours: 4, tags: ["rag", "chunking"],
      content: [
        { type: "h1", content: "الوحدة 56: معالجة وتقسيم المستندات" },
        { type: "p", content: "جودة RAG تبدأ من التقسيم (Chunking). تقسيم كبير جداً = سياق طويل غير دقيق. تقسيم صغير جداً = فقدان السياق. Recursive Character Splitting: يقسم على الفقرات، ثم الجمل، ثم الكلمات. Semantic Chunking: يقسم حسب المعنى (تغيير الموضوع). Agentic Chunking: نموذج آخر يقرر حدود التقسيم!" },
        { type: "code", language: "python", content: `from langchain.text_splitter import RecursiveCharacterTextSplitter

text = \"\"\"الذكاء الاصطناعي هو فرع من علوم الحاسوب يهدف إلى إنشاء أنظمة
ذكية. يشمل ذلك التعلم الآلي والتعلم العميق ومعالجة اللغات الطبيعية.

التعلم الآلي هو مجموعة من الخوارزميات التي تتعلم من البيانات
دون برمجتها بشكل صريح. هناك ثلاثة أنواع رئيسية: التعلم الموجه،
والتعلم غير الموجه، والتعلم التعزيزي.

التعلم العميق هو فرع متقدم من التعلم الآلي يستخدم الشبكات العصبية
متعددة الطبقات. هذه الشبكات تحاكي طريقة عمل الدماغ البشري.\"\"\"

# Recursive Character Splitting
splitter = RecursiveCharacterTextSplitter(
    chunk_size=250, chunk_overlap=50,
    separators=["\\n\\n", "\\n", ". ", " ", ""]
)
chunks = splitter.split_text(text)
print(f"تم التقسيم إلى {len(chunks)} أجزاء:")
for i, chunk in enumerate(chunks):
    print(f"\\n  جزء {i+1} ({len(chunk)} حرف):")
    print(f"  {chunk[:100]}...")

print(f"\\n✓ chunk_overlap=50: التداخل يمنع قطع المعلومات المهمة")
print(f"  Semantic Chunking: يحلل المعنى وليس الحروف فقط")` }
      ]
    },
    {
      id: "unit-ai-57", stageId: "stage-10", unitNumber: 57,
      title: "نماذج التضمين لـ RAG",
      description: "اختيار التضمينات، fine-tuning للتضمينات.",
      difficulty: 4, estimatedHours: 4, tags: ["rag", "embeddings"],
      content: [
        { type: "h1", content: "الوحدة 57: نماذج التضمين لـ RAG" },
        { type: "p", content: "اختيار نموذج التضمين المناسب هو قرار معماري حاسم. لـ RAG: تريد نموذجاً يفهم السياقات الطويلة (حتى 8192 tokens)، ويدعم العربية إذا كان تطبيقك عربياً، ويكون سريعاً. النماذج الموصى بها: text-embedding-3-large (OpenAI)، Cohere Embed v3، BGE-M3 (BAAI)، و multilingual-e5-large." },
        { type: "code", language: "python", content: `# مقارنة نماذج التضمين لـ RAG
embedding_models = {
    "OpenAI text-embedding-3-small": "1536 بعد — أرخص وأسرع",
    "OpenAI text-embedding-3-large": "3072 بعد — الأفضل أداءً",
    "Cohere Embed v3": "1024 بعد — ممتاز لـ RAG",
    "BGE-M3 (BAAI)": "1024 بعد — مفتوح المصدر، يدعم العربية",
    "multilingual-e5-large": "1024 بعد — متعدد اللغات، ممتاز للعربية",
}

print("نماذج التضمين الموصى بها لـ RAG:")
for model, desc in embedding_models.items():
    print(f"  • {model}")
    print(f"    {desc}")

print(f"\\n✓ قاعدة اختيار التضمين:")
print(f"  ① RAG عربي: jina-embeddings-v3 أو multilingual-e5")
print(f"  ② RAG إنجليزي: text-embedding-3-large (أفضل أداء)")
print(f"  ③ ميزانية محدودة: text-embedding-3-small أو BGE-small")` }
      ]
    },
    {
      id: "unit-ai-58", stageId: "stage-10", unitNumber: 58,
      title: "قواعد البيانات المتجهة",
      description: "Pinecone، Weaviate، Qdrant، Chroma — هندسة قواعد المتجهات.",
      difficulty: 4, estimatedHours: 4, tags: ["rag", "vector-db"],
      content: [
        { type: "h1", content: "الوحدة 58: قواعد البيانات المتجهة" },
        { type: "p", content: "قاعدة المتجهات (Vector DB) هي قلب RAG. تخزن المتجهات وتوفر بحثاً سريعاً بالتشابه. الاختيار يعتمد على: حجم البيانات (ألف vs مليار متجه)، الحاجة للتصفية (metadata filtering)، التكلفة، وسهولة الاستخدام. Pinecone = سحابي سهل. Qdrant = أداء ممتاز. Chroma = للتطوير المحلي السريع." },
        { type: "code", language: "python", content: `# مقارنة Vector DBs
import chromadb
from chromadb.utils import embedding_functions

# Chroma — للتطوير المحلي (الأسهل)
client = chromadb.Client()
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction()

collection = client.create_collection(
    name="my_docs",
    embedding_function=embedding_fn
)

# إضافة مستندات
collection.add(
    documents=["Python هي لغة برمجة", "PyTorch مكتبة تعلم عميق", "FastAPI إطار عمل"],
    ids=["1", "2", "3"]
)

# بحث
results = collection.query(query_texts=["ما هي لغة البرمجة؟"], n_results=2)
print(f"نتائج البحث:")
for i, (doc, dist) in enumerate(zip(results['documents'][0], results['distances'][0])):
    print(f"  {i+1}. {doc} (مسافة: {dist:.3f})")

print(f"\\n✓ Chroma: مثالي للتطوير والنماذج الأولية")
print(f"  Qdrant/Pinecone: للإنتاج ببيانات كبيرة")
print(f"  Weaviate: ميزات متقدمة (hybrid search مدمج)")` }
      ]
    },
    {
      id: "unit-ai-59", stageId: "stage-10", unitNumber: 59,
      title: "الاسترجاع المتقدم",
      description: "Hybrid Search, re-ranking, multi-query, self-query.",
      difficulty: 5, estimatedHours: 5, tags: ["rag", "advanced-retrieval"],
      content: [
        { type: "h1", content: "الوحدة 59: الاسترجاع المتقدم" },
        { type: "p", content: "البحث المتجهي وحده لا يكفي أحياناً. Hybrid Search يجمع: البحث الدلالي (المتجهات) + البحث بالنص (BM25/keyword). Re-ranking: نموذج آخر يعيد ترتيب النتائج بعد الاسترجاع الأولي لتحسين الدقة. Multi-Query: يولد عدة صيغ للاستفسار ويبحث بكل منها. هذه التقنيات المتقدمة تصنع RAG إنتاجياً حقيقياً." },
        { type: "code", language: "python", content: `# Hybrid Search = Vector + Keyword
class HybridSearch:
    \"\"\"يجمع بين البحث الدلالي (vector) والنصي (keyword)\"\"\"
    def __init__(self, vector_weight=0.7):
        self.vector_weight = vector_weight
    
    def search(self, query, vector_results, keyword_results):
        # دمج النتائج مع أوزان
        combined = {}
        for doc_id, score in vector_results:
            combined[doc_id] = self.vector_weight * score
        for doc_id, score in keyword_results:
            combined[doc_id] = combined.get(doc_id, 0) + (1-self.vector_weight) * score
        return sorted(combined.items(), key=lambda x: -x[1])

# Re-ranking
print("استراتيجيات متقدمة:")
print("  ① Hybrid Search: دلالي + نصي — أفضل دقة في الاسترجاع")
print("  ② Re-ranking: Cohere Rerank أو bge-reranker — يحسن الدقة 10-30%")
print("  ③ Multi-Query: 3 صيغ للاستفسار → 3x نتائج → دمج فريد")
print("  ④ Self-Query: النموذج يستنتج metadata filters من الاستفسار")
print(f"\\n✓ هذه الـ 4 تقنيات تحول RAG من 'جيد' إلى 'ممتاز'")` }
      ]
    },
    {
      id: "unit-ai-60", stageId: "stage-10", unitNumber: 60,
      title: "تقييم RAG",
      description: "RAGAS, faithfulness, relevance, context precision/recall.",
      difficulty: 4, estimatedHours: 4, tags: ["rag", "evaluation"],
      content: [
        { type: "h1", content: "الوحدة 60: تقييم RAG" },
        { type: "p", content: "كيف تعرف أن نظام RAG الخاص بك جيد؟ RAGAS (RAG Assessment) هو الإطار المعياري: يقيس Faithfulness (هل الإجابة مبنية فعلاً على السياق؟)، Answer Relevance (هل الإجابة مفيدة؟)، Context Precision/Recall (هل استرجعنا المستندات الصحيحة؟). بدون تقييم منهجي، تحسين RAG مجرد تخمين." },
        { type: "code", language: "python", content: `# RAGAS — إطار تقييم RAG
# from ragas import evaluate
# from ragas.metrics import faithfulness, answer_relevancy, context_precision, context_recall

print("مقاييس RAGAS الأساسية:")
metrics = {
    "Faithfulness": "هل الإجابة مستندة فعلاً للسياق المُسترجع؟ (0-1)",
    "Answer Relevancy": "هل الإجابة مفيدة وتجيب على السؤال؟ (0-1)",
    "Context Precision": "نسبة المستندات المسترجعة المرتبطة فعلاً",
    "Context Recall": "نسبة المستندات المرتبطة التي استرجعناها",
}
for metric, desc in metrics.items():
    print(f"  • {metric}: {desc}")

print(f"\\n✓ دورة تحسين RAG:")
print(f"  ① قيّم باستخدام RAGAS → حدد نقاط الضعف")
print(f"  ② حسّن التقسيم (chunking)")
print(f"  ③ جرب نموذج تضمين آخر")
print(f"  ④ أضف re-ranking")
print(f"  ⑤ أعد التقييم — كرر حتى تصل للهدف")` }
      ]
    }
  ]
};
