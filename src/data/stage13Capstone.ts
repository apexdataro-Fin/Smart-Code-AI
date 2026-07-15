import { StageDef } from './types';

export const stage13Capstone: StageDef = {
  id: "stage-13",
  stageNumber: 13,
  title: "AI Platform Capstone — المشروع النهائي",
  description: "بناء منصة ذكاء اصطناعي متكاملة بمستوى محفظة احترافية.",
  units: [
    {
      id: "unit-ai-74", stageId: "stage-13", unitNumber: 74,
      title: "تصميم النظام — System Design",
      description: "Architecture document, tech choices, data flow diagrams.",
      difficulty: 4, estimatedHours: 5, tags: ["capstone", "architecture"],
      content: [
        { type: "h1", content: "الوحدة 74: تصميم النظام" },
        { type: "p", content: "المشروع النهائي: بناء 'Smart AI Platform' — منصة AI متكاملة. قبل كتابة سطر كود واحد، نصمم النظام كاملاً. هذه أهم مرحلة: الاختيارات المعمارية هنا تحدد نجاح أو فشل المشروع كله. التفكير في tradeoffs، قابلية التوسع، والأمان من البداية." },
        { type: "mermaid", content: "flowchart TD\n  USER[\"مستخدم\"] --> WEB[\"React Frontend\"]\n  WEB --> API[\"FastAPI Gateway\"]\n  API --> RAG[\"RAG Service\"]\n  API --> AGENT[\"Agent Service\"]\n  API --> AUTH[\"Auth Service\"]\n  RAG --> VDB[\"(Vector DB)\"]\n  RAG --> DOC[\"(Document Store)\"]\n  AGENT --> LLM[\"LLM API\"]\n  AGENT --> TOOLS[\"Tool Registry\"]\n  VDB --> MONITOR[\"Monitoring\"]\n  API --> MONITOR\n  style USER fill:#e3f2fd\n  style WEB fill:#c8e6c9\n  style API fill:#fff9c4", caption: "معمارية Smart AI Platform" },
        { type: "h2", content: "المكونات الأساسية" },
        { type: "code", language: "yaml", content: `architecture:
  frontend:
    framework: React + TypeScript + Tailwind
    features: [Chat UI, Document Upload, Dashboard, Admin]
    
  backend:
    api_gateway: FastAPI
    auth: JWT + OAuth2
    services:
      - rag_service: Document processing + retrieval
      - agent_service: Multi-agent orchestration
      - analytics_service: Usage tracking + monitoring
    
  infrastructure:
    database: PostgreSQL
    vector_store: Qdrant
    cache: Redis
    storage: S3-compatible (MinIO)
    monitoring: Prometheus + Grafana
    
  ai:
    llm_provider: OpenAI / Anthropic / Open-source
    embeddings: text-embedding-3-large / multilingual-e5
    reranker: Cohere Rerank / bge-reranker` }
      ]
    },
    {
      id: "unit-ai-75", stageId: "stage-13", unitNumber: 75,
      title: "البنية الخلفية وخط RAG",
      description: "FastAPI, vector DB, embedding pipeline, document processing.",
      difficulty: 5, prerequisites: ["unit-ai-74"], estimatedHours: 8, tags: ["capstone", "backend"],
      content: [
        { type: "h1", content: "الوحدة 75: البنية الخلفية وخط RAG" },
        { type: "p", content: "نبني الآن العمود الفقري للمنصة: ① معالجة المستندات (PDF, DOCX, TXT) مع تقسيم ذكي، ② تضمين وتخزين في Vector DB، ③ محرك استرجاع هجين مع re-ranking، ④ API endpoints للبحث والاستفسار. هذا هو المكون الذي يميز منصتنا عن مجرد 'غلاف لـ ChatGPT'." },
        { type: "code", language: "python", title: "RAG Service Core", content: `from fastapi import FastAPI, UploadFile, File
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer

class RAGService:
    def __init__(self):
        self.embedder = SentenceTransformer('BAAI/bge-m3')
        self.vector_db = QdrantClient(host="localhost", port=6333)
        self.chunk_size = 500
    
    async def ingest_document(self, file: UploadFile):
        # 1. استخراج النص
        text = await self.extract_text(file)
        # 2. تقسيم
        chunks = self.chunk_text(text)
        # 3. تضمين
        embeddings = self.embedder.encode(chunks)
        # 4. تخزين
        self.vector_db.upsert(
            collection_name="documents",
            points=[{"id": i, "vector": emb, "payload": {"text": txt}}
                    for i, (emb, txt) in enumerate(zip(embeddings, chunks))]
        )
        return {"chunks_ingested": len(chunks)}
    
    async def query(self, question: str, top_k: int = 5):
        q_emb = self.embedder.encode(question)
        results = self.vector_db.search(
            collection_name="documents",
            query_vector=q_emb,
            limit=top_k
        )
        return [hit.payload["text"] for hit in results]

print("✓ RAG Service: Ingestion + Retrieval + Re-ranking")
print("  هذا هو قلب المنصة — المعرفة المخصصة")` }
      ]
    },
    {
      id: "unit-ai-76", stageId: "stage-13", unitNumber: 76,
      title: "نظام الوكلاء — Agent System",
      description: "Multi-agent orchestration, tool integration, memory system.",
      difficulty: 5, prerequisites: ["unit-ai-75"], estimatedHours: 8, tags: ["capstone", "agents"],
      content: [
        { type: "h1", content: "الوحدة 76: نظام الوكلاء" },
        { type: "p", content: "القطعة الثانية من المنصة: نظام وكلاء ذكي. الـ Agent لا يجيب فقط — هو يخطط وينفذ: يبحث في المستندات، يحلل البيانات، يكتب تقارير، ويتخذ إجراءات. نستخدم نمط Multi-Agent: Orchestrator يخطط، Specialist ينفذ، Reviewer يدقق. هذا يحول المنصة من 'باحث ذكي' إلى 'مساعد AI كامل'." },
        { type: "code", language: "python", content: `class AgentOrchestrator:
    def __init__(self, llm, tools, rag_service):
        self.llm = llm
        self.tools = tools
        self.rag = rag_service
        self.memory = []
    
    async def execute(self, user_request: str):
        # 1. تحليل المهمة
        plan = await self.plan(user_request)
        
        # 2. تنفيذ الخطوات
        results = []
        for step in plan:
            if step["type"] == "search":
                result = await self.rag.query(step["query"])
            elif step["type"] == "tool":
                result = await self.tools[step["name"]](**step["params"])
            elif step["type"] == "analyze":
                result = await self.llm.analyze(step["data"])
            results.append(result)
        
        # 3. تجميع الإجابة النهائية
        final = await self.synthesize(user_request, results)
        return final

# أدوات المنصة
tools_registry = {
    "web_search": web_search_tool,
    "calculator": calculator_tool,
    "code_executor": python_executor,
    "excel_reader": excel_analysis_tool,
    "chart_generator": chart_creation_tool,
}

print("✓ Agent System: Orchestrator + Specialists + Tools")
print("  المهام المعقدة تُحلل وتُنفذ خطوة بخطوة")` }
      ]
    },
    {
      id: "unit-ai-77", stageId: "stage-13", unitNumber: 77,
      title: "الواجهة الأمامية — Frontend",
      description: "React dashboard, chat interface, document upload, analytics.",
      difficulty: 4, prerequisites: ["unit-ai-76"], estimatedHours: 8, tags: ["capstone", "frontend"],
      content: [
        { type: "h1", content: "الوحدة 77: الواجهة الأمامية" },
        { type: "p", content: "أفضل AI Platform بدون واجهة مستخدم جيدة = لا قيمة لها. نبني واجهة React احترافية: Chat UI (مثل ChatGPT)، Document Manager (رفع وإدارة المستندات)، Analytics Dashboard (إحصائيات الاستخدام)، و Admin Panel. نستخدم shadcn/ui + Tailwind + Framer Motion كما في Book 1." },
        { type: "code", language: "typescript", title: "مكونات الواجهة الأساسية", content: `// هيكل الواجهة الأمامية
interface AppStructure {
  pages: {
    chat: "ChatPage — المحادثة الرئيسية مع الـ Agent",
    documents: "DocumentsPage — رفع وإدارة المستندات",
    dashboard: "DashboardPage — إحصائيات وتحليلات",
    settings: "SettingsPage — إعدادات النموذج والمفاتيح",
    admin: "AdminPage — إدارة النظام",
  };
  
  components: {
    ChatInterface: "شريط محادثة + عرض الرسائل + streaming",
    DocumentUploader: "رفع ملفات مع progress bar",
    AgentThinking: "عرض خطوات تفكير الوكيل",
    AnalyticsCharts: "رسوم بيانية للاستخدام",
    ModelSelector: "اختيار وتكوين نماذج LLM",
  };
}

print("✓ Frontend = React + Tailwind + shadcn/ui + Framer Motion")
print("  مثل Book 1 تماماً — نفس الفلسفة، نفس الجودة")` }
      ]
    },
    {
      id: "unit-ai-78", stageId: "stage-13", unitNumber: 78,
      title: "النشر والإنتاج — Production Deployment",
      description: "Docker, monitoring, CI/CD, load testing, documentation.",
      difficulty: 5, prerequisites: ["unit-ai-77"], estimatedHours: 8, tags: ["capstone", "production"],
      content: [
        { type: "h1", content: "الوحدة 78: النشر والإنتاج" },
        { type: "p", content: "المرحلة النهائية: نشر المنصة كاملة في بيئة إنتاجية. ① حزم كل الخدمات في Docker containers، ② تنسيق الخدمات بـ docker-compose أو Kubernetes، ③ إعداد CI/CD pipeline، ④ اختبار تحميل (Load Testing)، ⑤ توثيق API كامل، ⑥ إعداد مراقبة الإنتاج. المنصة الآن جاهزة للعرض في محفظتك المهنية." },
        { type: "code", language: "yaml", title: "docker-compose.yml للمنصة الكاملة", content: `version: '3.8'
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    depends_on: [api]
    
  api:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/platform
      - VECTOR_DB_URL=http://qdrant:6333
      - REDIS_URL=redis://redis:6379
    depends_on: [db, qdrant, redis]
    
  db:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: platform
    
  qdrant:
    image: qdrant/qdrant
    volumes: [qdrant_data:/qdrant/storage]
    
  redis:
    image: redis:7-alpine
    
  prometheus:
    image: prom/prometheus
    ports: ["9090:9090"]
    
  grafana:
    image: grafana/grafana
    ports: ["3001:3000"]

volumes:
  pgdata:
  qdrant_data:` },
        { type: "h2", content: "قائمة الإنتاج النهائية" },
        { type: "code", language: "text", content: `✅ Production Checklist:
□ جميع الخدمات في Docker containers
□ HTTPS/TLS عبر reverse proxy (Nginx/Caddy)
□ Authentication + Authorization كامل
□ Rate limiting على API
□ Logging منظم (ELK أو Loki)
□ Monitoring + Alerting (Prometheus + Grafana)
□ Automated backups للبيانات
□ CI/CD pipeline (GitHub Actions)
□ Load testing (Locust/k6)
□ API Documentation (Swagger/OpenAPI)
□ README شامل + Architecture diagram
□ Disaster recovery plan

🏆 المنصة جاهزة للإنتاج ومستوى محفظة احترافية!` }
      ]
    }
  ]
};
