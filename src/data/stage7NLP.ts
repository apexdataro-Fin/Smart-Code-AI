import { StageDef } from './types';

export const stage7NLP: StageDef = {
  id: "stage-7",
  stageNumber: 7,
  title: "NLP & Embeddings — معالجة اللغة الطبيعية",
  description: "تحويل النص إلى فضاء رياضي — التضمين، الانتباه، والبحث الدلالي.",
  units: [
    {
      id: "unit-ai-38", stageId: "stage-7", unitNumber: 38,
      title: "تمثيل النص — من الكلمات للأرقام",
      description: "Tokenization، BoW، TF-IDF، n-grams — تحويل النص لأرقام.",
      difficulty: 3, estimatedHours: 3, tags: ["nlp", "tokenization"],
      content: [
        { type: "h1", content: "الوحدة 38: تمثيل النص" },
        { type: "p", content: "النموذج لا يفهم الكلمات — يفهم الأرقام فقط. الخطوة الأولى في أي NLP هي تحويل النص إلى متجهات رقمية. Tokenization يقسم النص إلى وحدات (كلمات أو أجزاء كلمات). TF-IDF يقيس أهمية كل كلمة في المستند. هذه التقنيات الكلاسيكية لا تزال أساسية في البحث والتصنيف." },
        { type: "code", language: "python", content: `from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer

# مستندات عربية
docs = [
    "الذكاء الاصطناعي يتطور بسرعة كبيرة في العالم",
    "تعلم الآلة هو فرع من الذكاء الاصطناعي",
    "التعلم العميق والتعلم الآلي تقنيات مهمة",
    "البرمجة بلغة بايثون مهمة لمهندسي الذكاء الاصطناعي"
]

# Bag of Words
bow = CountVectorizer()
X_bow = bow.fit_transform(docs)
print("Bag of Words:")
print(f"  المفردات: {bow.get_feature_names_out()}")
print(f"  الأبعاد: {X_bow.shape}")
print(f"\\n  مستند 1:\\n{X_bow[0].toarray()}")

# TF-IDF
tfidf = TfidfVectorizer()
X_tfidf = tfidf.fit_transform(docs)
print(f"\\nTF-IDF للمستند 1:")
words = tfidf.get_feature_names_out()
scores = X_tfidf[0].toarray()[0]
for word, score in sorted(zip(words, scores), key=lambda x: -x[1])[:5]:
    print(f"  {word}: {score:.3f}")

print(f"\\n✓ TF-IDF: الكلمات النادرة في المستند تحصل على وزن أعلى")` }
      ]
    },
    {
      id: "unit-ai-39", stageId: "stage-7", unitNumber: 39,
      title: "تضمين الكلمات — Word Embeddings",
      description: "Word2Vec، GloVe، FastText — المعنى كمتجه.",
      difficulty: 4, prerequisites: ["unit-ai-38"], estimatedHours: 4, tags: ["nlp", "embeddings"],
      content: [
        { type: "h1", content: "الوحدة 39: تضمين الكلمات" },
        { type: "p", content: "TF-IDF يمثل الكلمات كأرقام لكنه لا يفهم 'المعنى'. Word2Vec هو الثورة: كل كلمة تُمثل بمتجه كثيف (عادة 100-300 بعد)، والمسافة بين متجهين = المسافة الدلالية. 'ملك' و 'ملكة' قريبان، 'ملك' و 'تفاحة' بعيدان. المعادلة الشهيرة: king - man + woman ≈ queen." },
        { type: "code", language: "python", content: `import gensim.downloader as api
import numpy as np

# تحميل نموذج word2vec مُدرّب مسبقاً (~1.5GB)
print("تحميل word2vec... (قد يأخذ دقيقة)")
wv = api.load('word2vec-google-news-300')

# تشابه الكلمات
for word in ['king', 'queen', 'apple', 'computer']:
    similar = wv.most_similar(word, topn=3)
    print(f"كلمات مشابهة لـ '{word}':")
    for w, score in similar:
        print(f"    {w}: {score:.3f}")

# المعادلة الشهيرة
result = wv.most_similar(positive=['king', 'woman'], negative=['man'], topn=3)
print(f"\\n👑 king - man + woman = ?")
for word, score in result:
    print(f"    {word}: {score:.3f}")

# تشابه جملة
def sentence_similarity(s1, s2):
    v1 = np.mean([wv[w] for w in s1.split() if w in wv], axis=0)
    v2 = np.mean([wv[w] for w in s2.split() if w in wv], axis=0)
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

s1 = "the king rules the kingdom"
s2 = "the queen governs the realm"
print(f"\\nتشابه جمل: {sentence_similarity(s1, s2):.3f}")` }
      ]
    },
    {
      id: "unit-ai-40", stageId: "stage-7", unitNumber: 40,
      title: "تضمين الجمل والمستندات",
      description: "Sentence-BERT، Universal Sentence Encoder — معنى الجملة كمتجه.",
      difficulty: 4, prerequisites: ["unit-ai-39"], estimatedHours: 4, tags: ["nlp", "sentence-embeddings"],
      content: [
        { type: "h1", content: "الوحدة 40: تضمين الجمل" },
        { type: "p", content: "Word2Vec يعمل على مستوى الكلمة. لكننا نحتاج تضميناً للجمل والمستندات الكاملة. Sentence-BERT (من sentence-transformers) هو المعيار الذهبي: يحول أي نص (جملة، فقرة، مستند) إلى متجه واحد ثابت. هذا هو أساس البحث الدلالي، RAG، والتجميع." },
        { type: "code", language: "python", content: `from sentence_transformers import SentenceTransformer

# تحميل نموذج التضمين
model = SentenceTransformer('all-MiniLM-L6-v2')
print(f"تم تحميل النموذج — الأبعاد: {model.get_sentence_embedding_dimension()}")

# تضمين جمل
sentences = [
    "الذكاء الاصطناعي يغير العالم",
    "تقنيات AI تؤثر على كل الصناعات",
    "الطقس اليوم مشمس وجميل",
    "أحب أكل البيتزا الإيطالية",
]
embeddings = model.encode(sentences)
print(f"\\nالمتجهات: {embeddings.shape} — {len(sentences)} جمل × 384 بعد")

# حساب التشابه
from sklearn.metrics.pairwise import cosine_similarity
sim = cosine_similarity(embeddings)
print(f"\\nمصفوفة التشابه:")
for i, s1 in enumerate(sentences):
    for j, s2 in enumerate(sentences):
        if i < j:
            print(f"  تشابه({i},{j}): {sim[i,j]:.3f}  | {s1[:30]} ↔ {s2[:30]}")

print(f"\\n✓ الجملتان عن AI متشابهتان (0.7+)، المختلفتان بعيدتان (0.2-)")
print(f"  هذا أساس البحث الدلالي — ابحث بالمعنى وليس بالكلمات!")` }
      ]
    },
    {
      id: "unit-ai-41", stageId: "stage-7", unitNumber: 41,
      title: "الانتباه والتضمين السياقي",
      description: "Self-attention عميقاً، contextual vs static embeddings.",
      difficulty: 5, prerequisites: ["unit-ai-35"], estimatedHours: 4, tags: ["nlp", "attention"],
      content: [
        { type: "h1", content: "الوحدة 41: التضمين السياقي" },
        { type: "p", content: "المشكلة مع Word2Vec: كلمة 'بنك' لها تضمين واحد — لكن: 'بنك مالي' ≠ 'بنك النهر'. BERT حل هذه المشكلة: تضمين الكلمة يعتمد على سياقها في الجملة. نفس الكلمة في سياقين مختلفين = تضمينان مختلفان. هذا هو Contextual Embedding." },
        { type: "code", language: "python", content: `from transformers import AutoTokenizer, AutoModel
import torch

model_name = 'bert-base-uncased'
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)

# كلمة 'bank' في سياقين مختلفين
contexts = [
    "I went to the bank to deposit money",
    "I sat by the river bank to relax"
]
embeddings = []
for text in contexts:
    inputs = tokenizer(text, return_tensors='pt')
    with torch.no_grad():
        outputs = model(**inputs)
    # تضمين كلمة 'bank' (آخر طبقة)
    token_id = tokenizer.encode('bank')[1]  # مع BERT tokenizer
    bank_pos = (inputs['input_ids'] == token_id).nonzero()[0, 1]
    bank_embedding = outputs.last_hidden_state[0, bank_pos]
    embeddings.append(bank_embedding)
    print(f"{text}: موضع 'bank' = {bank_pos}")

sim = torch.cosine_similarity(embeddings[0], embeddings[1], dim=0)
print(f"\\nتشابه 'bank' في السياقين: {sim:.4f}")
print(f"✓ تضمينان مختلفان لنفس الكلمة — حسب السياق!")` }
      ]
    },
    {
      id: "unit-ai-42", stageId: "stage-7", unitNumber: 42,
      title: "البحث المتجهي والتشابه الدلالي",
      description: "Cosine similarity، FAISS، Approximate Nearest Neighbors.",
      difficulty: 4, prerequisites: ["unit-ai-40"], estimatedHours: 4, tags: ["nlp", "vector-search"],
      content: [
        { type: "h1", content: "الوحدة 42: البحث المتجهي" },
        { type: "p", content: "أسرع طريقة للبحث في ملايين المستندات: حولها لمتجهات مرة واحدة، ثم ابحث عن أقرب المتجهات لاستفسار المستخدم. FAISS (من Facebook/Meta) هي المكتبة المعيارية لهذا: تبحث في مليارات المتجهات في أجزاء من الثانية باستخدام Approximate Nearest Neighbors." },
        { type: "code", language: "python", content: `import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# إنشاء قاعدة بيانات متجهات بسيطة
docs = [
    "كيفية تدريب نموذج تعلم آلي باستخدام Python",
    "وصفة طبخ كعكة الشوكولاتة",
    "أفضل مكتبات deep learning: PyTorch vs TensorFlow",
    "طريقة عمل القهوة العربية الأصيلة",
    "شرح خوارزمية Gradient Descent في التعلم العميق",
    "نصائح لزراعة الورود في الحديقة المنزلية",
]

model = SentenceTransformer('all-MiniLM-L6-v2')
doc_embeddings = model.encode(docs).astype('float32')

# بناء فهرس FAISS
dim = doc_embeddings.shape[1]
index = faiss.IndexFlatIP(dim)  # Inner Product (cosine للتضمينات المُطبّعة)
faiss.normalize_L2(doc_embeddings)  # تطبيع للتشابه Cosine
index.add(doc_embeddings)

# بحث
query = "كيف أتعلم الذكاء الاصطناعي"
q_emb = model.encode([query]).astype('float32')
faiss.normalize_L2(q_emb)
D, I = index.search(q_emb, k=3)

print(f"استفسار: '{query}'")
print(f"\\nأفضل النتائج:")
for i, (doc_idx, score) in enumerate(zip(I[0], D[0])):
    print(f"  {i+1}. [{score:.3f}] {docs[doc_idx]}")

print(f"\\n✓ بحث دلالي: النتائج عن AI/تعلم رغم عدم تطابق الكلمات!")
print(f"  هذا هو RAG — قلب أنظمة ChatGPT مع المستندات.")` }
      ]
    }
  ]
};
