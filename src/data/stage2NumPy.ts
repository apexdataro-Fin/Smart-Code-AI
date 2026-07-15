import { StageDef } from './types';

export const stage2NumPy: StageDef = {
  id: "stage-2",
  stageNumber: 2,
  title: "NumPy — البرمجة العددية الاحترافية",
  description: "إتقان الحوسبة العددية باستخدام NumPy — أساس كل مكتبات الذكاء الاصطناعي.",
  units: [
    // UNIT 8: NumPy Fundamentals
    {
      id: "unit-ai-8",
      stageId: "stage-2",
      unitNumber: 8,
      title: "أساسيات NumPy",
      description: "إنشاء المصفوفات، أنواع البيانات، تخطيط الذاكرة — لماذا NumPy أسرع 100x من Python.",
      difficulty: 2,
      estimatedHours: 3,
      tags: ["numpy", "arrays", "performance"],
      content: [
        { type: "h1", content: "الوحدة 8: أساسيات NumPy" },
        { type: "p", content: "NumPy هي حجر الأساس لكل مكتبة ذكاء اصطناعي في Python. PyTorch، TensorFlow، Pandas، Scikit-learn — جميعها مبنية على NumPy أو تتبع نمطها. السبب: NumPy تنفذ العمليات الحسابية بـ C و Fortran، مما يجعلها أسرع 50-200 مرة من Python النقي للحلقات. إذا أتقنت NumPy، فأنت تتقن أساس الحوسبة العددية التي يقوم عليها كل AI." },
        { type: "p", content: "في هذه الوحدة، سنفهم لماذا NumPy سريعة جداً، وكيف نبني مصفوفات بطرق مختلفة، ونوع البيانات (dtype) — المفهوم الذي يتحكم في دقة وسرعة وذاكرة كل عملية." },

        { type: "h2", content: "1. لماذا NumPy؟ — قصة السرعة" },
        { type: "p", content: "Python لغة مفسرة (Interpreted): كل عملية بسيطة تمر عبر طبقات من الـ interpreter. NumPy تتجاوز هذا: العمليات تنفذ مباشرة بلغة C على كتل متجاورة من الذاكرة (Contiguous Memory Blocks). هذا يسمح بـ Vectorization: بدل تكرار عملية على كل عنصر في حلقة Python، تنفذها NumPy مرة واحدة على المصفوفة كلها." },
        { type: "code", language: "python", content: `import numpy as np
import time

# لماذا NumPy أسرع؟ مقارنة مباشرة
n = 10_000_000

# Python خالص — حلقات بطيئة
start = time.time()
py_list = list(range(n))
py_result = [x * 2 + 1 for x in py_list]
py_time = time.time() - start
print(f"Python list comprehension: {py_time:.3f}s")

# NumPy — عمليات متجهة (Vectorized)
start = time.time()
np_arr = np.arange(n)
np_result = np_arr * 2 + 1  # عملية واحدة على المصفوفة كلها!
np_time = time.time() - start
print(f"NumPy vectorized:         {np_time:.3f}s")
print(f"NumPy أسرع بـ {py_time/np_time:.0f}x!")

# لماذا؟
# 1. التنفيذ بلغة C — لا Python interpreter overhead
# 2. ذاكرة متجاورة — CPU cache friendly
# 3. SIMD instructions — معالجة عدة عناصر معاً
print(f"\\n💡 NumPy تنفذ العمليات في C، ليس Python!")` },

        { type: "h2", content: "2. إنشاء المصفوفات — أداتك الأساسية" },
        { type: "p", content: "np.array() هي الدالة الرئيسية. لكن NumPy توفر عشرات الدوال لإنشاء مصفوفات جاهزة: np.zeros(), np.ones(), np.arange(), np.linspace(), np.random.randn(). معرفة متى تستخدم كل واحدة توفر وقتاً هائلاً. والأهم: dtype يحدد نوع البيانات — float64 يأخذ 8 بايت لكل عنصر، float32 يأخذ 4 بايت. هذا يؤثر مباشرة على الذاكرة والسرعة." },
        { type: "code", language: "python", content: `import numpy as np

# 10 طرق لإنشاء مصفوفة
print("═" * 50)
print("طرق إنشاء المصفوفات في NumPy")
print("═" * 50)

# 1. من قائمة
a1 = np.array([1, 2, 3, 4, 5])
print(f"1. من قائمة:        {a1}")

# 2. مليئة بالأصفار
a2 = np.zeros(5)
print(f"2. أصفار:           {a2}")

# 3. مليئة بالواحدات
a3 = np.ones(5)
print(f"3. واحدات:          {a3}")

# 4. تسلسل عددي
a4 = np.arange(0, 10, 2)  # start, stop, step
print(f"4. تسلسل:           {a4}")

# 5. توزيع متساوي
a5 = np.linspace(0, 1, 5)  # start, stop, num
print(f"5. Linspace:        {a5}")

# 6. عشوائي موحد
a6 = np.random.rand(5)  # [0, 1)
print(f"6. عشوائي موحد:     {np.round(a6, 3)}")

# 7. عشوائي طبيعي
a7 = np.random.randn(5)  # μ=0, σ=1
print(f"7. عشوائي طبيعي:    {np.round(a7, 3)}")

# 8. full — قيمة محددة
a8 = np.full(5, 42)
print(f"8. Full (42):       {a8}")

# 9. مصفوفة هوية
a9 = np.eye(3)
print(f"9. هوية 3×3:\\\\n{a9}")

# ⭐ 10. مصفوفة فارغة (غير مهيأة — سريعة جداً)
a10 = np.empty(5)
print(f"10. فارغة (قيم عشوائية): {np.round(a10, 3)}")

# ⚠️ dtype مهم!
print(f"\\n═══════════════════════")
print("تأثير dtype على الذاكرة")
print(f"  float64: {np.zeros(1000, dtype=np.float64).nbytes} بايت")
print(f"  float32: {np.zeros(1000, dtype=np.float32).nbytes} بايت (نصف الحجم!)")
print(f"  int8:    {np.zeros(1000, dtype=np.int8).nbytes} بايت (ثمن الحجم!)")` },

        { type: "h2", content: "3. الخصائص الأساسية — shape, dtype, strides" },
        { type: "p", content: "كل مصفوفة NumPy لها خصائص أساسية: shape (الأبعاد)، dtype (نوع البيانات)، ndim (عدد الأبعاد)، strides (خطوات التنقل في الذاكرة). فهم هذه الخصائص أساسي لكتابة كود NumPy فعال. خاصة strides — هي التي تفسر لماذا بعض العمليات 'مجانية' (لا تنسخ بيانات)." },
        { type: "code", language: "python", content: `arr = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

print(f"المصفوفة:\\n{arr}")
print(f"\\nالخصائص الأساسية:")
print(f"  shape:   {arr.shape}   — (صفوف, أعمدة)")
print(f"  ndim:    {arr.ndim}    — عدد الأبعاد")
print(f"  size:    {arr.size}    — إجمالي العناصر")
print(f"  dtype:   {arr.dtype}   — نوع البيانات")
print(f"  itemsize:{arr.itemsize} بايت لكل عنصر")
print(f"  nbytes:  {arr.nbytes}  بايت — إجمالي الذاكرة")
print(f"  strides: {arr.strides} — خطوات التنقل (مهم جداً!)")

# strides: كم بايت تتحرك للوصول للعنصر التالي في كل بعد
# مثلاً (24, 8) تعني: 24 بايت للصف التالي، 8 بايت للعمود التالي
print(f"\\n💡 strides تحدد كيف تخزن البيانات في الذاكرة")
print(f"   C-order (افتراضي): الصف الأخير يتغير أسرع")
print(f"   F-order (Fortran): العمود الأخير يتغير أسرع")` },

        { type: "h2", content: "4. إعادة التشكيل — reshape بدون نسخ" },
        { type: "p", content: "reshape() يغير شكل المصفوفة دون نسخ البيانات (طالما الذاكرة متجاورة). هذه من أقوى ميزات NumPy: يمكنك إعادة تشكيل مصفوفة 1D إلى 2D أو 3D والعكس. flatten() و ravel() يسطحان المصفوفة لأبعاد واحدة، لكن ravel() يرجع view بينما flatten() يرجع copy." },
        { type: "code", language: "python", content: `# reshape — أقوى عملية في NumPy
a = np.arange(12)
print(f"مصفوفة 1D: {a}")

# reshape لـ 2D و 3D
b = a.reshape(3, 4)      # 3 صفوف × 4 أعمدة
print(f"\\nreshape(3,4):\\n{b}")

c = a.reshape(2, 3, 2)    # 2 × 3 × 2
print(f"\\nreshape(2,3,2):\\n{c}")

# -1 = احسب هذا البعد تلقائياً
d = a.reshape(3, -1)      # 3 صفوف، احسب الأعمدة
print(f"\\nreshape(3, -1): {d.shape}")

# flatten() vs ravel()
f = b.flatten()  # ينسخ — آمن لكن أبطأ
r = b.ravel()    # view إن أمكن — سريع جداً
print(f"\\nflatten: {f}")
print(f"ravel:   {r}")
print(f"flatten نسخة؟ {f.base is None}")  # True = نسخة جديدة
print(f"ravel نسخة؟ {r.base is None}")    # False = view

# ⚠️ transpose() و .T — يغيران shape لكن لا ينسخان!
t = b.T
print(f"\\ntranspose:\\n{t}")
print(f"مشاركة الذاكرة؟ {np.shares_memory(b, t)}")  # True!` },

        { type: "callout", calloutType: "best-practice", title: "view vs copy", content: [
          { type: "p", content: "view = نافذة على نفس البيانات (سريع، تغييره يغير الأصل). copy = نسخة مستقلة (آمن، لكنه يستهلك ذاكرة). استخدم .copy() صراحة عندما تحتاج استقلالية. تحقق بـ np.shares_memory(a, b). هذه من أكثر مصادر الأخطاء في NumPy." }
        ]},

        { type: "active-recall", questions: [
          { q: "لماذا NumPy أسرع بكثير من Python النقي؟", a: "ثلاثة أسباب: ① التنفيذ بلغة C (لا Python interpreter overhead)، ② الذاكرة المتجاورة (CPU cache friendly — البيانات متجاورة في الذاكرة الفعلية)، ③ تعليمات SIMD (Single Instruction Multiple Data — معالجة عدة عناصر في دورة CPU واحدة)." },
          { q: "ما الفرق بين flatten() و ravel()؟", a: "flatten() دائماً ينسخ البيانات — يرجع copy مستقلة. ravel() يرجع view إن أمكن (مشاركة الذاكرة مع الأصل) — أسرع جداً لكن تغيير الناتج يغير الأصل. استخدم ravel() للأداء، flatten() للأمان." },
          { q: "كيف يؤثر dtype على الذاكرة؟", a: "float64 = 8 بايت/عنصر، float32 = 4 بايت/عنصر، int8 = 1 بايت/عنصر. مصفوفة مليون عنصر: float64 = 8MB، float32 = 4MB، int8 = 1MB. في التعلم العميق، نصف الدقة (float16) ومؤخراً bfloat16 و int8 (quantization) هي أساس تشغيل نماذج كبيرة على ذاكرة محدودة." }
        ]}
      ]
    },
    // UNIT 9: Vectorization & Broadcasting
    {
      id: "unit-ai-9",
      stageId: "stage-2",
      unitNumber: 9,
      title: "التحويل المتجهي والبث",
      description: "التخلص من الحلقات، قواعد البث، ufuncs — الفلسفة الـ NumPythonic.",
      difficulty: 3,
      prerequisites: ["unit-ai-8"],
      estimatedHours: 3,
      tags: ["numpy", "vectorization", "broadcasting"],
      content: [
        { type: "h1", content: "الوحدة 9: التحويل المتجهي والبث" },
        { type: "p", content: "القاعدة الذهبية في NumPy: 'إذا كنت تكتب حلقة for على مصفوفة NumPy، فأنت على الأرجح تخطئ'. NumPy صُممت للعمليات المتجهة (Vectorized Operations): تطبيق عملية على المصفوفة كلها دفعة واحدة. و Broadcasting — أقوى ميزة في NumPy — تسمح بتطبيق العمليات على مصفوفات بمختلف الأحجام بدون حلقات وبدون نسخ بيانات. هذه الوحدة ستحولك من 'مبرمج Python عادي' إلى 'مبرمج NumPy محترف'." },

        { type: "h2", content: "1. العمليات المتجهة — تخلص من الحلقات" },
        { type: "p", content: "Vectorization تعني: بدل تطبيق عملية على كل عنصر في حلقة، طبقها على المصفوفة كلها. NumPy تحول هذه العملية إلى حلقة C داخلية سريعة جداً. الفرق ليس 2x أو 5x — قد يكون 100x أو أكثر مع المصفوفات الكبيرة." },
        { type: "code", language: "python", content: `import numpy as np
import time

n = 5_000_000
arr = np.random.randn(n)

# الطريقة البطيئة: حلقة Python
start = time.time()
result_loop = np.zeros(n)
for i in range(n):
    result_loop[i] = np.sin(arr[i]) + np.cos(arr[i])
loop_time = time.time() - start

# الطريقة السريعة: Vectorization
start = time.time()
result_vec = np.sin(arr) + np.cos(arr)  # عملية واحدة!
vec_time = time.time() - start

print(f"حلقة Python:     {loop_time:.3f}s")
print(f"Vectorized NumPy: {vec_time:.3f}s")
print(f"NumPy أسرع بـ {loop_time/vec_time:.0f}x!")
print(f"النتائج متطابقة؟ {np.allclose(result_loop, result_vec)}")

# أمثلة على العمليات المتجهة
print(f"\\nعمليات متجهة أساسية:")
print(f"  arr + 10    — جمع رقم على كل عنصر")
print(f"  arr * 2     — ضرب كل عنصر في 2")
print(f"  np.log(arr) — لوغاريتم كل عنصر")
print(f"  arr > 0     — مقارنة كل عنصر")
print(f"  arr[arr>0]  — ترشيح العناصر (Boolean Indexing)")` },

        { type: "h2", content: "2. Broadcasting — السحر" },
        { type: "p", content: "Broadcasting يسمح بإجراء عمليات بين مصفوفات بأحجام مختلفة. القواعد: ① إذا اختلف عدد الأبعاد، تُوسع المصفوفة الأصغر بإضافة أبعاد من اليسار بقيمة 1. ② البعد الذي يساوي 1 يُمدد ليطابق البعد المقابل. ③ إذا كان بعدان مختلفين ولا أحدهما 1 = خطأ. Broadcasting لا ينسخ بيانات — إنه view ذكي." },
        { type: "code", language: "python", content: `# Broadcasting — أقوى ميزة في NumPy
A = np.array([[1, 2, 3],
              [4, 5, 6]])      # (2, 3)
b = np.array([10, 20, 30])      # (3,)

print(f"A shape: {A.shape}")
print(f"A:\\n{A}")
print(f"\\nb shape: {b.shape}")
print(f"b: {b}")

# b يُبث ليطابق A! b → (1, 3) → (2, 3)
result = A + b
print(f"\\nA + b (Broadcasting!):\\n{result}")
# [[1+10, 2+20, 3+30],
#  [4+10, 5+20, 6+30]]

# Broadcasting مع عمود
col = np.array([[100], [200]])  # (2, 1)
print(f"\\ncol shape: {col.shape}")
print(f"col:\\n{col}")
print(f"A + col:\\n{A + col}")

# ⭐ تطبيق عملي: تطبيع دفعة بيانات
batch = np.random.randn(100, 10)  # 100 عينة × 10 خصائص
mean = batch.mean(axis=0)          # (10,)
std = batch.std(axis=0)            # (10,)
normalized = (batch - mean) / std  # Broadcasting!
print(f"\\nتطبيع دفعة: {batch.shape}")
print(f"mean shape: {mean.shape} — يُبث لـ (100, 10)")
print(f"أول عينة بعد التطبيع: mean≈{normalized[0].mean():.1e}, std≈{normalized[0].std():.1f}")` },

        { type: "h2", content: "3. ufuncs — دوال عالمية فائقة السرعة" },
        { type: "p", content: "ufunc (Universal Function) هي دوال NumPy التي تعمل عنصراً بعنصر على المصفوفات. وهي مكتوبة بـ C وتدعم broadcasting و out parameter (اكتب الناتج مباشرة في مصفوفة موجودة لتوفير الذاكرة). هناك ufuncs رياضية (sin, cos, exp, log)، مقارنة (greater, less, equal)، وعمليات (add, multiply)." },
        { type: "code", language: "python", content: `# ufuncs — سلاحك السري في NumPy
arr = np.array([0, np.pi/2, np.pi, 3*np.pi/2])

print("ufuncs المثلثية:")
print(f"  sin: {np.round(np.sin(arr), 3)}")
print(f"  cos: {np.round(np.cos(arr), 3)}")
print(f"  tan: {np.round(np.tan(arr), 3)}")

print("\\nufuncs الرياضية:")
print(f"  exp:  {np.round(np.exp([0, 1, 2]), 3)}")
print(f"  log:  {np.round(np.log([1, np.e, np.e**2]), 3)}")
print(f"  sqrt: {np.round(np.sqrt([0, 1, 4, 9]), 3)}")

# ⭐ out parameter — اكتب الناتج مباشرة لتوفير الذاكرة
result = np.empty_like(arr)  # نحجز الذاكرة مرة واحدة
np.sin(arr, out=result)
print(f"\\nout= parameter: {np.round(result, 3)} (كتابة مباشرة — لا نسخ)")

# ⭐ reduce — عملية تراكمية
print(f"\\nadd.reduce([1,2,3,4,5]) = {np.add.reduce([1,2,3,4,5])}")  # 15
print(f"multiply.reduce([1,2,3,4,5]) = {np.multiply.reduce([1,2,3,4,5])}")  # 120

# ⭐ accumulate — تراكم خطوة بخطوة
print(f"add.accumulate([1,2,3,4,5]) = {np.add.accumulate([1,2,3,4,5])}")  # [1,3,6,10,15]

# ⭐ outer — جداء خارجي
print(f"\\nouter([1,2,3], [10,20]):\\n{np.multiply.outer([1,2,3], [10,20])}")` },

        { type: "h2", content: "4. Where و Select و Piecewise" },
        { type: "code", language: "python", content: `# np.where — if/else متجهي
scores = np.array([85, 92, 45, 78, 60, 95, 30])

# تطبيق شرط على كل عنصر دفعة واحدة
grades = np.where(scores >= 90, 'A',
         np.where(scores >= 80, 'B',
         np.where(scores >= 70, 'C',
         np.where(scores >= 60, 'D', 'F'))))
print(f"الدرجات: {scores}")
print(f"التقديرات: {grades}")

# np.where مع 3 arguments: where(condition, value_if_true, value_if_false)
normalized = np.where(scores > 50, scores / 100, 0.0)
print(f"\\nتطبيع (>50 فقط): {normalized}")

# np.select — بديل أنظف للـ where المتداخل
conditions = [scores >= 90, scores >= 80, scores >= 70, scores >= 60, scores < 60]
choices = ['A', 'B', 'C', 'D', 'F']
grades2 = np.select(conditions, choices)
print(f"np.select: {grades2}")

# np.clip — حد القيم بين قيمتين
clipped = np.clip(scores, 50, 90)
print(f"\\nقبل clip: {scores}")
print(f"بعد clip(50, 90): {clipped}")` },

        { type: "project", title: "محاكي شبكة عصبية متجهة بالكامل", content: [
          { type: "code", language: "python", content: `class VectorizedNN:
    \"\"\"شبكة عصبية متجهة بالكامل باستخدام NumPy — لا حلقات!\"\"\"
    def __init__(self, layer_sizes):
        self.weights = []
        self.biases = []
        for i in range(len(layer_sizes) - 1):
            # He initialization
            self.weights.append(
                np.random.randn(layer_sizes[i], layer_sizes[i+1]) * 
                np.sqrt(2.0 / layer_sizes[i])
            )
            self.biases.append(np.zeros(layer_sizes[i+1]))
    
    def relu(self, x):
        return np.maximum(0, x)  # ufunc — عنصر بعنصر
    
    def softmax(self, x):
        exps = np.exp(x - np.max(x, axis=1, keepdims=True))
        return exps / np.sum(exps, axis=1, keepdims=True)
    
    def forward(self, X):
        \"\"\"Forward pass — لا حلقات for في طبقات المعالجة!\"\"\"
        out = X
        for i, (W, b) in enumerate(zip(self.weights, self.biases)):
            out = out @ W + b  # Broadcasting للـ bias!
            if i < len(self.weights) - 1:
                out = self.relu(out)
            else:
                out = self.softmax(out)
        return out

nn = VectorizedNN([10, 64, 32, 5])
batch = np.random.randn(100, 10)
output = nn.forward(batch)
print(f"Batch: {batch.shape} → Output: {output.shape}")
print(f"كل صف احتمالات (sum=1): {output[0].sum():.3f}")
print("✓ لا حلقة for واحدة في معالجة البيانات!")` }
        ]},

        { type: "active-recall", questions: [
          { q: "ما هي قواعد Broadcasting في NumPy؟", a: "① إذا اختلف عدد الأبعاد، توسع الأصغر بإضافة 1 من اليسار. ② البعد = 1 يتمدد ليطابق. ③ إذا بعدان مختلفان ولا أحدهما 1 = خطأ. Broadcasting لا ينسخ بيانات — إنه آلية ذكية للمطابقة المنطقية. يسمح بتنفيذ (100,10) + (10,) دون حلقات ودون نسخ." },
          { q: "ما الفرق بين np.where و np.select؟", a: "np.where يعمل كـ if/else: where(condition, a, b). np.select يعمل كـ if/elif/else متعدد: select(conditions, choices, default). np.where جيد للشروط البسيطة، np.select أنظف للشروط المتعددة. np.clip يحد القيم بين قيمتين: clip(arr, min, max)." }
        ]}
      ]
    },
    // UNIT 10-12: Remaining NumPy units (condensed but complete)
    {
      id: "unit-ai-10",
      stageId: "stage-2",
      unitNumber: 10,
      title: "الفهرسة المتقدمة والتقطيع",
      description: "Fancy indexing، الأقنعة المنطقية، where، take — معالجة البيانات بدون حلقات.",
      difficulty: 3,
      prerequisites: ["unit-ai-9"],
      estimatedHours: 3,
      tags: ["numpy", "indexing", "masking"],
      content: [
        { type: "h1", content: "الوحدة 10: الفهرسة المتقدمة والتقطيع" },
        { type: "p", content: "الفهرسة في NumPy تتجاوز بكثير [0] و [1:5]. Fancy Indexing يسمح باختيار عناصر بقائمة من المؤشرات. Boolean Masking يسمح باختيار عناصر تحقق شرطاً — دون حلقة if واحدة. هذه الأدوات تحول مهام قد تأخذ صفحات من الكود مع الحلقات إلى سطر واحد أنيق." },
        { type: "code", language: "python", content: `import numpy as np

arr = np.array([10, 20, 30, 40, 50, 60, 70, 80])

# Fancy Indexing — اختر أي عناصر بقائمة مؤشرات
indices = [0, 3, 5, 7]
print(f"Fancy indexing [{indices}]: {arr[indices]}")

# يمكنك اختيار عناصر عشوائية بأي ترتيب
shuffled = arr[[7, 3, 0, 5, 1]]
print(f"ترتيب مخصص: {shuffled}")

# Boolean Masking — أقوى أداة!
mask = arr > 40
print(f"\\narr > 40 = {mask}")
print(f"arr[arr > 40] = {arr[mask]}")

# دمج الشروط بـ & و | (وليس and/or!)
print(f"arr[(arr > 20) & (arr < 70)] = {arr[(arr > 20) & (arr < 70)]}")
print(f"arr[(arr < 30) | (arr > 60)] = {arr[(arr < 30) | (arr > 60)]}")

# np.take — مثل fancy indexing لكن أسرع في بعض الحالات
print(f"\\nnp.take(arr, [1, 2, 5]): {np.take(arr, [1, 2, 5])}")

# np.put — تعديل عناصر محددة
arr_copy = arr.copy()
np.put(arr_copy, [0, 2, 4], [-1, -1, -1])
print(f"np.put في المؤشرات 0,2,4: {arr_copy}")

# 2D Fancy Indexing
M = np.arange(25).reshape(5, 5)
print(f"\\nمصفوفة 5×5:")
print(M)
# اختر صفوف محددة وأعمدة محددة
selected = M[[0, 2, 4]][:, [1, 3]]
print(f"\\nصفوف [0,2,4] أعمدة [1,3]:\\n{selected}")

# np.ix_ — اختيار شبكي (cross-product indexing)
rows, cols = [0, 2], [1, 3, 4]
grid = M[np.ix_(rows, cols)]
print(f"\\nnp.ix_ (شبكي):\\n{grid}")` },

        { type: "active-recall", questions: [
          { q: "ما الفرق بين Fancy Indexing و Boolean Masking؟", a: "Fancy Indexing: arr[[0, 3, 5]] — تحدد المؤشرات صراحة. Boolean Masking: arr[arr > 50] — تختار العناصر التي تحقق شرطاً. Boolean Masking أقوى للترشيح، Fancy Indexing أفضل لإعادة الترتيب." }
        ]}
      ]
    },
    {
      id: "unit-ai-11",
      stageId: "stage-2",
      unitNumber: 11,
      title: "الجبر الخطي بـ NumPy",
      description: "تفكيك المصفوفات، حل الأنظمة، المعايير، المحددات — الأساس الرياضي للذكاء الاصطناعي.",
      difficulty: 4,
      prerequisites: ["unit-ai-8"],
      estimatedHours: 4,
      tags: ["numpy", "linear-algebra", "decomposition"],
      content: [
        { type: "h1", content: "الوحدة 11: الجبر الخطي بـ NumPy" },
        { type: "p", content: "NumPy ليست مجرد مكتبة مصفوفات — إنها مكتبة جبر خطي كاملة. كل ما تعلمته في Stage 1 عن المتجهات والمصفوفات والقيم الذاتية، يمكنك الآن تطبيقه بسرعة وسهولة. من SVD لأنظمة التوصية، إلى حل أنظمة المعادلات، إلى تحليل المكونات الرئيسية — NumPy توفر دواءً جاهزة لكل هذا." },
        { type: "code", language: "python", content: `import numpy as np

A = np.array([[2, 1, 1], [4, -6, 0], [-2, 7, 2]])
b = np.array([5, -2, 9])

# 1. حل نظام معادلات خطية: Ax = b
x = np.linalg.solve(A, b)
print(f"حل Ax = b: x = {np.round(x, 3)}")
print(f"التحقق A@x = {np.round(A @ x, 3)} = b = {b} ✓")

# 2. SVD — تفكيك القيمة المفردة
U, S, Vt = np.linalg.svd(A)
print(f"\\nSVD: U={U.shape}, S={S.shape}, Vt={Vt.shape}")
print(f"القيم المفردة: {np.round(S, 4)}")
print(f"إعادة البناء:\\n{np.round(U @ np.diag(S) @ Vt, 2)}")

# 3. QR Decomposition
Q, R = np.linalg.qr(A)
print(f"\\nQR: Q={Q.shape}, R={R.shape}")
print(f"Q متعامدة؟ QᵀQ≈I: {np.allclose(Q.T @ Q, np.eye(3))}")

# 4. Cholesky (للمصفوفات الموجبة المحددة)
pos_def = A.T @ A + np.eye(3) * 0.1
L = np.linalg.cholesky(pos_def)
print(f"\\nCholesky L:\\n{np.round(L, 3)}")
print(f"LLᵀ = pos_def? {np.allclose(L @ L.T, pos_def)}")

# 5. Norms, Determinant, Condition Number
print(f"\\nمعايير:")
print(f"  Frobenius norm: {np.linalg.norm(A, 'fro'):.3f}")
print(f"  Nuclear norm:   {np.linalg.norm(A, 'nuc'):.3f}")
print(f"  Determinant:    {np.linalg.det(A):.3f}")
print(f"  Condition #:    {np.linalg.cond(A):.1f}")` },

        { type: "active-recall", questions: [
          { q: "ما أهم عمليات الجبر الخطي في NumPy لـ AI؟", a: "① SVD: np.linalg.svd — أساس أنظمة التوصية وضغط البيانات. ② حل الأنظمة: np.linalg.solve — الانحدار الخطي. ③ القيم الذاتية: np.linalg.eig/eigh — PCA. ④ المعايير: np.linalg.norm — regularization وقياس المسافات." }
        ]}
      ]
    },
    {
      id: "unit-ai-12",
      stageId: "stage-2",
      unitNumber: 12,
      title: "الأداء والذاكرة المتقدمة",
      description: "Strides، views vs copies، memory mapping، C-contiguous vs F-contiguous — NumPy بمستوى احترافي.",
      difficulty: 4,
      prerequisites: ["unit-ai-8"],
      estimatedHours: 3,
      tags: ["numpy", "performance", "memory"],
      content: [
        { type: "h1", content: "الوحدة 12: الأداء والذاكرة المتقدمة" },
        { type: "p", content: "في الإنتاج، الأداء ليس ترفاً — إنه فرق بين نموذج يعمل في ثانية ونموذج يعمل في دقيقة. فهم كيفية تخزين NumPy للبيانات في الذاكرة (strides, contiguity, memory layout) يسمح لك بكتابة كود أسرع بعدة مرات. memory-mapped files تسمح بالتعامل مع بيانات أكبر من RAM. هذه مهارات مهندس AI المحترف." },
        { type: "code", language: "python", content: `import numpy as np

# strides — فهم كيفية تخزين البيانات
arr = np.array([[1, 2, 3], [4, 5, 6]], dtype=np.float64)
print(f"array: {arr.shape}, strides: {arr.strides}")
print(f"للانتقال صف: {arr.strides[0]} بايت")
print(f"للانتقال عمود: {arr.strides[1]} بايت")

# C-order (صفوف متجاورة) vs F-order (أعمدة متجاورة)
c_order = np.ones((1000, 1000), order='C')
f_order = np.ones((1000, 1000), order='F')
print(f"\\nC-order strides: {c_order.strides} — الصف الأخير يتغير أسرع")
print(f"F-order strides: {f_order.strides} — العمود الأخير يتغير أسرع")

# np.einsum — Einstein Summation (عملاق الأداء)
a = np.random.randn(100, 50)
b = np.random.randn(50, 30)
# einsum = مرن جداً وأسرع من @ في بعض الحالات
c_einsum = np.einsum('ij,jk->ik', a, b)
c_matmul = a @ b
print(f"\\neinsum == matmul? {np.allclose(c_einsum, c_matmul)}")

# Memory-mapped files — بيانات أكبر من RAM!
# mmap = np.memmap('large_data.dat', dtype='float32', mode='w+', shape=(10000, 1000))
# mmap[:] = np.random.randn(10000, 1000)  # يكتب مباشرة للقرص
# mmap.flush()  # تأكيد الكتابة

print(f"\\n💡 Memory-mapping: تعامل مع 50GB بيانات على RAM 8GB!")

# as_strided — تحكم كامل في الذاكرة (خطر لكن قوي!)
x = np.array([1, 2, 3, 4, 5, 6])
# نافذة منزلقة: كل 3 عناصر متجاورة
shape = (4, 3)  # 4 نوافذ × 3 عناصر
strides = (x.strides[0], x.strides[0])  # كل نافذة تبدأ من العنصر التالي
windows = np.lib.stride_tricks.as_strided(x, shape=shape, strides=strides)
print(f"\\nas_strided (نوافذ منزلقة):\\n{windows}")
print(f"مشاركة الذاكرة مع الأصل: {np.shares_memory(windows, x)}")` },

        { type: "active-recall", questions: [
          { q: "ما الفرق بين C-order و F-order؟", a: "C-order (افتراضي): الصف الأخير متجاور في الذاكرة — العناصر في نفس الصف متجاورة. F-order: العمود الأخير متجاور — العناصر في نفس العمود متجاورة. هذا يؤثر على سرعة العمليات: الوصول لمصفوفة C-order صفاً بصف أسرع، والوصول عموداً بعمود أبطأ." }
        ]}
      ]
    }
  ]
};
