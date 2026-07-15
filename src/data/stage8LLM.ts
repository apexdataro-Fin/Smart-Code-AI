import { StageDef } from './types';

export const stage8LLM: StageDef = {
  id: "stage-8",
  stageNumber: 8,
  title: "LLMs — النماذج اللغوية الكبيرة",
  description: "فهم الجيل الجديد من الداخل — GPT، Claude، Gemini والنماذج مفتوحة المصدر.",
  units: [
    {
      id: "unit-ai-43", stageId: "stage-8", unitNumber: 43,
      title: "معمارية LLM من الداخل",
      description: "GPT architecture, decoder-only, pre-training objectives.",
      difficulty: 5, estimatedHours: 5, tags: ["llm", "gpt", "architecture"],
      content: [
        { type: "h1", content: "الوحدة 43: معمارية LLM من الداخل" },
        { type: "p", content: "ChatGPT، Claude، Gemini — كلها نماذج لغوية كبيرة (LLMs) مبنية على Transformer. GPT يستخدم decoder-only architecture: يتنبأ بالكلمة التالية بناءً على كل الكلمات السابقة. الفكرة بسيطة: P(كلمة_تالية | كل_الكلمات_السابقة). لكن التنفيذ يحتاج مليارات المعاملات وتريليونات الكلمات التدريبية." },
        { type: "mermaid", content: "graph TD\n  INPUT[\"نص المدخل\"] --> TOK[\"Tokenizer\"]\n  TOK --> EMB[\"Token Embeddings\"]\n  EMB --> POS[\"+ Positional Encoding\"]\n  POS --> BLOCK1[\"Transformer Block 1\"]\n  BLOCK1 --> BLOCK2[\"Block 2\"]\n  BLOCK2 --> DOTS[\"...\"]\n  DOTS --> BLOCKN[\"Block N\"]\n  BLOCKN --> LM[\"LM Head\"]\n  LM --> OUTPUT[\"احتمالات الكلمة التالية\"]\n  style INPUT fill:#e3f2fd\n  style OUTPUT fill:#c8e6c9", caption: "مسار GPT — من النص للاحتمالات" },
        { type: "code", language: "python", content: `from transformers import AutoModelForCausalLM, AutoTokenizer

# نموذج GPT-2 (نسخة صغيرة للتعلم)
model_name = "gpt2"
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token
model = AutoModelForCausalLM.from_pretrained(model_name)

print(f"GPT-2 Parameters: {sum(p.numel() for p in model.parameters()):,}")
print(f"GPT-4 Parameters: ~1,760,000,000,000 (تقديري — 1.76 تريليون)")

# توليد نص
prompt = "Artificial intelligence is"
inputs = tokenizer(prompt, return_tensors="pt")
outputs = model.generate(**inputs, max_new_tokens=30, temperature=0.7, do_sample=True)
generated = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(f"\\nPrompt: '{prompt}'")
print(f"Generated: '{generated}'")

# الاحتمالات — النموذج يرى كل كلمة ممكنة
print(f"\\n✓ Vocab size: {model.config.vocab_size} — النموذج يختار من بين 50,257 كلمة!")` }
      ]
    },
    {
      id: "unit-ai-44", stageId: "stage-8", unitNumber: 44,
      title: "Tokenization — تحويل النص لرموز",
      description: "BPE, WordPiece, SentencePiece — لماذا تكسر بعض الكلمات.",
      difficulty: 4, estimatedHours: 4, tags: ["llm", "tokenization"],
      content: [
        { type: "h1", content: "الوحدة 44: Tokenization" },
        { type: "p", content: "Tokenization هو الخطوة الأولى الحاسمة: تحويل النص إلى أعداد صحيحة. معظم النماذج تستخدم BPE (Byte-Pair Encoding): تبدأ بالأحرف، ثم تدمج الأزواج الأكثر تكراراً تدريجياً. هذا يفسر لماذا 'unbelievable' قد تصبح ['un', 'believe', 'able'] — النموذج يرى أجزاء الكلمات وليس الكلمة الكاملة." },
        { type: "code", language: "python", content: `from transformers import AutoTokenizer

# مقارنة tokenizers مختلفة
text = "The transformer architecture revolutionized AI."
arabic_text = "الذكاء الاصطناعي يغير العالم"

for name in ["gpt2", "bert-base-uncased"]:
    tok = AutoTokenizer.from_pretrained(name)
    tokens = tok.tokenize(text)
    ids = tok.encode(text)
    print(f"{name}:")
    print(f"  Tokens: {tokens}")
    print(f"  IDs: {ids}")
    print(f"  Count: {len(tokens)} tokens")
    print()

# لماذا tokenization مهم عربياً؟
tok_arabic = AutoTokenizer.from_pretrained("gpt2")
arabic_ids = tok_arabic.encode(arabic_text)
print(f"GPT-2 مع النص العربي:")
print(f"  نص: {arabic_text}")
print(f"  IDs: {arabic_ids}")
print(f"  عدد الرموز: {len(arabic_ids)} (أكثر من المتوقع — GPT-2 ليس أمثل للعربية)")
print(f"\\n💡 لكل لغة خصائص tokenization — استخدم نموذجاً مدرباً على لغتك!")` }
      ]
    },
    {
      id: "unit-ai-45", stageId: "stage-8", unitNumber: 45,
      title: "الاستدلال والمعايرة — Inference & Sampling",
      description: "Temperature, top-k, top-p, beam search.",
      difficulty: 4, prerequisites: ["unit-ai-43"], estimatedHours: 4, tags: ["llm", "inference"],
      content: [
        { type: "h1", content: "الوحدة 45: الاستدلال والمعايرة" },
        { type: "p", content: "النموذج ينتج توزيعاً احتمالياً على كل الكلمات الممكنة. كيف نختار الكلمة التالية؟ Greedy (دائماً الأكثر احتمالاً) = ممل ومكرر. Temperature > 1 = إبداع عشوائي. Temperature < 1 = تحفظ. Top-k = اختر من أفضل k كلمة. Top-p (nucleus) = اختر من أصغر مجموعة كلمات مجموع احتمالاتها ≥ p. هذه المعاملات تتحكم في 'شخصية' النموذج." },
        { type: "code", language: "python", content: `# تأثير temperature و top-p
prompt = "Once upon a time in a"

configs = [
    ("Greedy", dict(temperature=1.0, do_sample=False, max_new_tokens=20)),
    ("Temp=0.3", dict(temperature=0.3, do_sample=True, max_new_tokens=20)),
    ("Temp=1.0", dict(temperature=1.0, do_sample=True, max_new_tokens=20)),
    ("Temp=1.5, top_p=0.9", dict(temperature=1.5, do_sample=True, top_p=0.9, max_new_tokens=20)),
]

for name, kwargs in configs:
    outputs = model.generate(**inputs, **kwargs)
    text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    print(f"\\n{name}: {text}")

print(f"\\n💡 Temperature=0 → factual/conservative (للإجابات الدقيقة)")
print(f"   Temperature=1 → creative (للكتابة الإبداعية)")
print(f"   Top-p=0.9 → nucleus sampling (الأكثر استخداماً)")` }
      ]
    },
    {
      id: "unit-ai-46", stageId: "stage-8", unitNumber: 46,
      title: "نوافذ السياق والذاكرة",
      description: "Position encoding, context length, attention optimizations.",
      difficulty: 4, estimatedHours: 4, tags: ["llm", "context"],
      content: [
        { type: "h1", content: "الوحدة 46: نوافذ السياق والذاكرة" },
        { type: "p", content: "نافذة السياق (Context Window) = كم كلمة يستطيع النموذج 'رؤيتها' في آن واحد. GPT-3: 2K tokens. GPT-4: حتى 128K. Claude 3: حتى 200K. Gemini 1.5 Pro: حتى 1M tokens. الحجم الأكبر = معالجة مستندات كاملة في مرة واحدة. لكن الانتباه (attention) يكلف O(n²) — لهذا نحتاج Flash Attention و Ring Attention للسياقات الطويلة." },
        { type: "code", language: "python", content: `# محاكاة: عد الرموز وتكلفة السياق
def estimate_attention_cost(seq_len, d_model=4096):
    \"\"\"تكلفة الـ self-attention: O(n²·d)\"\"\"
    ops = seq_len ** 2 * d_model
    return ops / 1e9  # مليارات العمليات

lengths = [1024, 4096, 16384, 65536, 131072]
print("تكلفة Self-Attention:")
print(f"{'Seq Len':>10} | {'GFLOPs':>12} | {'نسبة لـ 1K':>12}")
for l in lengths:
    cost = estimate_attention_cost(l)
    ratio = cost / estimate_attention_cost(1024)
    print(f"{l:>10} | {cost:>10.1f} G | {ratio:>10.0f}x")

print(f"\\n💡 مضاعفة الطول = 4x تكلفة الـ attention!")
print(f"   Flash Attention يقلل التكلفة 2-4x بتحسين الذاكرة")
print(f"   Ring Attention يوزع السياق على عدة GPUs")` }
      ]
    },
    {
      id: "unit-ai-47", stageId: "stage-8", unitNumber: 47,
      title: "النماذج مفتوحة المصدر",
      description: "LLaMA, Mistral, Gemma — تشغيل النماذج محلياً.",
      difficulty: 4, estimatedHours: 4, tags: ["llm", "open-source"],
      content: [
        { type: "h1", content: "الوحدة 47: النماذج مفتوحة المصدر" },
        { type: "p", content: "لسنا مضطرين لاستخدام GPT-4 فقط. النماذج مفتوحة المصدر تقدم أداءً منافساً: LLaMA 3 (Meta)، Mistral، Gemma (Google)، Phi-3 (Microsoft). الميزة: تشغيل محلي، تخصيص كامل (fine-tuning)، خصوصية البيانات، تكلفة صفرية. أدوات مثل Ollama و vLLM تجعل التشغيل سهلاً." },
        { type: "code", language: "python", content: `# استخدام نموذج مفتوح المصدر مع HuggingFace
from transformers import pipeline

# Phi-3 — نموذج صغير لكنه قوي (من Microsoft)
generator = pipeline("text-generation", model="microsoft/phi-2", device_map="auto")
result = generator("Explain quantum computing in simple terms:", max_length=100)
print(result[0]['generated_text'])

print(f"\\n✓ نماذج مفتوحة موصى بها:")
print(f"  LLaMA 3 8B — أفضل عام (Meta)")
print(f"  Mistral 7B — كفاءة عالية")
print(f"  Gemma 2 9B — من Google")
print(f"  Phi-3 Mini — صغير جداً (3.8B) لكنه منافس")
print(f"\\n  Ollama: ollama run llama3 — تشغيل بنقرة واحدة!")` }
      ]
    },
    {
      id: "unit-ai-48", stageId: "stage-8", unitNumber: 48,
      title: "نماذج التفكير — Reasoning Models",
      description: "Chain of Thought, Tree of Thoughts, reasoning tokens — كيف يفكر النموذج.",
      difficulty: 5, estimatedHours: 5, tags: ["llm", "reasoning"],
      content: [
        { type: "h1", content: "الوحدة 48: نماذج التفكير" },
        { type: "p", content: "نماذج 2024-2025 ليست مجرد 'توقع الكلمة التالية' — إنها تفكر. Chain of Thought (CoT): النموذج يكتب خطوات تفكيره قبل الإجابة. Tree of Thoughts: يستكشف عدة مسارات تفكير. Reasoning Models (مثل o1, DeepSeek-R1): تولد 'reasoning tokens' داخلية غير مرئية للمستخدم — النموذج يفكر بصمت." },
        { type: "code", language: "python", content: `# Chain of Thought — جعل النموذج 'يفكر'
prompt_cot = \"\"\"
Solve this step by step:
A store has 120 apples. It sells 45 in the morning and 38 in the afternoon.
How many apples remain?

Think step by step before answering.
\"\"\"

# مع API حقيقي (OpenAI/Anthropic):
# response = client.chat.completions.create(
#     model="gpt-4",
#     messages=[{"role": "user", "content": prompt_cot}]
# )

print("نمط Chain of Thought:")
print("  1. نبدأ بـ 120 تفاحة")
print("  2. نطرح 45 المباعة صباحاً: 120 - 45 = 75")
print("  3. نطرح 38 المباعة مساءً: 75 - 38 = 37")
print("  4. الإجابة: 37 تفاحة متبقية")
print(f"\\n✓ CoT يحسن الدقة 20-50% في مسائل الرياضيات والمنطق!")
print(f"   Reasoning Models: النموذج يفكر بصمت قبل الإجابة")
print(f"   DeepSeek-R1, o1, o3 — جيل جديد من نماذج التفكير")` }
      ]
    }
  ]
};
