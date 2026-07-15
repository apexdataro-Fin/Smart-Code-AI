import { StageDef } from './types';

export const stage11Agents: StageDef = {
  id: "stage-11",
  stageNumber: 11,
  title: "AI Agents — الوكلاء الأذكياء",
  description: "تصميم وبناء وكلاء ذكاء اصطناعي — تخطيط، أدوات، ذاكرة، أنظمة متعددة.",
  units: [
    {
      id: "unit-ai-61", stageId: "stage-11", unitNumber: 61,
      title: "أساسيات الوكلاء",
      description: "ReAct pattern, reasoning loops, action spaces.",
      difficulty: 4, estimatedHours: 4, tags: ["agents", "react"],
      content: [
        { type: "h1", content: "الوحدة 61: أساسيات الوكلاء الأذكياء" },
        { type: "p", content: "الوكيل (Agent) هو LLM يمكنه التفاعل مع العالم: استخدام أدوات، اتخاذ قرارات، تذكر معلومات، والتخطيط لمهام متعددة الخطوات. الفرق بين LLM و Agent: LLM تجيب على سؤال. Agent تنجز مهمة. ReAct (Reasoning + Acting) هو النمط الأساسي: فكر ← تصرف ← لاحظ ← فكر ← تصرف..." },
        { type: "mermaid", content: "flowchart TD\n  TASK[\"مهمة\"] --> THINK[\"تفكير: ما الخطوة التالية؟\"]\n  THINK --> ACT[\"تصرف: استخدم أداة\"]\n  ACT --> OBSERVE[\"لاحظ: نتيجة الأداة\"]\n  OBSERVE --> DECISION{\"اكتملت المهمة؟\"}\n  DECISION -->|لا| THINK\n  DECISION -->|نعم| DONE[\"إنهاء + إجابة\"]\n  style TASK fill:#e3f2fd\n  style DONE fill:#c8e6c9", caption: "حلقة ReAct — فكر ← تصرف ← لاحظ" },
        { type: "code", language: "python", content: `# Agent = LLM + Tools + Loop
class SimpleAgent:
    def __init__(self, llm_call, tools: dict):
        self.llm = llm_call  # دالة تستدعي LLM
        self.tools = tools    # {"tool_name": tool_function}
    
    def run(self, task: str, max_steps=10):
        history = [f"مهمة: {task}"]
        
        for step in range(max_steps):
            # 1. فكر: اسأل LLM ماذا تفعل
            response = self.llm("\\n".join(history))
            
            # 2. تصرف: نفذ الإجراء
            if "TOOL:" in response:
                tool_name = response.split("TOOL:")[1].strip()
                result = self.tools.get(tool_name, lambda: "أداة غير معروفة")()
                history.append(f"TOOL RESULT: {result}")
            elif "FINAL:" in response:
                return response.split("FINAL:")[1].strip()
            else:
                history.append(response)
        
        return "تعذر إكمال المهمة"

# أدوات بسيطة
def calculator(): return "حاسبة جاهزة"
def web_search(): return "نتائج البحث: ..."

agent = SimpleAgent(lambda x: "سأستخدم الحاسبة TOOL: calculator", {"calculator": calculator})
print("Agent = LLM (يفكر) + Tools (ينفذ) + Loop (يكرر)")
print("✓ هذا هو أساس كل أنظمة الوكلاء!")` }
      ]
    },
    {
      id: "unit-ai-62", stageId: "stage-11", unitNumber: 62,
      title: "استدعاء الأدوات — Tool Calling",
      description: "OpenAI function calling, tool definitions, error handling.",
      difficulty: 4, prerequisites: ["unit-ai-61"], estimatedHours: 4, tags: ["agents", "tools"],
      content: [
        { type: "h1", content: "الوحدة 62: استدعاء الأدوات" },
        { type: "p", content: "Function Calling هو الآلية التي تسمح للـ LLM باستدعاء دوال برمجية. تعرّف الأدوات بمخطط JSON Schema، والنموذج يقرر: أي أداة يحتاج؟ ما المعاملات المطلوبة؟ ثم تنفذ الكود وتعيد النتيجة للنموذج. OpenAI، Anthropic، Gemini جميعهم يدعمون Function Calling أصلياً الآن." },
        { type: "code", language: "python", content: `# تعريف الأدوات (Function Calling schema)
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather for a city",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "City name"},
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
                },
                "required": ["city"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_database",
            "description": "Search the internal database",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "limit": {"type": "integer", "default": 5}
                },
                "required": ["query"]
            }
        }
    }
]

# تدفق استدعاء الأداة:
# 1. أرسل query + tools للنموذج
# 2. النموذج يقرر: tool_name + arguments
# 3. نفذ الأداة function(**arguments)
# 4. أرسل result للنموذج + تابع المحادثة

print("✓ Function Calling = النموذج يقرر متى يستخدم أداة وبأي معاملات")
print("  يدعمها: OpenAI, Anthropic, Gemini, Mistral")` }
      ]
    },
    {
      id: "unit-ai-63", stageId: "stage-11", unitNumber: 63,
      title: "الذاكرة والحالة",
      description: "Short-term, long-term, working memory, vector-based memory.",
      difficulty: 4, prerequisites: ["unit-ai-61"], estimatedHours: 4, tags: ["agents", "memory"],
      content: [
        { type: "h1", content: "الوحدة 63: الذاكرة والحالة" },
        { type: "p", content: "الوكيل بدون ذاكرة = سمكة ذهبية — ينسى كل شيء بعد كل خطوة. الذاكرة أنواع: قصيرة المدى (نافذة السياق الحالية — آخر n رسالة)، عاملة (Scratchpad — ملاحظات مؤقتة للمهمة الحالية)، طويلة المدى (قاعدة متجهات تخزن خبرات سابقة). الذاكرة طويلة المدى هي ما يميز وكيلاً 'يتعلم' من تجاربه." },
        { type: "code", language: "python", content: `class AgentMemory:
    def __init__(self, max_short_term=20):
        self.short_term = []  # نافذة السياق
        self.scratchpad = {}  # ذاكرة عاملة
        self.long_term = {}   # قاعدة متجهات (محاكاة)
        self.max_short = max_short_term
    
    def remember(self, key, value):
        self.scratchpad[key] = value
    
    def recall(self, key):
        return self.scratchpad.get(key, None)
    
    def store_long_term(self, experience, embedding):
        self.long_term[experience] = embedding
    
    def search_memory(self, query_embedding):
        # بحث بأقرب متجه (محاكاة)
        if not self.long_term:
            return []
        return sorted(self.long_term.items(), 
                     key=lambda x: np.dot(x[1], query_embedding))[-5:]

print("✓ ذاكرة الوكيل ثلاثية المستويات:")
print("  ① Short-term: نافذة المحادثة (مثل context window)")
print("  ② Working (Scratchpad): ملاحظات مؤقتة")
print("  ③ Long-term: قاعدة متجهات — خبرات دائمة")
print(f"\\n  MemGPT/Letta: نظام ذاكرة متقدم للوكلاء")` }
      ]
    },
    {
      id: "unit-ai-64", stageId: "stage-11", unitNumber: 64,
      title: "التخطيط والتحليل",
      description: "Task decomposition, plan-and-execute, hierarchical planning.",
      difficulty: 5, prerequisites: ["unit-ai-61"], estimatedHours: 5, tags: ["agents", "planning"],
      content: [
        { type: "h1", content: "الوحدة 64: التخطيط والتحليل" },
        { type: "p", content: "الوكيل الذكي لا ينفذ فوراً — يخطط أولاً. Plan-and-Execute: يضع خطة (خطوة 1، خطوة 2، ...)، ثم ينفذها خطوة بخطوة. Hierarchical Planning: يقسم المهمة لمهام فرعية، وكل مهمة فرعية لخطوات أصغر. ReWOO: يخطط مرة واحدة، ينفذ بدون تفكير وسيط (أسرع وأرخص)." },
        { type: "code", language: "python", content: `# Plan-and-Execute Pattern
def plan_and_execute(task: str, llm, tools):
    # المرحلة 1: التخطيط
    plan_prompt = f\"\"\"قم بتحليل المهمة وضع خطة خطوة بخطوة:
المهمة: {task}

أخرج الخطة على شكل:
PLAN:
1. [الخطوة الأولى]
2. [الخطوة الثانية]
...\"\"\"
    
    plan = llm(plan_prompt)
    steps = [s.strip() for s in plan.split("\\n") if s.strip().startswith(tuple("0123456789"))]
    
    # المرحلة 2: التنفيذ
    results = []
    for i, step in enumerate(steps):
        result = llm(f"نفذ الخطوة {i+1}: {step}")
        results.append(result)
    
    return "\\n".join(results)

print("أنماط التخطيط:")
print("  Plan-and-Execute: خطط ← نفذ — الأكثر موثوقية")
print("  ReWOO: خطط مرة واحدة، نفذ بدون LLM وسيط — أسرع")
print("  Hierarchical: مهام → مهام فرعية → خطوات")
print("  LLMCompiler: DAG للتخطيط المتوازي")` }
      ]
    },
    {
      id: "unit-ai-65", stageId: "stage-11", unitNumber: 65,
      title: "الأنظمة متعددة الوكلاء",
      description: "Agent communication, orchestration, debate, collaboration.",
      difficulty: 5, prerequisites: ["unit-ai-64"], estimatedHours: 5, tags: ["agents", "multi-agent"],
      content: [
        { type: "h1", content: "الوحدة 65: الأنظمة متعددة الوكلاء" },
        { type: "p", content: "لماذا وكيل واحد بينما يمكن أن يكون لديك فريق؟ Multi-Agent Systems: عدة وكلاء متخصصون يتعاونون. مهندس + مراجع + مختبر — كل منهم له دور وخبرة. يمكنهم: مناقشة (Debate)، تصويت (Voting)، تبادل أدوار (Round-robin). Anthropic أظهرت أن وكيلين يتعاونان ينتجان كوداً أفضل من وكيل واحد." },
        { type: "mermaid", content: "flowchart TD\n  USER[\"مهمة المستخدم\"] --> ORCH[\"Orchestrator\"]\n  ORCH --> A1[\"وكيل 1: مخطط\"]\n  ORCH --> A2[\"وكيل 2: منفذ\"]\n  ORCH --> A3[\"وكيل 3: مراجع\"]\n  A1 --> SHARED[\"ذاكرة مشتركة\"]\n  A2 --> SHARED\n  A3 --> SHARED\n  SHARED --> FINAL[\"النتيجة النهائية\"]\n  style USER fill:#e3f2fd\n  style FINAL fill:#c8e6c9", caption: "Multi-Agent System — فريق من المتخصصين" },
        { type: "code", language: "python", content: `# أنماط Multi-Agent
class MultiAgentPatterns:
    patterns = {
        "Sequential": "وكيل 1 ← وكيل 2 ← وكيل 3 (خط تجميع)",
        "Debate": "وكيلان يتناقشان، حكم يختار الأفضل",
        "Hierarchical": "مدير يوزع المهام على فريق متخصص",
        "Voting": "3+ وكلاء مستقلون، الأغلبية تحسم",
    }

print("أطر Multi-Agent:")
print("  CrewAI: الأسهل — عرّف agents + tasks")
print("  AutoGen (Microsoft): الأقوى للمؤسسات")
print("  LangGraph: الأكثر مرونة — حوّل بين agents بحالات")
print(f"\\n✓ متى تحتاج Multi-Agent؟")
print(f"  المهمة معقدة وتحتاج تخصصات مختلفة")
print(f"  تحتاج مراجعة وتدقيق (Agent + Reviewer)")
print(f"  تريد استكشاف حلول متعددة ومقارنتها")` }
      ]
    },
    {
      id: "unit-ai-66", stageId: "stage-11", unitNumber: 66,
      title: "أطر عمل الوكلاء",
      description: "LangChain, CrewAI, AutoGen — مقارنة الأطر.",
      difficulty: 4, estimatedHours: 4, tags: ["agents", "frameworks"],
      content: [
        { type: "h1", content: "الوحدة 66: أطر عمل الوكلاء" },
        { type: "p", content: "لا تبني Agent framework من الصفر (إلا للتعلم). الأطر الجاهزة توفر: إدارة الذاكرة، استدعاء الأدوات، التخطيط، logging، ومعالجة الأخطاء. LangChain = الأكثر انتشاراً. CrewAI = الأسهل لـ multi-agent. AutoGen = الأقوى للمؤسسات. LangGraph = تحكم كامل بالـ state machine." },
        { type: "code", language: "python", content: `# مقارنة أطر الوكلاء
frameworks = {
    "LangChain": "الأكثر شمولاً — RAG + Agents + Tools (مجتمع ضخم)",
    "LangGraph": "State machine للوكلاء — تحكم كامل في التدفق",
    "CrewAI": "أسهل multi-agent — عرّف agents و tasks فقط",
    "AutoGen (Microsoft)": "قوي للمؤسسات — محادثات بين وكلاء متعددين",
    "DSPy": "برمجة وليس prompting — يحسن الـ prompts آلياً",
}

print("دليل اختيار framework:")
for name, desc in frameworks.items():
    print(f"  • {name}: {desc}")

print(f"\\n✓ ابدأ بـ LangChain للتعلم")
print(f"  استخدم CrewAI لـ multi-agent السريع")
print(f"  استخدم LangGraph للتحكم الكامل في التدفق")
print(f"  استخدم AutoGen للتطبيقات المؤسسية المعقدة")` }
      ]
    },
    {
      id: "unit-ai-67", stageId: "stage-11", unitNumber: 67,
      title: "سير العمل الذاتي — Autonomous Workflows",
      description: "Web agents, code agents, research agents.",
      difficulty: 5, estimatedHours: 5, tags: ["agents", "autonomous"],
      content: [
        { type: "h1", content: "الوحدة 67: سير العمل الذاتي" },
        { type: "p", content: "الجيل القادم من الوكلاء: Autonomous Agents تستطيع إنجاز مهام معقدة بدون تدخل بشري. Web Agent: يتصفح الإنترنت، يملأ نماذج، يستخرج بيانات. Code Agent: يكتب كود، يختبره، يصلح الأخطاء، ينشره. Research Agent: يبحث، يلخص، يقارن، يكتب تقارير. هذه هي حدود AI Engineering في 2025-2026." },
        { type: "code", language: "python", content: `# أنماط الوكلاء الذاتية
autonomous_patterns = {
    "Web Agent": "Playwright/Selenium + LLM → يتصفح الويب كالبشر",
    "Code Agent": "يكتب كود → يشغل → يقرأ الأخطاء → يصلح → يكرر",
    "Research Agent": "يبحث (Tavily/SerpAPI) → يلخص → يقارن → يكتب تقرير",
    "SWE Agent": "يفهم issue → يبحث في codebase → يكتب patch → يختبر",
    "Data Agent": "يفهم السؤال → يكتب SQL/Pandas → يحلل → يرسم",
}

print("الجيل القادم من الوكلاء:")
for agent_type, desc in autonomous_patterns.items():
    print(f"  • {agent_type}: {desc}")

print(f"\\n✓ Devin, SWE-Agent, OpenDevin: وكلاء برمجة ذاتية")
print(f"  Anthropic Computer Use: وكيل يستخدم الكمبيوتر كالبشر")
print(f"  هذا هو مستقبل AI Engineering — وكلاء تنجز مهام كاملة!")` }
      ]
    }
  ]
};
