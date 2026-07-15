import { StageDef } from './types';

export const stage1Mathematics: StageDef = {
  id: "stage-1",
  stageNumber: 1,
  title: "Mathematics for AI — الرياضيات للذكاء الاصطناعي",
  description: "الحدس الرياضي قبل الدقة — فهم الأساسيات الرياضية بصرياً وتطبيقياً لتكون مستعداً لبناء نماذج الذكاء الاصطناعي.",
  units: [
    // ═══════════════════════════════════════════════════════════
    // UNIT 1: Functions & Algebra Intuition
    // ═══════════════════════════════════════════════════════════
    {
      id: "unit-ai-1",
      stageId: "stage-1",
      unitNumber: 1,
      title: "الحدس الجبري والوظائفي",
      description: "Functions، المجال والمدى، التركيب، الدوال العكسية — لماذا الرياضيات لغة الذكاء الاصطناعي.",
      difficulty: 2,
      estimatedHours: 3,
      tags: ["algebra", "functions", "foundations"],
      content: [
        { type: "h1", content: "الوحدة 1: الحدس الجبري والوظائفي" },
        { type: "p", content: "قبل أن تبني أي نموذج ذكاء اصطناعي — سواء كان انحداراً خطياً بسيطاً أو محولاً (Transformer) بمليارات المعاملات — هناك حقيقة واحدة: كل نموذج هو دالة رياضية. الشبكة العصبية هي دالة مركبة من طبقات. دالة الخسارة هي دالة تقيس الخطأ. التدريب هو بحث عن أفضل معاملات لدالة. إذا فهمت الدوال بعمق، فأنت تفهم جوهر الذكاء الاصطناعي." },
        { type: "p", content: "هذه الوحدة ليست درس رياضيات تقليدي. لن نثبت نظريات ولن نحفظ قواعد مجردة. سنبني حدساً بصرياً وعملياً: ماذا تعني الدالة؟ كيف نمثلها؟ كيف نركبها؟ وكيف تترجم كل هذه المفاهيم مباشرة إلى كود Python يشغّل نماذج حقيقية؟" },

        { type: "h2", content: "1. ما هي الدالة؟ — صندوق التحويل السحري" },
        { type: "p", content: "الدالة (Function) في أبسط صورها: صندوق تأخذ منه مدخلاً (x)، يُجري عليه عملية محددة، ويُخرج ناتجاً (y). رياضياً نكتب f(x) = y. في الذكاء الاصطناعي، المدخل قد يكون صورة (مصفوفة أرقام)، والمعالجة قد تكون 100 طبقة عصبية، والمخرج قد يكون تصنيفاً ('قطة' أو 'كلب'). الجوهر واحد: تحويل من فضاء لآخر." },
        { type: "mermaid", content: "graph LR\n  A[\"مدخل x\"] --> B[\"f: التحويل\"]\n  B --> C[\"مخرج y = f(x)\"]\n  style A fill:#e1f5fe\n  style B fill:#fff3e0\n  style C fill:#e8f5e9", caption: "النموذج الذهني للدالة" },
        { type: "p", content: "في بايثون، الدوال هي أداتك الأساسية لبناء أي شيء. الدالة تأخذ مدخلات (parameters)، تعالجها، وترجع ناتجاً. هذا هو نفس نمط أي نموذج تعلم آلي — الفرق فقط في التعقيد." },
        { type: "code", language: "python", title: "الدالة في Python: أبسط نموذج ذكاء اصطناعي", content: `def predict_price(area: float) -> float:
    \"\"\"نموذج تسعير عقاري بسيط: دالة خطية\"\"\"
    price_per_sqm = 5000  # معامل (وزن) — يتعلمه النموذج
    return area * price_per_sqm

# هذه دالة! مدخل → معالجة → مخرج
print(predict_price(120))  # 600000
print(predict_price(85))   # 425000

# نموذج أكثر تعقيداً: دالة متعددة المدخلات
def predict_health_risk(age: float, bmi: float, smoker: bool) -> float:
    \"\"\"دالة خطر صحي — قريبة جداً من الانحدار اللوجستي\"\"\"
    risk = 0.03 * age + 0.5 * bmi + (15.0 if smoker else 0.0)
    return risk

print(predict_health_risk(45, 28.5, True))   # 31.6
print(predict_health_risk(30, 22.0, False))  # 11.9` },

        { type: "callout", calloutType: "note", title: "الذكاء الاصطناعي = دوال", content: [
          { type: "p", content: "كل نموذج AI هو دالة. YOLO لاكتشاف الكائنات: f(صورة) = [إحداثيات، تصنيف]. ChatGPT: f(نص_مدخل) = توزيع_احتمالي_على_كل_كلمة_تالية. Stable Diffusion: f(نص، ضوضاء) = صورة. إذا أتقنت التفكير بالدوال، فأنت تفهم skeleton كل نموذج AI." }
        ]},

        { type: "h2", content: "2. المجال والمدى — حدود الدالة" },
        { type: "p", content: "المجال (Domain): مجموعة كل المدخلات الممكنة للدالة. المدى (Range): مجموعة كل المخرجات الممكنة. فهم المجال والمدى ليس ترفاً رياضياً — إنه ما يحدد: هل المدخل صالح؟ هل المخرج منطقي؟ في الإنتاج، تجاهل المجال والمدى يسبب أعطالاً كارثية." },
        { type: "code", language: "python", content: `import math

def safe_sqrt(x: float) -> float | None:
    \"\"\"دالة الجذر التربيعي مع فحص المجال\"\"\"
    if x < 0:  # خارج المجال
        print(f"خطأ: {x} سالب — الجذر التربيعي غير معرف للأعداد السالبة")
        return None
    return math.sqrt(x)

# المجال: x ≥ 0
# المدى: y ≥ 0
print(safe_sqrt(25))   # 5.0  ✓
print(safe_sqrt(0))    # 0.0  ✓
print(safe_sqrt(-9))   # None ✗ (خارج المجال)

# مثال AI: دالة softmax — تحول أي أرقام لاحتمالات
def softmax(logits: list[float]) -> list[float]:
    \"\"\"المجال: أي أرقام حقيقية | المدى: احتمالات مجموعها 1\"\"\"
    exp_values = [math.exp(x) for x in logits]
    total = sum(exp_values)
    return [v / total for v in exp_values]

# لاحظ: المدخلات أي أرقام (حتى سالبة)، المخرجات دائماً بين 0 و 1 ومجموعها 1
probs = softmax([2.0, 1.0, 0.1])
print([f"{p:.3f}" for p in probs])  # ['0.659', '0.242', '0.099']
print(f"المجموع: {sum(probs):.3f}")  # 1.000` },

        { type: "h2", content: "3. الدوال المركبة — لماذا الشبكات العصبية عميقة؟" },
        { type: "p", content: "الدالة المركبة (Function Composition) هي جوهر الشبكات العصبية العميقة. حين تركب دوال — تضع مخرجات دالة كمدخلات لدالة أخرى — فأنت تبني تمثيلات متدرجة التعقيد. f(g(x)) تعني: طبق g أولاً، ثم طبق f على الناتج. هذا ما تفعله كل طبقة في الشبكة العصبية تماماً." },
        { type: "mermaid", content: "graph LR\n  X[\"مدخل x\"] --> G[\"g(x): الطبقة الأولى\"]\n  G --> F[\"f(g(x)): الطبقة الثانية\"]\n  F --> H[\"h(f(g(x))): الطبقة الثالثة\"]\n  H --> Y[\"المخرج النهائي\"]\n  style X fill:#e1f5fe\n  style G fill:#fff9c4\n  style F fill:#fff9c4\n  style H fill:#fff9c4\n  style Y fill:#e8f5e9", caption: "الشبكة العصبية = دوال مركبة" },
        { type: "code", language: "python", content: `# الدوال المركبة — أساس كل شبكة عصبية
def linear(x, w, b):
    \"\"\"تحويل خطي: y = wx + b\"\"\"
    return w * x + b

def relu(x):
    \"\"\"دالة تنشيط ReLU: تمنع القيم السالبة\"\"\"
    return max(0, x)

def sigmoid(x):
    \"\"\"دالة تنشيط Sigmoid: تحول أي رقم لاحتمال بين 0 و 1\"\"\"
    return 1 / (1 + math.exp(-x))

# شبكة عصبية من 3 طبقات — مجرد دوال مركبة!
def simple_neural_network(x):
    \"\"\"f(g(h(x))) — ثلاث دوال مركبة\"\"\"
    # الطبقة 1: تحويل خطي + ReLU
    h1 = relu(linear(x, w=2.0, b=-1.0))
    # الطبقة 2: تحويل خطي + ReLU
    h2 = relu(linear(h1, w=1.5, b=0.5))
    # الطبقة 3: تحويل خطي + Sigmoid (للتصنيف الثنائي)
    output = sigmoid(linear(h2, w=3.0, b=-2.0))
    return output

# اختبار الشبكة
for test_x in [-2, 0, 1, 3]:
    prob = simple_neural_network(test_x)
    pred = "موجب" if prob > 0.5 else "سالب"
    print(f"x={test_x:2d} → احتمال={prob:.4f} → تصنيف: {pred}")` },

        { type: "callout", calloutType: "ai-tip", title: "افهم الدوال المركبة = افهم أي نموذج AI", content: [
          { type: "p", content: "جرب هذا الـ Prompt: «أنا أتعلم الشبكات العصبية. اشرح لي لماذا الشبكة العصبية هي مجرد دالة مركبة f(g(h(x)))، وارسم لي مكوناتها (Linear → Activation → Linear → Activation → Output). استخدم تشبيهاً من الحياة اليومية يوضح لماذا التركيب (composition) يعطي قوة تمثيلية أكبر من دالة واحدة.»" }
        ]},

        { type: "h2", content: "4. الدالة العكسية — لماذا نستخدم backpropagation" },
        { type: "p", content: "إذا كانت الدالة f تحول x إلى y، فإن الدالة العكسية f⁻¹ تحول y إلى x. في التعلم العميق، لا نبحث عن الدالة العكسية بالضبط، بل عن المشتقة (التي سنتعلمها في الوحدة 7). لكن الفكرة واحدة: ‘إذا أردت y معيناً، ما x الذي يعطيني إياه؟'. هذا هو جوهر التدريب: ‘ما المعاملات التي تقلل الخطأ؟'" },
        { type: "code", language: "python", content: `# الدالة العكسية — المفهوم قبل الرياضيات
def encrypt_message(text: str, shift: int) -> str:
    \"\"\"تشفير قيصري بسيط: f(text, shift) = encrypted\"\"\"
    result = ""
    for char in text:
        if char.isalpha():
            base = ord('A') if char.isupper() else ord('a')
            result += chr((ord(char) - base + shift) % 26 + base)
        else:
            result += char
    return result

def decrypt_message(text: str, shift: int) -> str:
    \"\"\"فك التشفير: f⁻¹(encrypted, shift) = original\"\"\"
    return encrypt_message(text, -shift)  # الدالة العكسية!

original = "Hello AI Engineer"
encrypted = encrypt_message(original, 7)
decrypted = decrypt_message(encrypted, 7)

print(f"الأصلي:    {original}")
print(f"المشفر:    {encrypted}")
print(f"بعد الفك:  {decrypted}")
print(f"متطابقان؟  {original == decrypted}")

# في AI: الدالة العكسية = إيجاد المدخلات المناسبة
# Backpropagation = حساب كيف تغير المدخلات لتقليل الخطأ
# هذا هو التدريب كله!` },

        { type: "h2", content: "5. الدوال كثيرة الحدود — من الخط المستقيم للمنحنيات" },
        { type: "p", content: "الدالة الخطية y = mx + b هي أبسط أشكال الذكاء الاصطناعي (الانحدار الخطي). لكن العالم غير خطي! الدوال متعددة الحدود (Polynomials) تمنحك القدرة على نمذجة العلاقات المنحنية. الشبكات العصبية تتفوق لأنها تستطيع تمثيل ANY دالة (Universal Approximation Theorem)." },
        { type: "code", language: "python", content: `import numpy as np

# مقارنة: خطي مقابل متعدد الحدود
def linear_model(x, w, b):
    return w * x + b

def polynomial_model(x, coeffs):
    \"\"\"دالة متعددة الحدود: c0 + c1*x + c2*x² + c3*x³ + ...\"\"\"
    return sum(c * (x ** i) for i, c in enumerate(coeffs))

# بيانات افتراضية — علاقة غير خطية (قريبة من x²)
x_values = np.linspace(-3, 3, 7)
# y = x² مع بعض الضوضاء
y_values = x_values**2 + np.random.normal(0, 0.5, 7)

print("مقارنة النماذج:")
print(f"{'x':>6} | {'y_actual':>8} | {'linear':>8} | {'poly(x²)':>8}")
print("-" * 45)
for x, y in zip(x_values, y_values):
    linear_pred = linear_model(x, w=2.0, b=0.0)
    # نموذج متعدد الحدود: 0 + 0*x + 1*x² (أي x² بالضبط)
    poly_pred = polynomial_model(x, [0, 0, 1])
    print(f"{x:6.2f} | {y:8.2f} | {linear_pred:8.2f} | {poly_pred:8.2f}")

# الشبكات العصبية = دوال متعددة الحدود معممة
# مع دوال تنشيط غير خطية، يمكنها تمثيل أي شكل!` },

        { type: "h2", content: "6. الدوال في الفضاءات العليا — من سطر لعدة أبعاد" },
        { type: "p", content: "حتى الآن، دوالنا تأخذ رقماً واحداً وترجع رقماً واحداً. في الواقع، النماذج الحقيقية تأخذ مئات أو ملايين الأرقام دفعة واحدة. دالة تأخذ متجهاً وترجع متجهاً = أساس كل Deep Learning. هذا ما يمهد للجبر الخطي في الوحدة القادمة." },
        { type: "code", language: "python", content: `# دوال متعددة المتغيرات — أساس الذكاء الاصطناعي الحقيقي
def predict_house_price(features: list[float]) -> float:
    \"\"\"المدخل: متجه من 4 خصائص | المخرج: سعر (رقم واحد)\"\"\"
    area, bedrooms, age, location_score = features
    weights = [5000, 50000, -2000, 100000]  # معاملات (تتعلم من البيانات)
    bias = 100000
    # y = w₁x₁ + w₂x₂ + w₃x₃ + w₄x₄ + b
    prediction = sum(w * f for w, f in zip(weights, features)) + bias
    return prediction

house = [120, 3, 5, 8.5]  # 120م², 3 غرف, عمر 5 سنوات, تقييم موقع 8.5
price = predict_house_price(house)
print(f"السعر المتوقع: {price:,.0f} ريال")

# دفعة كاملة (Batch) — مدخلات متعددة في آن واحد
houses_batch = [
    [120, 3, 5, 8.5],
    [85, 2, 15, 6.0],
    [200, 4, 1, 9.5],
]
print("\\nتوقعات دفعة كاملة:")
for i, h in enumerate(houses_batch):
    print(f"منزل {i+1}: {predict_house_price(h):,.0f} ريال")

# هذا هو بالضبط ما تفعله forward pass في PyTorch!
# model(batch) = model([[x₁], [x₂], [x₃]]) → [y₁, y₂, y₃]` },

        { type: "project", title: "بناء دالة ذكاء اصطناعي من الصفر", content: [
          { type: "p", content: "لنبني معاً دالة تصنيف كاملة تطبق كل ما تعلمناه: دوال، تركيب، مجالات، ودوال تنشيط." },
          { type: "code", language: "python", content: `import math

class SimpleAIClassifier:
    \"\"\"مصنف AI بسيط — يطبق كل مفاهيم الدوال\"\"\"
    
    def __init__(self):
        # معاملات النموذج (أوزان وانحيازات)
        self.w1, self.b1 = 0.8, -1.0
        self.w2, self.b2 = 1.5, 0.5
        self.w3, self.b3 = 2.0, -2.0
    
    def relu(self, x: float) -> float:
        \"\"\"دالة تنشيط: تمنع السالب\"\"\"
        return max(0.0, x)  # f(x) = max(0, x)
    
    def sigmoid(self, x: float) -> float:
        \"\"\"تحويل لاحتمال بين 0 و 1\"\"\"
        return 1.0 / (1.0 + math.exp(-x))
    
    def forward(self, x: float) -> float:
        \"\"\"التمرير الأمامي: دالة مركبة من 3 طبقات\"\"\"
        # التحقق من المجال — ممارسة هندسية جيدة
        if not isinstance(x, (int, float)):
            raise TypeError(f"المدخل يجب أن يكون رقماً، وليس {type(x).__name__}")
        
        # الطبقة 1: تحويل خطي + ReLU
        h1 = self.relu(self.w1 * x + self.b1)
        # الطبقة 2: تحويل خطي + ReLU
        h2 = self.relu(self.w2 * h1 + self.b2)
        # الطبقة 3 (المخرج): تحويل خطي + Sigmoid
        output = self.sigmoid(self.w3 * h2 + self.b3)
        return output
    
    def predict(self, x: float) -> tuple[str, float]:
        \"\"\"تصنيف: يرجع التصنيف مع الثقة\"\"\"
        prob = self.forward(x)
        if prob > 0.5:
            return ("إيجابي ✅", prob)
        else:
            return ("سلبي ❌", 1 - prob)

# اختبار المصنف
model = SimpleAIClassifier()
print("═" * 50)
print("اختبار SimpleAIClassifier")
print("═" * 50)
for test_x in [-3, -1, 0, 1, 2, 5]:
    label, confidence = model.predict(test_x)
    prob = model.forward(test_x)
    print(f"x = {test_x:3d}  →  احتمال = {prob:.4f}  →  {label} (ثقة: {confidence:.1%})")
print("═" * 50)
print("\\n✓ هذا النموذج البسيط يطبق نفس مبادئ GPT و Claude!")
print("  الفرق فقط في الحجم (مليارات المعاملات بدل 6) والتعقيد.")` }
        ]},

        { type: "active-recall", questions: [
          { q: "ما هي الدالة رياضياً؟ وكيف ترتبط بالذكاء الاصطناعي؟", a: "الدالة هي علاقة تربط كل مدخل بمخرج واحد بالضبط: f(x) = y. في AI، كل نموذج هو دالة: المدخلات (صورة، نص، بيانات) تمر عبر تحويلات (طبقات) لتنتج مخرجات (تصنيف، تنبؤ، نص مولّد). الشبكة العصبية = f(x) = f₃(f₂(f₁(x))) — دالة مركبة من طبقات." },
          { q: "ما الفرق بين المجال (Domain) والمدى (Range)؟ أعطِ مثالاً من AI.", a: "المجال: مجموعة كل المدخلات الممكنة (مثلاً: أي صورة بحجم 224×224 لبكسل لـ ResNet). المدى: مجموعة كل المخرجات الممكنة (مثلاً: 1000 احتمال تصنيف لـ ImageNet). في الإنتاج، تجاهل المجال يسبب أخطاء: إدخال صورة بحجم خاطئ = خطأ في الاستدلال." },
          { q: "لماذا الشبكة العصبية العميقة هي 'دالة مركبة'؟", a: "لأن كل طبقة هي دالة تأخذ مخرجات الطبقة السابقة كمدخلات: output = layer3(layer2(layer1(input))). هذا هو f(g(h(x))) بالضبط. التركيب يعطي قوة تمثيلية — كل طبقة تبني على تمثيلات الطبقة السابقة لتتعلم أنماطاً متدرجة التعقيد." },
          { q: "كيف يرتبط مفهوم الدالة العكسية بـ Backpropagation؟", a: "Backpropagation لا يحسب الدالة العكسية حرفياً، بل يحسب المشتقة (كيف يتغير المخرج مع تغير المدخل). لكن الفكرة متصلة: 'إذا أردنا مخرجاً معيناً (خطأ أقل)، كيف نغير المدخلات (المعاملات)؟' — هذا هو السؤال العكسي الذي تجيب عليه backpropagation." },
          { q: "ما الفرق بين نموذج خطي ونموذج متعدد الحدود؟ متى تحتاج متعدد الحدود؟", a: "النموذج الخطي y = wx + b يمثل علاقة مستقيمة فقط. العالم الحقيقي غير خطي: العلاقة بين المساحة والسعر ليست خطاً مستقيماً، والعلاقة بين الجرعة والتأثير ليست خطية. النماذج متعددة الحدود y = c₀ + c₁x + c₂x² + ... تستطيع نمذجة الانحناءات. الشبكات العصبية تعمم هذا: يمكنها تمثيل أي دالة (Universal Approximation Theorem)." }
        ]}
      ]
    },
    // ═══════════════════════════════════════════════════════════
    // UNIT 2: Linear Algebra — Vectors & Matrices
    // ═══════════════════════════════════════════════════════════
    {
      id: "unit-ai-2",
      stageId: "stage-1",
      unitNumber: 2,
      title: "الجبر الخطي — المتجهات والمصفوفات",
      description: "المتجهات كبيانات، عمليات المصفوفات، جداء Hadamard — كل شيء في AI هو مصفوفة.",
      difficulty: 3,
      prerequisites: ["unit-ai-1"],
      estimatedHours: 4,
      tags: ["linear-algebra", "vectors", "matrices"],
      content: [
        { type: "h1", content: "الوحدة 2: الجبر الخطي — المتجهات والمصفوفات" },
        { type: "p", content: "إذا سألت أي باحث Deep Learning 'ما أهم فرع رياضيات لمهندس AI؟'، سيجيب دون تردد: الجبر الخطي. الصور = مصفوفات. النصوص بعد التضمين = متجهات. طبقات الشبكة = تحويلات خطية. الانتباه (Attention) = جداء مصفوفات. كل شيء في AI الحديث يُختزل إلى عمليات على مصفوفات ومتجهات. NVIDIA بنت إمبراطورية بمليارات الدولارات لأن وحدات معالجة الرسوميات (GPUs) بارعة في ضرب المصفوفات." },
        { type: "p", content: "في هذه الوحدة، سنبني حدساً بصرياً وعملياً للمتجهات والمصفوفات. سنفهم لماذا المتجه ليس مجرد قائمة أرقام، بل نقطة في فضاء — وكيف تترجم كل مفاهيم AI (التضمين، التشابه، التحويل) إلى عمليات بسيطة على هذه الكائنات الرياضية." },

        { type: "h2", content: "1. المتجه — أكثر من مجرد قائمة أرقام" },
        { type: "p", content: "المتجه (Vector) هو قائمة مرتبة من الأرقام. لكن الأهم: هو نقطة في فضاء ذي n بعد. متجه من عنصرين = نقطة على مستوى ثنائي الأبعاد. متجه من 3 عناصر = نقطة في فضاء ثلاثي الأبعاد. متجه من 768 عنصر (مثل تضمين BERT) = نقطة في فضاء دلالي من 768 بعداً. 'المعنى' في NLP هو مجرد موقع في هذا الفضاء." },
        { type: "mermaid", content: "graph TD\n  A[\"متجه 2D: 3,4\"] --> B[\"نقطة في مستوى x-y\"]\n  C[\"متجه 3D: 1,2,3\"] --> D[\"نقطة في فضاء ثلاثي الأبعاد\"]\n  E[\"متجه 768D: تضمين كلمة\"] --> F[\"نقطة في فضاء دلالي 768 بعد\"]\n  style A fill:#e3f2fd\n  style C fill:#fff3e0\n  style E fill:#f3e5f5", caption: "المتجهات — من الهندسة إلى الدلالات" },
        { type: "code", language: "python", content: `import numpy as np
import math

# المتجه في Python/NumPy
v = np.array([3.0, 4.0])  # متجه ثنائي الأبعاد
print(f"المتجه: {v}")
print(f"الأبعاد: {v.shape}")
print(f"عدد العناصر: {len(v)}")

# المتجه = نقطة في الفضاء
# طول المتجه (Magnitude) = المسافة من نقطة الأصل
magnitude = np.linalg.norm(v)  # = √(3² + 4²) = √25 = 5
print(f"الطول (المسافة من الأصل): {magnitude}")

# متجه الوحدة (Unit Vector) = متجه طوله 1 — يحافظ على الاتجاه
unit_v = v / magnitude
print(f"متجه الوحدة: {unit_v}, طوله: {np.linalg.norm(unit_v):.1f}")

# المتجهات في AI:
# - تضمين كلمة (Word Embedding): word_vector = model["king"]
# - صورة مسطحة: image_vector = image.flatten()  # 224×224×3 = 150,528 بعد
# - خرج طبقة: output_vector = layer(input_vector)
print(f"\\nتخيل: تضمين كلمة 'ملك' هو متجه من 300 بعد")
print(f"تخيل: كل صورة 224×224 هي متجه من 150,528 بعد!")` },

        { type: "h2", content: "2. العمليات على المتجهات — لغة المعالجة" },
        { type: "p", content: "الجمع والطرح والضرب في عدد ثابت (Scalar) — هذه العمليات البسيطة هي أساس كل حسابات AI. جمع متجهين = جمع كل عنصر مع نظيره. الضرب في عدد = تكبير أو تصغير المتجه. الجداء النقطي (Dot Product) = أساس حساب 'التشابه' بين متجهين — وهو قلب أنظمة البحث والتوصية." },
        { type: "code", language: "python", content: `# العمليات الأساسية على المتجهات
a = np.array([1.0, 2.0, 3.0])
b = np.array([4.0, 5.0, 6.0])

print("العمليات الأساسية:")
print(f"a = {a}")
print(f"b = {b}")
print(f"a + b = {a + b}")          # [5, 7, 9] — جمع عنصر بعنصر
print(f"a - b = {a - b}")          # [-3, -3, -3] — طرح
print(f"a * 2 = {a * 2}")          # [2, 4, 6] — ضرب في عدد ثابت
print(f"a * b = {a * b}")          # [4, 10, 18] — Hadamard (عنصر × عنصر)

# ⭐ الجداء النقطي (Dot Product) — أهم عملية في AI!
dot_product = np.dot(a, b)  # 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
print(f"\\nالجداء النقطي a·b = {dot_product}")
print(f"يدوياً: 1×4 + 2×5 + 3×6 = {1*4 + 2*5 + 3*6}")

# الجداء النقطي = أساس قياس التشابه
# إذا كان a·b كبيراً ← المتجهان متجهان لنفس الاتجاه (متشابهان)
# إذا كان a·b ≈ 0 ← متعامدان (غير مرتبطين)
# إذا كان a·b سالباً ← متعاكسان (مختلفان تماماً)

# تطبيق AI: حساب تشابه تضمينين
king = np.array([0.8, 0.6, 0.1])
queen = np.array([0.7, 0.5, 0.2])
apple = np.array([0.1, 0.2, 0.9])

sim_king_queen = np.dot(king, queen)
sim_king_apple = np.dot(king, apple)
print(f"\\nتشابه (king, queen): {sim_king_queen:.3f} ← عالي (متشابهان)")
print(f"تشابه (king, apple): {sim_king_apple:.3f} ← منخفض (مختلفان)")` },

        { type: "callout", calloutType: "best-practice", title: "تذكرة الجداء النقطي", content: [
          { type: "p", content: "الجداء النقطي a·b = a₁b₁ + a₂b₂ + ... + aₙbₙ. في AI يُستخدم في: ① حساب التشابه بين التضمينات (Semantic Search)، ② طبقة الانتباه في Transformers (Q·Kᵀ)، ③ كل طبقة Linear في PyTorch هي في جوهرها dot product + bias. إذا فهمت dot product، فأنت تفهم 50% من رياضيات AI." }
        ]},

        { type: "h2", content: "3. المصفوفة — مجموعة منظمة من المتجهات" },
        { type: "p", content: "المصفوفة (Matrix) هي جدول مستطيل من الأرقام — يمكن التفكير فيها كمجموعة متجهات مرصوصة. المصفوفة حجمها m×n تعني m صف و n عمود. كل صف متجه، وكل عمود متجه. الصور الرقمية = مصفوفات (ارتفاع × عرض × قنوات). دفعة البيانات (Batch) = مصفوفة الصفوف فيها عينات والأعمدة خصائص." },
        { type: "code", language: "python", content: `# المصفوفة في NumPy
M = np.array([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
])
print(f"المصفوفة:\\n{M}")
print(f"الحجم: {M.shape} — ({M.shape[0]} صفوف × {M.shape[1]} أعمدة)")

# الوصول للعناصر
print(f"\\nالعنصر [1,2]: {M[1, 2]}")  # الصف 1، العمود 2 = 6
print(f"الصف الأول: {M[0, :]}")       # كل أعمدة الصف 0
print(f"العمود الثاني: {M[:, 1]}")    # كل صفوف العمود 1

# ⭐ المصفوفة في AI:
# - دفعة تدريب (Batch): 32 عينة × 10 خصائص = مصفوفة 32×10
# - طبقة Linear: أوزانها مصفوفة W
# - صورة: 28×28 = مصفوفة (MNIST)
# - مصفوفة الانتباه: scores = Q @ K.T  (batch × seq_len × seq_len)

# مثال: دفعة من 3 عينات، كل عينة 4 خصائص
batch = np.array([
    [120, 3, 5, 8.5],    # منزل 1
    [85, 2, 15, 6.0],    # منزل 2
    [200, 4, 1, 9.5],    # منزل 3
])
print(f"\\nدفعة البيانات: {batch.shape[0]} عينات × {batch.shape[1]} خصائص")
print(f"هذه مصفوفة {batch.shape[0]}×{batch.shape[1]}")` },

        { type: "h2", content: "4. جداء المصفوفات — قلب GPU" },
        { type: "p", content: "جداء المصفوفات (Matrix Multiplication) هو العملية الأكثر أهمية في AI على الإطلاق. كل forward pass في أي شبكة عصبية — من أبسط MLP إلى GPT-4 — يتكون أساساً من سلسلة عمليات جداء مصفوفات. GPUs صُممت خصيصاً لتسريع هذه العملية. A @ B حيث A حجمها m×n و B حجمها n×p ينتج مصفوفة حجمها m×p." },
        { type: "mermaid", content: "graph LR\n  A[\"A (m × n)\"] --> MM[\"A @ B\"]\n  B[\"B (n × p)\"] --> MM\n  MM --> C[\"C (m × p)\"]\n  style A fill:#e3f2fd\n  style B fill:#fff3e0\n  style MM fill:#ffcdd2\n  style C fill:#c8e6c9", caption: "شرط جداء المصفوفات: أعمدة الأولى = صفوف الثانية" },
        { type: "code", language: "python", content: `# جداء المصفوفات — العملية الملكة في AI
A = np.array([
    [1, 2, 3],
    [4, 5, 6]
])  # 2×3
B = np.array([
    [7, 8],
    [9, 10],
    [11, 12]
])  # 3×2

# A @ B = مصفوفة 2×2
C = A @ B  # أو np.matmul(A, B)
print(f"A (2×3) @ B (3×2) = C (2×2):")
print(C)
# C[0,0] = 1*7 + 2*9 + 3*11 = 7+18+33 = 58
# C[0,1] = 1*8 + 2*10 + 3*12 = 8+20+36 = 64
# C[1,0] = 4*7 + 5*9 + 6*11 = 28+45+66 = 139
# C[1,1] = 4*8 + 5*10 + 6*12 = 32+50+72 = 154
print(f"\\nالتحقق يدوياً:")
print(f"C[0,0] = 1×7+2×9+3×11 = {1*7+2*9+3*11} ✓")

# ⭐⭐ أهم تطبيق: forward pass في طبقة Linear
# output = input @ W + b
batch_size, input_dim, output_dim = 32, 10, 5
input_batch = np.random.randn(batch_size, input_dim)  # 32 × 10
W = np.random.randn(input_dim, output_dim)             # 10 × 5
b = np.random.randn(output_dim)                        # 5

# Forward pass — هذا ما تفعله كل طبقة Linear في PyTorch!
output = input_batch @ W + b  # (32×10) @ (10×5) + (5) = (32×5)
print(f"\\nForward pass: input {input_batch.shape} @ W {W.shape} + b = output {output.shape}")

# ⭐⭐⭐ الانتباه (Attention): scores = Q @ K^T
seq_len, d_k = 10, 64
Q = np.random.randn(seq_len, d_k)  # 10 × 64
K = np.random.randn(seq_len, d_k)  # 10 × 64
scores = Q @ K.T                   # (10×64) @ (64×10) = (10×10)
print(f"Attention scores: Q {Q.shape} @ K^T {K.T.shape} = {scores.shape}")
print("هذا هو قلب Transformer! جداء مصفوفات بسيط.")` },

        { type: "h2", content: "5. النقل والهوية والمعكوس" },
        { type: "p", content: "نقل المصفوفة (Transpose) يبدل الصفوف بالأعمدة: Aᵀ. مصفوفة الهوية (Identity) I هي '1' المصفوفات — ضرب أي مصفوفة في I لا يغيرها. المعكوس (Inverse) A⁻¹ هو 'المقسوم عليه' في عالم المصفوفات: A @ A⁻¹ = I. هذه العمليات أساسية في تحسين النماذج وحل أنظمة المعادلات." },
        { type: "code", language: "python", content: `M = np.array([
    [1, 2, 3],
    [4, 5, 6]
])
print(f"M (2×3):\\n{M}")
print(f"\\nMᵀ (3×2) — النقل:\\n{M.T}")
print(f"الحجم الأصلي: {M.shape} → بعد النقل: {M.T.shape}")

# مصفوفة الهوية
I3 = np.eye(3)
print(f"\\nI₃ (مصفوفة الهوية 3×3):\\n{I3}")

# تطبيق الهوية: I @ A = A
A = np.array([[2, 3], [4, 5], [6, 7]])
print(f"\\nI₃ @ A:\\n{I3 @ A}")
print(f"هل I @ A == A؟ {np.allclose(I3 @ A, A)}")

# المعكوس (للمصفوفات المربعة فقط)
square_M = np.array([[4, 7], [2, 6]])
M_inv = np.linalg.inv(square_M)
print(f"\\nالمعكوس:\\n{M_inv}")
print(f"M @ M⁻¹ =\\n{square_M @ M_inv}")
print(f"هل يساوي I؟ {np.allclose(square_M @ M_inv, np.eye(2))}")

# في AI: المعكوس نادر الاستخدام مباشرة
# لكن فكرة 'حل النظام' موجودة في الانحدار الخطي:
# weights = (XᵀX)⁻¹ Xᵀ y  — هذه معادلة الانحدار الخطي!` },

        { type: "project", title: "بناء محرك بحث دلالي مصغر", content: [
          { type: "p", content: "لنطبق كل ما تعلمناه عن المتجهات والمصفوفات لبناء محرك بحث دلالي بسيط — يبحث عن معنى الكلمات وليس تطابقها الحرفي." },
          { type: "code", language: "python", content: `class MiniSemanticSearch:
    \"\"\"محرك بحث دلالي باستخدام المتجهات والجداء النقطي\"\"\"
    
    def __init__(self):
        # تضمينات يدوية بسيطة لبعض الكلمات (عادةً تتعلم من نموذج)
        self.vocab = {
            "ملك":   np.array([0.9, 0.7, 0.1]),
            "ملكة":  np.array([0.8, 0.6, 0.2]),
            "رجل":   np.array([0.7, 0.8, 0.1]),
            "امرأة": np.array([0.6, 0.7, 0.1]),
            "تفاح":  np.array([0.1, 0.2, 0.9]),
            "موز":   np.array([0.1, 0.1, 0.8]),
            "كمبيوتر": np.array([0.5, 0.3, 0.6]),
            "برنامج": np.array([0.4, 0.4, 0.7]),
        }
    
    def cosine_similarity(self, a, b):
        \"\"\"تشابه جيب التمام — مقياس التشابه المعياري\"\"\"
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
    
    def search(self, query: str, top_k: int = 3):
        \"\"\"البحث عن أقرب الكلمات دلالياً\"\"\"
        if query not in self.vocab:
            return f"'{query}' غير موجودة في القاموس"
        
        query_vec = self.vocab[query]
        scores = []
        for word, vec in self.vocab.items():
            if word != query:
                sim = self.cosine_similarity(query_vec, vec)
                scores.append((word, sim))
        
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]
    
    def analogy(self, a, b, c):
        \"\"\"حل معادلات التشبيه: a - b + c = ?\"\"\"
        # مثل: ملك - رجل + امرأة = ملكة
        result_vec = self.vocab[a] - self.vocab[b] + self.vocab[c]
        best_word, best_sim = None, -1
        for word, vec in self.vocab.items():
            if word not in [a, b, c]:
                sim = self.cosine_similarity(result_vec, vec)
                if sim > best_sim:
                    best_sim, best_word = sim, word
        return best_word

# تشغيل المحرك
engine = MiniSemanticSearch()
print("═" * 50)
print("محرك البحث الدلالي")
print("═" * 50)

# اختبار البحث
for query in ["ملك", "تفاح", "كمبيوتر"]:
    results = engine.search(query)
    print(f"\\nبحث عن '{query}':")
    for word, score in results:
        bar = "█" * int(score * 20)
        print(f"  {word:10s} {score:.3f} {bar}")

# اختبار التشبيه
print(f"\\nتشبيه: ملك - رجل + امرأة = {engine.analogy('ملك', 'رجل', 'امرأة')}")
print("✓ هذا نفس مبدأ word2vec الشهير: king - man + woman = queen!")` }
        ]},

        { type: "active-recall", questions: [
          { q: "لماذا المتجه ليس مجرد قائمة أرقام في AI؟", a: "المتجه يمثل نقطة في فضاء ذي n بعد. تضمين كلمة من 300 بعد = نقطة في فضاء دلالي. المسافة بين متجهين = اختلاف دلالي. اتجاه المتجه = معناه. هذا التمثيل الهندسي هو ما يمكن النماذج من 'فهم' المعنى." },
          { q: "ما هو الجداء النقطي (Dot Product)؟ وأين يُستخدم في AI؟", a: "الجداء النقطي a·b = Σaᵢbᵢ ينتج رقماً واحداً. يُستخدم في: ① حساب التشابه بين التضمينات (كلما كان أكبر، كلما كان المتجهان أكثر تشابهاً)، ② الانتباه في Transformers (Q·Kᵀ ينتج مصفوفة الانتباه)، ③ كل طبقة Linear (output = input·W + b)." },
          { q: "اشرح شرط جداء المصفوفات A @ B.", a: "عدد أعمدة A يجب أن يساوي عدد صفوف B. إذا كان A حجمها m×n، يجب أن يكون B حجمها n×p، والناتج سيكون m×p. لو الشرط لم يتحقق، العملية غير معرفة (shape mismatch). هذا هو أكثر خطأ شيوعاً في PyTorch: 'mat1 and mat2 shapes cannot be multiplied'." },
          { q: "ما العلاقة بين الصورة الرقمية والمصفوفة؟", a: "الصورة الرقمية هي مصفوفة (أو موتر). صورة ملونة 224×224 = مصفوفة 3D بحجم 224×224×3 (ارتفاع × عرض × قنوات RGB). كل عنصر رقم بين 0 و 255. عمليات Convolution هي عمليات مصفوفات متخصصة. لهذا GPUs — المصممة لعمليات المصفوفات — أساسية في معالجة الصور." },
          { q: "كيف يعمل تشبيه king - man + woman = queen؟", a: "في فضاء التضمينات، الاتجاه من 'رجل' إلى 'امرأة' يمثل مفهوم 'النوع'. طرح متجه 'رجل' من 'ملك' يزيل خاصية الذكورة، ثم إضافة متجه 'امرأة' يضيف خاصية الأنوثة، لنصل إلى 'ملكة'. هذه الخاصية المدهشة اكتُشفت في word2vec وأثبتت أن النماذج تتعلم فعلاً تمثيلات ذات معنى." }
        ]}
      ]
    },
    // ═══════════════════════════════════════════════════════════
    // UNIT 3: Linear Spaces & Transformations
    // ═══════════════════════════════════════════════════════════
    {
      id: "unit-ai-3",
      stageId: "stage-1",
      unitNumber: 3,
      title: "الفضاءات والتحويلات الخطية",
      description: "التحويلات الخطية، الأساس، المدى — ماذا تفعل طبقة Linear في PyTorch فعلاً.",
      difficulty: 3,
      prerequisites: ["unit-ai-2"],
      estimatedHours: 4,
      tags: ["linear-algebra", "transformations", "spaces"],
      content: [
        { type: "h1", content: "الوحدة 3: الفضاءات والتحويلات الخطية" },
        { type: "p", content: "حتى الآن تعاملنا مع المتجهات والمصفوفات ككائنات ثابتة — أرقام في جداول. لكن السحر الحقيقي يحدث عندما نستخدم المصفوفات 'لتحويل' المتجهات: تدوير، تمديد، ضغط، إسقاط، عكس. هذا هو جوهر كل طبقة في الشبكة العصبية: كل طبقة Linear هي تحويل خطي للبيانات من فضاء لآخر. فهم التحويلات الخطية = فهم ما تفعله الشبكة العصبية داخلياً." },

        { type: "h2", content: "1. التحويل الخطي — قلب الشبكة العصبية" },
        { type: "p", content: "التحويل الخطي T(v) = Av هو العملية التي تأخذ متجهاً v وتضربه في مصفوفة A لتنتج متجهاً جديداً في فضاء جديد. في PyTorch، nn.Linear(in_features, out_features) يخزن مصفوفة وزن W من حجم out×in ومتجه انحياز b. الـ forward pass هو بالضبط: y = Wx + b — تحويل خطي!" },
        { type: "mermaid", content: "graph LR\n  X[\"متجه في ℝⁿ\"] --> L[\"طبقة Linear\"]\n  L --> Y[\"متجه في ℝᵐ\"]\n  subgraph \"داخل الطبقة\"\n    W[\"مصفوفة الوزن W\"]\n    B[\"الانحياز b\"]\n  end\n  L -.-> W\n  L -.-> B\n  style X fill:#e3f2fd\n  style Y fill:#c8e6c9\n  style W fill:#fff9c4\n  style B fill:#fff9c4", caption: "طبقة Linear = تحويل خطي y = Wx + b" },
        { type: "code", language: "python", content: `import numpy as np

# محاكاة طبقة nn.Linear(3, 2) في PyTorch
class LinearLayer:
    \"\"\"طبقة تحويل خطي — تماماً مثل nn.Linear في PyTorch\"\"\"
    def __init__(self, in_features: int, out_features: int):
        # مصفوفة الوزن: out_features × in_features
        self.W = np.random.randn(out_features, in_features) * 0.1
        # متجه الانحياز: out_features
        self.b = np.zeros(out_features)
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        \"\"\"التحويل الخطي: y = Wx + b\"\"\"
        # لو المدخل batch: (batch, in_features)
        # y = (batch, in_features) @ (in_features, out_features) + (out_features)
        return x @ self.W.T + self.b
    
    def __repr__(self):
        return f"Linear(in={self.W.shape[1]}, out={self.W.shape[0]})"

# إنشاء طبقة: من 3 مدخلات إلى 2 مخرجات
linear = LinearLayer(3, 2)
print(f"الطبقة: {linear}")
print(f"مصفوفة الوزن W ({linear.W.shape}):\\n{np.round(linear.W, 3)}")
print(f"الانحياز b ({linear.b.shape}): {linear.b}")

# Forward pass — تحويل خطي!
x = np.array([1.0, 2.0, 3.0])  # متجه في ℝ³
y = linear.forward(x)            # متجه في ℝ²
print(f"\\nالمدخل x ∈ ℝ³: {x}")
print(f"المخرج y ∈ ℝ²: {np.round(y, 3)}")

# دفعة كاملة (Batch Forward):
batch = np.array([
    [1.0, 2.0, 3.0],
    [4.0, 5.0, 6.0],
    [7.0, 8.0, 9.0],
])
batch_out = linear.forward(batch)
print(f"\\nBatch: {batch.shape} → {batch_out.shape}")
print(f"كل سطر حُوّل من ℝ³ إلى ℝ²")

# هذا هو بالضبط nn.Linear(3, 2)(x) في PyTorch!` },

        { type: "h2", content: "2. أنواع التحويلات الخطية — ماذا تفعل المصفوفة؟" },
        { type: "p", content: "المصفوفة تستطيع: تدوير (Rotation)، تمديد/ضغط (Scaling)، قص (Shear)، عكس (Reflection)، وإسقاط (Projection). في الشبكات العصبية، كل طبقة تتعلم أي نوع من التحويلات مفيد للمهمة. المصفوفة ليست عشوائية — قيمها (الأوزان) تتغير أثناء التدريب لتصبح التحويل الأمثل." },
        { type: "code", language: "python", content: `# أنواع التحويلات الخطية — تجارب بصرية
import numpy as np

# متجهات أساسية للاختبار
vectors = np.array([
    [1, 0],   # متجه x
    [0, 1],   # متجه y
    [1, 1],   # قطري
])

def apply_and_print(name, matrix, vectors):
    \"\"\"يطبق التحويل ويطبع النتائج\"\"\"
    print(f"\\n{name}:")
    print(f"المصفوفة:\\n{matrix}")
    for v in vectors:
        result = matrix @ v
        print(f"  ({v[0]}, {v[1]}) → ({result[0]:.1f}, {result[1]:.1f})")

# 1. مصفوفة الهوية — لا تغير شيئاً
apply_and_print("1️⃣ الهوية (لا تغيير)", np.eye(2), vectors)

# 2. تدوير 90 درجة
theta = np.pi / 2
rotation = np.array([
    [np.cos(theta), -np.sin(theta)],
    [np.sin(theta),  np.cos(theta)]
])
apply_and_print("2️⃣ تدوير 90°", rotation, vectors)

# 3. تمديد (Scaling) — تكبير ×2
scaling = np.array([[2, 0], [0, 2]])
apply_and_print("3️⃣ تمديد ×2", scaling, vectors)

# 4. إسقاط على المحور x (فقدان البعد y)
projection = np.array([[1, 0], [0, 0]])
apply_and_print("4️⃣ إسقاط على محور x", projection, vectors)

# 5. قص (Shear)
shear = np.array([[1, 1], [0, 1]])
apply_and_print("5️⃣ قص أفقي", shear, vectors)

print("\\n══════════════════════════════════")
print("في الشبكات العصبية: كل طبقة تتعلم")
print("المصفوفة المثلى من البيانات!")
print("══════════════════════════════════")` },

        { type: "h2", content: "3. الأساس والامتداد — لغز الأبعاد" },
        { type: "p", content: "الأساس (Basis) هو مجموعة متجهات 'تولد' الفضاء كله — أي متجه يمكن كتابته كتركيبة خطية من متجهات الأساس. عدد متجهات الأساس = بُعد الفضاء. في AI، فكرة الأساس تشرح: لماذا PCA يضغط البيانات؟ لأنه يجد أساساً جديداً تتركز فيه المعلومات في أبعاد أقل. لماذا Autoencoder يضغط؟ لأنه يتعلم أساساً مخفياً." },
        { type: "code", language: "python", content: `# الأساس (Basis) — مفهوم جوهري في AI
# الأساس القياسي في ℝ²: (1,0) و (0,1)
e1 = np.array([1.0, 0.0])
e2 = np.array([0.0, 1.0])

# أي متجه = تركيبة خطية من الأساس
# v = a*e1 + b*e2
v = np.array([3.0, 4.0])
a, b = 3.0, 4.0
reconstructed = a * e1 + b * e2
print(f"v = {v}")
print(f"v = {a}×{e1} + {b}×{e2} = {reconstructed}")
print(f"متطابقان؟ {np.allclose(v, reconstructed)}")

# تغيير الأساس — تدوير 45°
theta = np.pi / 4
new_basis = np.array([
    [np.cos(theta), -np.sin(theta)],  # أساس جديد 1
    [np.sin(theta),  np.cos(theta)]   # أساس جديد 2
])
print(f"\\nالأساس الجديد (تدوير 45°):\\n{np.round(new_basis, 3)}")

# ما إحداثيات v في الأساس الجديد؟
# v_new = new_basis⁻¹ @ v
v_in_new_basis = np.linalg.inv(new_basis) @ v
print(f"إحداثيات v في الأساس الجديد: {np.round(v_in_new_basis, 3)}")
# ملاحظة: الطول محفوظ — فقط الإحداثيات تتغير!

# تطبيق AI: PCA
# PCA = إيجاد أساس جديد (المكونات الرئيسية) يلتقط أكبر تباين
# ثم إسقاط البيانات على أول k متجه أساس فقط ← ضغط!
print("\\nفي PCA: البيانات = تركيبة خطية من متجهات أساس جديدة")
print("نحتفظ بأهم k متجه أساس للتخلص من الأبعاد غير المهمة")` },

        { type: "h2", content: "4. الرتبة والفضاءات الجزئية" },
        { type: "p", content: "رتبة المصفوفة (Rank) = عدد الأبعاد 'الفعالة' — عدد الصفوف/الأعمدة المستقلة خطياً. مصفوفة منخفضة الرتبة = معلومات أقل = إمكانية ضغط. هذا أساس: Low-Rank Adaptation (LoRA) لضبط النماذج الكبيرة، وضغط النماذج، وتقليل الأبعاد." },
        { type: "code", language: "python", content: `# الرتبة (Rank) — مفهوم قوي جداً في AI الحديث
# مصفوفة كاملة الرتبة
full_rank = np.array([
    [1, 2],
    [3, 4]
])
print(f"رتبة المصفوفة الكاملة: {np.linalg.matrix_rank(full_rank)}")
print(f"(أقصى رتبة لمصفوفة 2×2 = 2)")

# مصفوفة منخفضة الرتبة (الصف الثاني = 2× الصف الأول)
low_rank = np.array([
    [1, 2],
    [2, 4]  # = 2 × الصف الأول — لا معلومات جديدة!
])
print(f"\\nرتبة المصفوفة منخفضة الرتبة: {np.linalg.matrix_rank(low_rank)}")
print("الصف الثاني = 2× الصف الأول → رتبة = 1 فقط!")

# ⭐ تطبيق AI: LoRA (Low-Rank Adaptation)
# بدل تحديث مصفوفة W كاملة (d×k)، نستخدم:
# W_new = W + B @ A   حيث B (d×r), A (r×k), و r << d,k
# هذا يوفر 99% من الذاكرة والتدريب!
d, k, r = 1000, 1000, 8  # r=8 فقط!
W = np.random.randn(d, k)
B = np.random.randn(d, r)
A = np.random.randn(r, k)

W_lora = W + B @ A
params_full = d * k
params_lora = d * r + r * k
print(f"\\nمعاملات التحديث الكامل: {params_full:,}")
print(f"معاملات LoRA (r={r}): {params_lora:,}")
print(f"توفير: {(1 - params_lora/params_full)*100:.1f}%!")
print("هذا هو مبدأ LoRA — أساس ضبط النماذج الكبيرة بكفاءة!")` },

        { type: "callout", calloutType: "ai-tip", title: "التحويلات الخطية والذكاء الاصطناعي", content: [
          { type: "p", content: "جرب هذا الـ Prompt: «اشرح لي لماذا كل طبقة Linear في PyTorch هي تحويل خطي. أعطني أمثلة بصرية: كيف تبدو البيانات قبل وبعد المرور بـ nn.Linear. استخدم تشبيهاً: التحويل الخطي مثل 'عدسة' ترى البيانات من زاوية جديدة. ما علاقة هذا بـ Attention في Transformers؟»" }
        ]},

        { type: "active-recall", questions: [
          { q: "ما هو التحويل الخطي؟ وكيف يرتبط بـ nn.Linear؟", a: "التحويل الخطي T(v) = Av + b يأخذ متجهاً ويحوله لفضاء جديد. nn.Linear(in, out) يطبق بالضبط: y = Wx + b. مصفوفة الوزن W تحدد 'كيف' يتحول المتجه (تدوير، تمديد، إسقاط). أثناء التدريب، تتعلم W قيماً تحسن أداء المهمة." },
          { q: "ما هو أساس الفضاء (Basis)؟ وكيف يرتبط بـ PCA؟", a: "الأساس: مجموعة متجهات مستقلة 'تولد' الفضاء كله — أي نقطة = تركيبة خطية منها. عدد المتجهات = بُعد الفضاء. PCA يبحث عن أساس جديد (المكونات الرئيسية) مرتب تنازلياً حسب كمية التباين التي يلتقطها. ثم يختار أول k متجه أساس فقط للضغط — يحافظ على أكبر قدر من المعلومات بأقل عدد أبعاد." },
          { q: "كيف تعمل LoRA (Low-Rank Adaptation)؟", a: "بدلاً من تحديث كل معاملات النموذج (W كاملة d×k)، تستخدم LoRA مصفوفتين صغيرتين B (d×r) و A (r×k) حيث r صغير جداً (مثل 8 أو 16). التحديث = B@A (رتبة r). هذا يوفر >99% من الذاكرة ويسمح بضبط نماذج بمليارات المعاملات على GPU واحد." }
        ]}
      ]
    },
    // ═══════════════════════════════════════════════════════════
    // UNIT 4: Eigenvalues & Eigenvectors
    // ═══════════════════════════════════════════════════════════
    {
      id: "unit-ai-4",
      stageId: "stage-1",
      unitNumber: 4,
      title: "القيم الذاتية والمتجهات الذاتية",
      description: "Eigenvalues/Eigenvectors، SVD، حدس PCA — ضغط البيانات وفهم التباين.",
      difficulty: 4,
      prerequisites: ["unit-ai-2", "unit-ai-3"],
      estimatedHours: 4,
      tags: ["linear-algebra", "eigenvalues", "pca", "svd"],
      content: [
        { type: "h1", content: "الوحدة 4: القيم الذاتية والمتجهات الذاتية" },
        { type: "p", content: "تخيل أن لديك مصفوفة كبيرة تمثل بياناتك — آلاف الصور أو النصوص. هل يمكنك اكتشاف 'الاتجاهات المهمة' فيها؟ هل يمكنك ضغطها دون أن تفقد جوهرها؟ هذا بالضبط ما تفعله القيم الذاتية (Eigenvalues) والمتجهات الذاتية (Eigenvectors). إنها تكشف 'البصمة' المخفية لأي مصفوفة — المحاور الطبيعية التي تتمدد أو تنضغط البيانات حولها." },
        { type: "p", content: "في AI، القيم والمتجهات الذاتية هي أساس: PCA (تحليل المكونات الرئيسية) لضغط البيانات، SVD (تفكيك القيمة المفردة) لأنظمة التوصية، تحليل PageRank، وفهم استقرار تدريب الشبكات العصبية. بدون مبالغة: SVD هو السر وراء أنظمة التوصية في Netflix و Amazon." },

        { type: "h2", content: "1. ما هي القيمة الذاتية والمتجه الذاتي؟" },
        { type: "p", content: "المتجه الذاتي v لمصفوفة A هو متجه 'خاص' — حين تضربه في A، الناتج هو v نفسه لكن مضروباً في عدد λ (القيمة الذاتية): Av = λv. المتجه الذاتي لا يتغير اتجاهه بعد التحويل — فقط طوله يتغير. القيمة الذاتية λ تخبرك 'كم' يتغير الطول: λ > 1 = تمدد، 0 < λ < 1 = انكماش، λ سالب = انعكاس." },
        { type: "mermaid", content: "graph TD\n  V[\"متجه ذاتي v\"] --> A[\"A × v\"]\n  A --> R[\"λ × v = الناتج\"]\n  subgraph \"الخاصية\"\n    D[\"الاتجاه لا يتغير!\"]\n  end\n  R -.-> D\n  style V fill:#e3f2fd\n  style A fill:#fff9c4\n  style R fill:#c8e6c9", caption: "المتجه الذاتي: Av = λv — نفس الاتجاه، طول مختلف" },
        { type: "code", language: "python", content: `import numpy as np

# مصفوفة بسيطة للاختبار
A = np.array([
    [2, 1],
    [1, 2]
])
print("المصفوفة A:")
print(A)

# حساب القيم والمتجهات الذاتية
eigenvalues, eigenvectors = np.linalg.eig(A)
print(f"\\nالقيم الذاتية: {eigenvalues}")
print(f"المتجهات الذاتية (كأعمدة):\\n{eigenvectors}")

# التحقق: A @ v = λ * v
for i in range(len(eigenvalues)):
    v = eigenvectors[:, i]  # المتجه الذاتي i
    lam = eigenvalues[i]      # القيمة الذاتية i
    Av = A @ v
    lam_v = lam * v
    print(f"\\nالمتجه الذاتي {i+1}:")
    print(f"  v = {np.round(v, 3)}")
    print(f"  λ = {lam:.3f}")
    print(f"  A@v = {np.round(Av, 3)}")
    print(f"  λ*v = {np.round(lam_v, 3)}")
    print(f"  متطابقان؟ {np.allclose(Av, lam_v)}")

# ماذا تعني القيم الذاتية؟
print(f"\\n═══════════════════════")
print("تفسير القيم الذاتية:")
for i, lam in enumerate(eigenvalues):
    if abs(lam) > 1:
        print(f"  λ{i+1} = {lam:.1f} --> تمدد (تكبير)")
    elif abs(lam) < 1:
        print(f"  λ{i+1} = {lam:.1f} --> انكماش (تصغير)")
    else:
        print(f"  λ{i+1} = {lam:.1f} --> لا تغيير")` },

        { type: "h2", content: "2. PCA — من القيم الذاتية لضغط البيانات" },
        { type: "p", content: "PCA (Principal Component Analysis) هو أشهر تطبيق للقيم الذاتية في AI. الفكرة: نبحث عن 'متجهات ذاتية' لمصفوفة التغاير (Covariance Matrix) للبيانات. المتجه الذاتي ذو أكبر قيمة ذاتية = الاتجاه الذي فيه أكبر تباين = أهم 'مكون رئيسي'. بالإسقاط على أول k مكونات فقط، نضغط البيانات مع الحفاظ على أكبر قدر من المعلومات." },
        { type: "code", language: "python", content: `# PCA من الصفر — باستخدام القيم الذاتية
import numpy as np

# بيانات ثنائية الأبعاد (مرتبطة — ليست مستقلة)
np.random.seed(42)
n = 100
x = np.random.randn(n)
y = 0.7 * x + 0.3 * np.random.randn(n)  # y مرتبط بـ x
X = np.column_stack([x, y])
print(f"البيانات: {X.shape[0]} نقطة × {X.shape[1]} بعد")
print(f"ارتباط x,y: {np.corrcoef(x, y)[0,1]:.3f}")

# PCA يدوياً:
# 1. توسيط البيانات
X_centered = X - X.mean(axis=0)

# 2. مصفوفة التغاير
cov_matrix = (X_centered.T @ X_centered) / (n - 1)
print(f"\\nمصفوفة التغاير:\\n{np.round(cov_matrix, 4)}")

# 3. القيم والمتجهات الذاتية لمصفوفة التغاير
eigvals, eigvecs = np.linalg.eig(cov_matrix)
print(f"\\nالقيم الذاتية: {np.round(eigvals, 4)}")
print(f"المكونات الرئيسية (المتجهات الذاتية):\\n{np.round(eigvecs, 4)}")

# 4. ترتيب تنازلي (أكبر قيمة ذاتية أولاً)
idx = np.argsort(eigvals)[::-1]
eigvals = eigvals[idx]
eigvecs = eigvecs[:, idx]

# 5. اختيار أول k مكونات
k = 1  # نضغط من 2D إلى 1D
W = eigvecs[:, :k]  # مصفوفة الإسقاط
X_reduced = X_centered @ W

# 6. نسبة التباين المحفوظ
total_var = np.sum(eigvals)
explained_var = np.sum(eigvals[:k])
print(f"\\nضغط من {X.shape[1]}D إلى {k}D:")
print(f"التباين المحفوظ: {explained_var/total_var:.1%}")
print(f"المكون الرئيسي الأول يلتقط {explained_var/total_var:.1%} من المعلومات!")

# مقارنة مع sklearn
from sklearn.decomposition import PCA as SklearnPCA
pca = SklearnPCA(n_components=1)
X_sklearn = pca.fit_transform(X)
print(f"\\nSklearn مطابق؟ {np.allclose(np.abs(X_reduced), np.abs(X_sklearn), atol=1e-5)}")` },

        { type: "h2", content: "3. SVD — تفكيك القيمة المفردة" },
        { type: "p", content: "SVD (Singular Value Decomposition) هو 'أقوى أداة في الجبر الخطي التطبيقي'. أي مصفوفة A يمكن تفكيكها إلى A = U Σ Vᵀ حيث U و V متعامدتان و Σ قطرية تحتوي القيم المفردة (Singular Values). SVD هو أساس: أنظمة التوصية (Collaborative Filtering)، ضغط الصور، Latent Semantic Analysis، وتقريب المصفوفات منخفض الرتبة." },
        { type: "mermaid", content: "graph LR\n  A[\"A (m×n)\"] --> U[\"U (m×m)\"]\n  A --> S[\"Σ (m×n)\"]\n  A --> VT[\"Vᵀ (n×n)\"]\n  U --> REC[\"A = U Σ Vᵀ\"]\n  S --> REC\n  VT --> REC\n  style A fill:#ffcdd2\n  style U fill:#e3f2fd\n  style S fill:#fff9c4\n  style VT fill:#c8e6c9\n  style REC fill:#f3e5f5", caption: "SVD: أي مصفوفة = U Σ Vᵀ" },
        { type: "code", language: "python", content: `# SVD — الأداة السحرية في AI
import numpy as np

# مصفوفة تقييمات أفلام (Users × Movies)
# الصفوف: مستخدمون | الأعمدة: أفلام | NaN = لم يشاهد
ratings = np.array([
    [5, 3, 0, 1],
    [4, 0, 0, 1],
    [1, 1, 0, 5],
    [1, 0, 0, 4],
    [0, 1, 5, 4],
], dtype=float)
print("مصفوفة التقييمات (0 = لم يشاهد):")
print(ratings)

# SVD
U, S, Vt = np.linalg.svd(ratings, full_matrices=False)
print(f"\\nU: {U.shape}")
print(f"S (القيم المفردة): {np.round(S, 3)}")
print(f"Vt: {Vt.shape}")

# الضغط: الاحتفاظ بأول k قيم مفردة فقط
k = 2
U_k = U[:, :k]
S_k = np.diag(S[:k])
Vt_k = Vt[:k, :]

# إعادة بناء منخفضة الرتبة
ratings_approx = U_k @ S_k @ Vt_k
print(f"\\nإعادة البناء برتبة {k}:")
print(np.round(ratings_approx, 2))
print(f"\\nالمصفوفة الأصلية:")
print(ratings)

# التوصية: SVD يملأ الفراغات!
# المستخدم 0 لم يشاهد الفيلم 2 — الآن لدينا تقدير:
print(f"\\nتقدير تقييم المستخدم 0 للفيلم 2: {ratings_approx[0, 2]:.2f}")
print("هذا هو أساس أنظمة التوصية في Netflix و Amazon!")` },

        { type: "callout", calloutType: "ai-tip", title: "افهم PCA/SVD = افهم ضغط البيانات", content: [
          { type: "p", content: "جرب: «اشرح لي PCA كأنني مطور برمجيات محترف. كيف أستخدمه لضغط البيانات؟ ما الفرق بين PCA و SVD؟ ومتى أستخدم كلاً منهما؟ أعطني أمثلة بلغة Python مع NumPy. ثم اشرح لي لماذا تستخدم أنظمة التوصية SVD لملء التقييمات الناقصة.»" }
        ]},

        { type: "active-recall", questions: [
          { q: "ما معنى Av = λv؟ اشرح بمثال بسيط.", a: "هذه معادلة القيمة الذاتية. A مصفوفة، v متجه ذاتي، λ قيمة ذاتية. المعنى: عندما تضرب A في v، الناتج هو v نفسه لكن مضروباً في λ — الاتجاه لا يتغير، فقط الطول يتغير. إذا كانت λ = 3، فالمتجه يتمدد 3 مرات. إذا λ = 0.5، ينكمش للنصف. هذه الخاصية تكشف 'المحاور الطبيعية' للمصفوفة." },
          { q: "كيف يعمل PCA؟ وما علاقته بالقيم الذاتية؟", a: "PCA: ① توسيط البيانات ② حساب مصفوفة التغاير ③ إيجاد القيم والمتجهات الذاتية لمصفوفة التغاير ④ ترتيبها تنازلياً حسب القيم الذاتية ⑤ اختيار أول k متجهات (المكونات الرئيسية) ⑥ إسقاط البيانات عليها. المتجه الذاتي ذو أكبر قيمة ذاتية = اتجاه التباين الأكبر = أهم المعلومات." },
          { q: "ما هو SVD؟ وكيف يُستخدم في أنظمة التوصية؟", a: "SVD: A = UΣVᵀ. أي مصفوفة (حتى غير المربعة) تتحلل لثلاث مصفوفات. في التوصية: مصفوفة التقييمات (مستخدمين×أفلام) بها فراغات. SVD يعيد بناءها برتبة منخفضة، فيملأ الفراغات بتقديرات — تنبؤ بتقييم المستخدم لأفلام لم يشاهدها. Netflix Prize استخدم SVD." }
        ]}
      ]
    },
    // ═══════════════════════════════════════════════════════════
    // UNIT 5: Probability
    // ═══════════════════════════════════════════════════════════
    {
      id: "unit-ai-5",
      stageId: "stage-1",
      unitNumber: 5,
      title: "الاحتمالات — لغة عدم اليقين",
      description: "مسلمات الاحتمال، قاعدة بايز، الاحتمال الشرطي — لماذا يتنبأ النموذج ومتى يخطئ.",
      difficulty: 3,
      prerequisites: ["unit-ai-1"],
      estimatedHours: 3,
      tags: ["probability", "bayes", "uncertainty"],
      content: [
        { type: "h1", content: "الوحدة 5: الاحتمالات — لغة عدم اليقين" },
        { type: "p", content: "كل نموذج ذكاء اصطناعي — من الانحدار اللوجستي إلى GPT-4 — هو في جوهره 'آلة احتمالات'. النموذج لا 'يعرف' الإجابة الصحيحة. هو يُخرج توزيعاً احتمالياً: 'أعتقد بنسبة 87% أن هذه صورة قطة، و 12% كلب، و 1% ثعلب'. الاحتمالات هي اللغة التي يتحدث بها الذكاء الاصطناعي، وفهمها أساسي لكل شيء: التدريب، التقييم، المعايرة، واتخاذ القرار." },

        { type: "h2", content: "1. مسلمات الاحتمال — قواعد اللعبة" },
        { type: "p", content: "الاحتمال P(A) هو رقم بين 0 (مستحيل) و 1 (مؤكد). مسلمات Kolmogorov الثلاث تحكم كل شيء: ① احتمال أي حدث ≥ 0، ② احتمال الفضاء الكامل = 1، ③ احتمال اتحاد أحداث متنافية = مجموع احتمالاتها. هذه المسلمات البسيطة تنتج كل قوانين الاحتمال." },
        { type: "code", language: "python", content: `import numpy as np

# محاكاة: رمي نرد 6 أوجه
n_rolls = 100000
rolls = np.random.randint(1, 7, n_rolls)

# الاحتمال التجريبي
for face in range(1, 7):
    prob = np.mean(rolls == face)
    print(f"P({face}) = {prob:.4f} (النظري: {1/6:.4f})")

# مسلمات الاحتمال:
# 1. كل احتمال ≥ 0 — واضح
# 2. مجموع كل الاحتمالات = 1
probs = [np.mean(rolls == f) for f in range(1, 7)]
print(f"\\nمجموع الاحتمالات: {sum(probs):.4f} (يجب أن يساوي 1)")

# 3. أحداث متنافية: P(1 أو 2) = P(1) + P(2)
p_1_or_2 = np.mean((rolls == 1) | (rolls == 2))
p_1_plus_p_2 = np.mean(rolls == 1) + np.mean(rolls == 2)
print(f"P(1∪2) = {p_1_or_2:.4f} | P(1)+P(2) = {p_1_plus_p_2:.4f}")
print(f"متطابقان؟ {np.isclose(p_1_or_2, p_1_plus_p_2)}")` },

        { type: "h2", content: "2. الاحتمال الشرطي وقاعدة بايز" },
        { type: "p", content: "الاحتمال الشرطي P(A|B) هو 'ما احتمال A إذا علمنا أن B حدث؟'. قاعدة بايز: P(A|B) = P(B|A) × P(A) / P(B). هذه المعادلة البسيطة هي أساس: تصنيف البريد المزعج (Naive Bayes)، التشخيص الطبي، تحديث المعتقدات، والاستدلال البايزي في AI. بايز يُحدث التقدير مع كل معلومة جديدة." },
        { type: "mermaid", content: "graph LR\n  PRIOR[\"الاعتقاد المسبق P(H)\"] --> BAYES[\"قاعدة بايز\"]\n  EVIDENCE[\"الدليل P(E|H)\"] --> BAYES\n  BAYES --> POSTERIOR[\"الاعتقاد المُحدث P(H|E)\"]\n  style PRIOR fill:#e3f2fd\n  style EVIDENCE fill:#fff9c4\n  style BAYES fill:#ffcdd2\n  style POSTERIOR fill:#c8e6c9", caption: "بايز: نبدأ باعتقاد، نضيف دليلاً، نُحدّث الاعتقاد" },
        { type: "code", language: "python", content: `# Bayes Theorem — تطبيق عملي
# سيناريو: اختبار طبي
# P(D) = 0.01 — نسبة المرض في المجتمع (1%)
# P(+|D) = 0.95 — حساسية الاختبار (95%)
# P(+|¬D) = 0.05 — نسبة الخطأ الإيجابي (5%)

P_D = 0.01
P_pos_given_D = 0.95
P_pos_given_notD = 0.05
P_notD = 1 - P_D

# إذا كان الاختبار إيجابياً، ما احتمال أن يكون المريض مريضاً فعلاً؟
# P(D|+) = P(+|D) * P(D) / P(+)
# P(+) = P(+|D)*P(D) + P(+|¬D)*P(¬D)
P_pos = P_pos_given_D * P_D + P_pos_given_notD * P_notD
P_D_given_pos = (P_pos_given_D * P_D) / P_pos

print("═" * 55)
print("Bayes Theorem — التشخيص الطبي")
print("═" * 55)
print(f"نسبة المرض في المجتمع:    {P_D:.1%}")
print(f"حساسية الاختبار:           {P_pos_given_D:.1%}")
print(f"نسبة الخطأ الإيجابي:       {P_pos_given_notD:.1%}")
print(f"─" * 55)
print(f"احتمال النتيجة الإيجابية:  {P_pos:.3f}")
print(f"احتمال المرض | إيجابي:    {P_D_given_pos:.1%}")
print(f"═" * 55)
print(f"\\n💡 رغم أن الاختبار دقيق بنسبة 95%،")
print(f"   احتمال أن يكون المريض مريضاً فعلاً")
print(f"   بعد نتيجة إيجابية هو فقط {P_D_given_pos:.0%}!")
print(f"   بسبب ندرة المرض في المجتمع.")

# تطبيق AI: Naive Bayes Classifier
# P(spam|words) ∝ P(words|spam) × P(spam)
# هذا هو أساس تصنيف البريد المزعج!` },

        { type: "h2", content: "3. التوزيعات الاحتمالية — أشكال عدم اليقين" },
        { type: "p", content: "التوزيع الطبيعي (Gaussian) هو أهم توزيع في AI: معظم الظواهر الطبيعية تتبع هذا الشكل الجرسي، وأخطاء النماذج توزع طبيعياً، وأوزان الشبكات العصبية تُهيأ عشوائياً من توزيع طبيعي. توزيع برنولي (نجاح/فشل) أساس التصنيف الثنائي. توزيع كاتيجوريكال أساس التصنيف المتعدد (Softmax ينتج توزيعاً كاتيجوريكالياً)." },
        { type: "code", language: "python", content: `import numpy as np

# التوزيع الطبيعي — أهم توزيع في AI
mu, sigma = 0, 1  # متوسط، انحراف معياري
samples = np.random.normal(mu, sigma, 10000)

print("التوزيع الطبيعي (Gaussian):")
print(f"  المتوسط: {np.mean(samples):.3f} (النظري: {mu})")
print(f"  الانحراف المعياري: {np.std(samples):.3f} (النظري: {sigma})")
print(f"  ضمن σ1 (±1σ):  {np.mean(np.abs(samples) < 1):.1%} (النظري: 68.3%)")
print(f"  ضمن σ2 (±2σ):  {np.mean(np.abs(samples) < 2):.1%} (النظري: 95.5%)")
print(f"  ضمن σ3 (±3σ):  {np.mean(np.abs(samples) < 3):.1%} (النظري: 99.7%)")

# في AI:
# - تهيئة أوزان الشبكات: nn.init.normal_(tensor, mean=0, std=0.02)
# - Batch Normalization: توزيع البيانات توزيعاً طبيعياً (μ=0, σ=1)
# - KL Divergence: يقيس الفرق بين توزيعين

# محاكاة مخرج Softmax (توزيع كاتيجوريكالي)
def softmax(x):
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum()

logits = np.array([2.0, 1.0, 0.1, -1.0])
probs = softmax(logits)
print(f"\\nSoftmax — توزيع كاتيجوريكالي:")
for i, p in enumerate(probs):
    bar = "█" * int(p * 50)
    print(f"  الفئة {i}: {p:.3f} {bar}")
print(f"  المجموع: {probs.sum():.3f}")` },

        { type: "h2", content: "4. الانتروبيا — مقياس المفاجأة" },
        { type: "p", content: "الانتروبيا (Entropy) تقيس 'عدم اليقين' في توزيع احتمالي. توزيع موحد (كل الاحتمالات متساوية) = انتروبيا عالية (عدم يقين كبير). توزيع حاد (احتمال واحد ≈ 1) = انتروبيا منخفضة (شبه متأكد). Cross-Entropy Loss هي أهم دالة خسارة في التصنيف — تقيس 'المسافة' بين توزيع النموذج والتوزيع الحقيقي." },
        { type: "code", language: "python", content: `# الانتروبيا و Cross-Entropy
import numpy as np

def entropy(p):
    """Entropy: -Σ p(x) log₂ p(x)"""
    p = np.asarray(p)
    # نتجنب log(0)
    p = p[p > 0]
    return -np.sum(p * np.log2(p))

def cross_entropy(p_true, p_pred):
    """Cross-Entropy: -Σ p_true(x) log p_pred(x)"""
    return -np.sum(p_true * np.log(p_pred + 1e-10))

# توزيع موحد — أقصى انتروبيا
uniform = np.array([0.25, 0.25, 0.25, 0.25])
print(f"توزيع موحد: {uniform}")
print(f"  انتروبيا: {entropy(uniform):.3f} بت (أقصى عدم يقين)")

# توزيع شبه مؤكد — انتروبيا منخفضة
certain = np.array([0.97, 0.01, 0.01, 0.01])
print(f"\\nتوزيع شبه مؤكد: {certain}")
print(f"  انتروبيا: {entropy(certain):.3f} بت (شبه متأكد)")

# Cross-Entropy Loss — أهم loss في التصنيف
# تنبؤ النموذج vs الحقيقة
pred_good = np.array([0.85, 0.05, 0.05, 0.05])  # تنبؤ جيد
pred_bad = np.array([0.25, 0.25, 0.25, 0.25])    # تنبؤ سيئ
true = np.array([1.0, 0.0, 0.0, 0.0])             # الحقيقة: الفئة 0

ce_good = cross_entropy(true, pred_good)
ce_bad = cross_entropy(true, pred_bad)
print(f"\\nCross-Entropy Loss:")
print(f"  تنبؤ جيد:  {ce_good:.4f}")
print(f"  تنبؤ سيئ:  {ce_bad:.4f}")
print(f"  CrossEntropyLoss في PyTorch = نفس هذه العملية!")` },

        { type: "active-recall", questions: [
          { q: "ما هي قاعدة بايز؟ أعط مثالاً تطبيقياً من AI.", a: "P(A|B) = P(B|A)P(A)/P(B). في Naive Bayes لتصنيف البريد: P(spam|words) ∝ P(words|spam)P(spam). نحسب احتمال أن الرسالة مزعجة بناءً على كلماتها. في التشخيص: نحسب احتمال المرض بعد نتيجة اختبار. بايز = تحديث الاعتقاد بالدليل." },
          { q: "ما هو Cross-Entropy Loss؟ ولماذا هو أهم loss في AI؟", a: "Cross-Entropy يقيس 'المسافة' بين توزيعين احتماليين: الحقيقي والمتوقع. Loss = -Σ y_true·log(y_pred). كلما كان التنبؤ أقرب للحقيقة، قل الـ loss. يُستخدم في كل مشاكل التصنيف (صورة، نص، صوت) وهو دالة الخسارة الافتراضية في PyTorch لـ Classification." },
          { q: "ماذا تعني الانتروبيا العالية والمنخفضة؟", a: "انتروبيا عالية = عدم يقين كبير (كل الاحتمالات متساوية). انتروبيا منخفضة = ثقة عالية (احتمال واحد ≈ 1). النموذج الجيد يقلل الانتروبيا تدريجياً أثناء التدريب — ينتقل من 'لا أدري' إلى 'متأكد' (بشكل صحيح)." }
        ]}
      ]
    },
    // ═══════════════════════════════════════════════════════════
    // UNIT 6: Statistics
    // ═══════════════════════════════════════════════════════════
    {
      id: "unit-ai-6",
      stageId: "stage-1",
      unitNumber: 6,
      title: "الإحصاء — من العينة إلى المجتمع",
      description: "التوزيعات، أقصى تقدير احتمالي (MLE)، نظرية الحد المركزي، اختبار الفرضيات — تقييم النماذج.",
      difficulty: 3,
      prerequisites: ["unit-ai-5"],
      estimatedHours: 4,
      tags: ["statistics", "mle", "hypothesis-testing"],
      content: [
        { type: "h1", content: "الوحدة 6: الإحصاء — من العينة إلى المجتمع" },
        { type: "p", content: "النموذج الذي تدربه ليس الحقيقة — إنه تقدير مبني على عينة محدودة من البيانات. الإحصاء هو العلم الذي يخبرك: 'ما مدى ثقتك في هذا التقدير؟' و 'هل الفرق بين نموذجين حقيقي أم مجرد صدفة؟'. بدون إحصاء، تقييم النموذج مجرد تخمين. بالإحصاء، هو علم دقيق." },
        { type: "p", content: "في AI، الإحصاء هو أساس: تقييم النماذج (هل accuracy 95% كافية؟)، اختبار A/B (هل النموذج الجديد أفضل فعلاً؟)، cross-validation، معايرة الثقة، واكتشاف انزياح البيانات (Data Drift)." },

        { type: "h2", content: "1. الإحصاء الوصفي — لخص بياناتك" },
        { type: "code", language: "python", content: `import numpy as np

# بيانات افتراضية: درجات 1000 طالب
np.random.seed(42)
scores = np.concatenate([
    np.random.normal(75, 8, 700),   # معظم الطلاب
    np.random.normal(45, 10, 300),  # مجموعة متعثرة
])

print("═" * 40)
print("إحصاء وصفي")
print("═" * 40)
print(f"العدد (n):         {len(scores)}")
print(f"المتوسط (mean):    {np.mean(scores):.2f}")
print(f"الوسيط (median):   {np.median(scores):.2f}")
print(f"الانحراف المعياري:  {np.std(scores, ddof=1):.2f}")
print(f"الربع الأول (Q1):   {np.percentile(scores, 25):.2f}")
print(f"الربع الثالث (Q3):  {np.percentile(scores, 75):.2f}")
print(f"المدى الربيعي (IQR): {np.percentile(scores, 75) - np.percentile(scores, 25):.2f}")
print(f"الحد الأدنى:        {np.min(scores):.2f}")
print(f"الحد الأقصى:        {np.max(scores):.2f}")
print(f"الانحراف (Skewness): تحقق من عدم التماثل")

# المتوسط vs الوسيط: إذا كانا مختلفين كثيراً = توزيع ملتوٍ
print(f"\\nالمتوسط - الوسيط = {np.mean(scores) - np.median(scores):.2f}")
if abs(np.mean(scores) - np.median(scores)) > 2:
    print("⚠️ التوزيع ملتوٍ — استخدم الوسيط كمقياس للنزعة المركزية")` },

        { type: "h2", content: "2. نظرية الحد المركزي — معجزة الإحصاء" },
        { type: "p", content: "نظرية الحد المركزي (CLT) هي أهم نظرية في الإحصاء: إذا أخذت عينات عشوائية متكررة من أي توزيع (حتى غير طبيعي!) وحسبت متوسط كل عينة، فإن توزيع هذه المتوسطات يقترب من التوزيع الطبيعي كلما زاد حجم العينة. هذا يسمح لنا بعمل استدلالات إحصائية دون معرفة التوزيع الأصلي." },
        { type: "code", language: "python", content: `# نظرية الحد المركزي — تجربة عملية
import numpy as np

# توزيع غير طبيعي إطلاقاً: توزيع أسي
population = np.random.exponential(scale=5, size=100000)
print("المجتمع: توزيع أسي (غير طبيعي تماماً)")
print(f"  متوسط المجتمع: {np.mean(population):.2f}")

# نأخذ عينات متكررة ونحسب متوسطاتها
n_samples = 1000
sample_size = 30
sample_means = []

for _ in range(n_samples):
    sample = np.random.choice(population, size=sample_size)
    sample_means.append(np.mean(sample))

sample_means = np.array(sample_means)
print(f"\\nتوزيع متوسطات {n_samples} عينة (حجم كل عينة={sample_size}):")
print(f"  متوسط المتوسطات: {np.mean(sample_means):.2f}")
print(f"  (قريب جداً من متوسط المجتمع: {np.mean(population):.2f})")
print(f"  الانحراف المعياري للمتوسطات: {np.std(sample_means, ddof=1):.3f}")
print(f"  (النظري: σ/√n = {np.std(population)/np.sqrt(sample_size):.3f})")
print(f"\\n💡 رغم أن التوزيع الأصلي ملتوٍ جداً،")
print(f"   توزيع المتوسطات ≈ توزيع طبيعي!")
print(f"   هذه هي معجزة CLT.")` },

        { type: "h2", content: "3. أقصى تقدير احتمالي (MLE)" },
        { type: "p", content: "MLE (Maximum Likelihood Estimation) هو حجر الزاوية في تدريب النماذج: 'ما المعاملات التي تجعل البيانات التي رأيناها أكثر احتمالاً؟'. معظم دوال الخسارة في AI مشتقة من MLE: MSE للانحدار = MLE بافتراض أخطاء طبيعية. Cross-Entropy للتصنيف = MLE للتوزيع الكاتيجوريكالي." },
        { type: "code", language: "python", content: `# MLE بسيط: تقدير متوسط التوزيع الطبيعي
import numpy as np

# بيانات حقيقية (لا نعرف متوسطها)
true_mu = 7.5
data = np.random.normal(true_mu, 2.0, 100)

# MLE: القيمة التي تجعل البيانات أكثر احتمالاً
# للتوزيع الطبيعي: MLE = متوسط البيانات!
mle_mu = np.mean(data)
print(f"المتوسط الحقيقي: {true_mu}")
print(f"تقدير MLE:      {mle_mu:.3f}")
print(f"الفرق:          {abs(true_mu - mle_mu):.4f}")

# لماذا نستخدم MLE؟
# لأنه ينتج تقديرات متسقة (تقترب من الحقيقة مع زيادة البيانات)
# وفعالة (أقل تباين ممكن)

# في AI:
# - Linear Regression: weights = argmin MSE = MLE بافتراض أخطاء طبيعية
# - Logistic Regression: weights = argmin Cross-Entropy = MLE بافتراض Bernoulli
# - كل تدريب = MLE (أو MAP مع regularization)!` },

        { type: "h2", content: "4. اختبار الفرضيات و p-value" },
        { type: "p", content: "هل الفرق بين نموذجين حقيقي أم صدفة؟ اختبار الفرضيات يجيب. H₀ (فرضية العدم): 'لا فرق'. p-value: 'لو H₀ صحيحة، ما احتمال رؤية نتيجة متطرفة كهذه؟'. p < 0.05 = 'الفرق على الأرجح حقيقي'. في AI: اختبار A/B لنماذج مختلفة، مقارنة أداء نماذج، التحقق من تحسن حقيقي." },
        { type: "code", language: "python", content: `from scipy import stats
import numpy as np

# سيناريو: نموذجان A و B، هل B أفضل فعلاً؟
np.random.seed(42)
model_A_scores = np.random.normal(0.85, 0.03, 100)  # دقة A
model_B_scores = np.random.normal(0.87, 0.03, 100)  # دقة B (أعلى قليلاً)

print("═" * 50)
print("اختبار T: هل النموذج B أفضل من A؟")
print("═" * 50)
print(f"متوسط دقة A: {np.mean(model_A_scores):.4f}")
print(f"متوسط دقة B: {np.mean(model_B_scores):.4f}")
print(f"الفرق: {np.mean(model_B_scores) - np.mean(model_A_scores):.4f}")

# H₀: متوسط A = متوسط B (لا فرق)
# H₁: متوسط B > متوسط A (B أفضل)
t_stat, p_value = stats.ttest_ind(model_B_scores, model_A_scores, alternative='greater')
print(f"\\nإحصائية T: {t_stat:.4f}")
print(f"p-value:    {p_value:.6f}")

if p_value < 0.05:
    print(f"\\n✅ p < 0.05 → نرفض H₀ — النموذج B أفضل بشكل دال إحصائياً!")
else:
    print(f"\\n❌ p ≥ 0.05 → لا نستطيع رفض H₀ — الفرق قد يكون صدفة")

print(f"\\n💡 في AI: دائماً اختبر تحسناتك إحصائياً!")
print(f"   تحسن 0.02 قد يكون صدفة بسبب عشوائية البيانات.")` },

        { type: "active-recall", questions: [
          { q: "ما هي نظرية الحد المركزي (CLT)؟ ولماذا هي مهمة؟", a: "CLT: توزيع متوسطات العينات يقترب من التوزيع الطبيعي كلما زاد حجم العينة، بغض النظر عن شكل التوزيع الأصلي. أهميتها: تسمح بعمل استدلالات إحصائية (فترات ثقة، اختبارات) دون معرفة التوزيع الحقيقي للبيانات. هذا أساس cross-validation وفترات الثقة في تقييم النماذج." },
          { q: "ما هو MLE؟ وكيف يرتبط بتدريب النماذج؟", a: "MLE = البحث عن معاملات تجعل البيانات المرصودة 'أكثر احتمالاً'. في الانحدار: تقليل MSE = MLE بافتراض أخطاء طبيعية. في التصنيف: تقليل Cross-Entropy = MLE. مع L2 Regularization = MAP (Maximum a Posteriori). كل تدريب شبكة عصبية هو شكل من MLE/MAP." },
          { q: "متى تستخدم اختبار الفرضيات في AI؟", a: "① مقارنة نموذجين: هل دقة B > A بشكل دال إحصائياً؟ ② اختبار A/B: هل التغيير في المنتج حسن النتائج فعلاً؟ ③ تحليل الأخطاء: هل النموذج متحيز لفئة معينة؟ ④ الكشف عن Data Drift: هل توزيع البيانات في الإنتاج مختلف عن التدريب؟" }
        ]}
      ]
    },
    // ═══════════════════════════════════════════════════════════
    // UNIT 7: Calculus Intuition
    // ═══════════════════════════════════════════════════════════
    {
      id: "unit-ai-7",
      stageId: "stage-1",
      unitNumber: 7,
      title: "التفاضل — حدس قبل الرموز",
      description: "المشتقات، التدرجات، قاعدة السلسلة، فضاء التحسين — كيف يتعلم النموذج.",
      difficulty: 3,
      prerequisites: ["unit-ai-1"],
      estimatedHours: 4,
      tags: ["calculus", "gradients", "optimization", "backpropagation"],
      content: [
        { type: "h1", content: "الوحدة 7: التفاضل — حدس قبل الرموز" },
        { type: "p", content: "كيف يتعلم النموذج؟ الإجابة في كلمة واحدة: المشتقة (Derivative). المشتقة تخبرك: 'إذا غيرت هذا المعامل قليلاً، كيف يتغير الخطأ؟'. هذه المعلومة البسيطة هي كل ما يحتاجه Gradient Descent لتحسين النموذج. و Backpropagation ليست سوى تطبيق ذكي لقاعدة السلسلة (Chain Rule) لحساب مشتقات كل معامل في شبكة قد تحتوي مليارات المعاملات." },
        { type: "p", content: "هذه الوحدة تبني حدساً عميقاً: سنفهم ما تعنيه المشتقة بصرياً قبل أن نتعامل مع رموزها. لأنك كمهندس AI، تحتاج أن 'ترى' فضاء التحسين في عقلك — الجبال والوديان التي يتسلقها Gradient Descent." },

        { type: "h2", content: "1. ما هي المشتقة؟ — slope = معدل التغير" },
        { type: "p", content: "المشتقة f'(x) هي ميل المنحنى عند النقطة x — أو 'سرعة تغير' f بالنسبة لـ x. إذا كانت المشتقة موجبة: f تزيد. سالبة: f تنقص. صفر: قمة أو قاع (نقطة حرجة). في التدريب: المشتقة الموجبة تعني 'أنقص المعامل'، السالبة تعني 'زد المعامل' — هذا هو Gradient Descent." },
        { type: "mermaid", content: "graph TD\n  X[\"المدخل x\"] --> F[\"الدالة f(x)\"]\n  F --> Y[\"المخرج y\"]\n  F -.-> D[\"المشتقة f'(x)\"]\n  D --> INFO[\"ميل المنحنى = اتجاه وسرعة التغير\"]\n  style X fill:#e3f2fd\n  style Y fill:#c8e6c9\n  style D fill:#ffcdd2\n  style INFO fill:#fff9c4", caption: "المشتقة = البوصلة التي توجه التدريب" },
        { type: "code", language: "python", content: `# المشتقة — من التعريف إلى التطبيق
import numpy as np

def derivative_approx(f, x, h=1e-6):
    """حساب تقريبي للمشتقة: (f(x+h) - f(x)) / h"""
    return (f(x + h) - f(x)) / h

# اختبار: f(x) = x²
f = lambda x: x ** 2
x_vals = [-2, -1, 0, 1, 2, 3]

print("f(x) = x²")
print(f"{'x':>6} | {'f(x)':>8} | {'f\'(x) تقريبي':>12} | {'f\'(x)=2x نظري':>12}")
print("-" * 48)
for x in x_vals:
    approx = derivative_approx(f, x)
    exact = 2 * x
    print(f"{x:6.1f} | {f(x):8.1f} | {approx:12.4f} | {exact:12.1f}")

# معنى المشتقة:
# f'(x) > 0: الدالة تصعد — لو زدت x قليلاً، f تزيد
# f'(x) < 0: الدالة تنزل — لو زدت x قليلاً، f تنقص
# f'(x) = 0: قمة أو قاع — لحظة توقف التغير

print(f"\\nعند x=3: المشتقة = 6 (موجبة) → الدالة تصعد")
print(f"عند x=-2: المشتقة = -4 (سالبة) → الدالة تنزل")
print(f"عند x=0: المشتقة = 0 (صفر) → قاع المنحنى")` },

        { type: "h2", content: "2. Gradient Descent — تسلق الجبل بالاتجاه المعاكس" },
        { type: "p", content: "Gradient Descent هو الخوارزمية التي تدرب كل نموذج AI: ① احسب المشتقة (الاتجاه). ② تحرك بعكس اتجاه المشتقة (لأننا نريد القاع، وليس القمة). ③ كرر. حجم الخطوة (Learning Rate) يحدد سرعة التعلم: صغير جداً = تدريب بطيء. كبير جداً = تجاوز الحل أو تشتت." },
        { type: "code", language: "python", content: `# Gradient Descent — يدوياً خطوة بخطوة
import numpy as np

# مشكلة: إيجاد minimum الدالة f(x) = (x-3)² + 2
# (القاع عند x=3، القيمة الدنيا = 2)
def f(x): return (x - 3)**2 + 2
def df(x): return 2 * (x - 3)  # المشتقة

# Gradient Descent
x = 15.0  # نبدأ بعيداً عن الحل
lr = 0.1  # Learning Rate
history = [(0, x, f(x))]

print("═" * 55)
print("Gradient Descent: البحث عن minimum f(x) = (x-3)² + 2")
print("═" * 55)
print(f"{'خطوة':>5} | {'x':>10} | {'f(x)':>10} | {'المشتقة':>10} | {'Δx':>10}")
print("-" * 55)

for step in range(1, 21):
    grad = df(x)
    delta = -lr * grad  # تحرك بعكس المشتقة
    x_new = x + delta
    history.append((step, x_new, f(x_new)))
    if step <= 10 or step % 5 == 0:
        print(f"{step:5d} | {x:10.4f} | {f(x):10.4f} | {grad:10.4f} | {delta:10.4f}")
    if abs(grad) < 1e-6:
        print(f"\\n✓ تقارب بعد {step} خطوات!")
        break
    x = x_new

print(f"\\nالحل التقريبي: x = {x:.6f}, f(x) = {f(x):.6f}")
print(f"الحل الدقيق:   x = 3.0, f(3) = 2.0")
print(f"الخطأ: |x-3| = {abs(x-3):.6f}")

# ⭐ هذا هو بالضبط ما تفعله PyTorch عند استدعاء optimizer.step()!
# optimizer.zero_grad() ← تصفير التدرجات
# loss.backward()     ← حساب المشتقات لكل معامل
# optimizer.step()    ← تحديث المعاملات: θ = θ - lr * ∇loss` },

        { type: "h2", content: "3. قاعدة السلسلة — مفتاح Backpropagation" },
        { type: "p", content: "قاعدة السلسلة (Chain Rule): إذا كانت y = f(g(x))، فإن dy/dx = f'(g(x)) × g'(x). هذا يبدو بسيطاً لكنه سر Backpropagation: بدلاً من حساب مشتقة الشبكة كلها دفعة واحدة (مستحيل!)، نحسب المشتقات طبقة بطبقة ونضربها. هذا ما يجعل تدريب شبكات بمليارات المعاملات ممكناً." },
        { type: "mermaid", content: "graph LR\n  X[\"المدخل x\"] --> G[\"طبقة 1: g(x)\"]\n  G --> F[\"طبقة 2: f(g)\"]\n  F --> L[\"Loss: L = f(g(x))\"]\n  subgraph \"Backpropagation\"\n    BP[\"dL/dx = f'(g) × g'(x)\"]\n  end\n  L -.-> BP\n  style X fill:#e3f2fd\n  style G fill:#fff9c4\n  style F fill:#fff9c4\n  style L fill:#ffcdd2\n  style BP fill:#c8e6c9", caption: "Chain Rule: المشتقة الكلية = حاصل جداء المشتقات الجزئية" },
        { type: "code", language: "python", content: `# Chain Rule — Backpropagation يدوياً
import numpy as np

# شبكة بسيطة: input → linear → sigmoid → loss
def linear(x, w, b): return w * x + b
def sigmoid(x): return 1 / (1 + np.exp(-x))
def mse_loss(y_pred, y_true): return (y_pred - y_true) ** 2

# مشتقات كل دالة
def d_linear_dw(x): return x      # ∂(wx+b)/∂w = x
def d_linear_db(): return 1.0      # ∂(wx+b)/∂b = 1
def d_sigmoid(s): return s * (1 - s)  # ∂σ/∂x = σ(1-σ)
def d_mse(y_pred, y_true): return 2 * (y_pred - y_true)

# Chain Rule في العمل!
w, b = 2.0, -1.0  # معاملات النموذج
x, y_true = 1.5, 0.8  # بيانات

# Forward pass
z = linear(x, w, b)    # z = wx + b
y_pred = sigmoid(z)     # y_pred = σ(z)
loss = mse_loss(y_pred, y_true)

# Backward pass (Chain Rule!)
dL_dy = d_mse(y_pred, y_true)        # ∂L/∂y_pred
dy_dz = d_sigmoid(y_pred)             # ∂y_pred/∂z
dL_dz = dL_dy * dy_dz                  # ∂L/∂z = ∂L/∂y_pred × ∂y_pred/∂z
dL_dw = dL_dz * d_linear_dw(x)        # ∂L/∂w = ∂L/∂z × ∂z/∂w
dL_db = dL_dz * d_linear_db()         # ∂L/∂b = ∂L/∂z × ∂z/∂b

print("Chain Rule — Backpropagation يدوياً")
print(f"  loss = {loss:.6f}")
print(f"  ∂L/∂w = {dL_dw:.6f}")
print(f"  ∂L/∂b = {dL_db:.6f}")
print(f"\\n  الخطوة التالية: w = w - lr × ∂L/∂w")
print(f"                     b = b - lr × ∂L/∂b")
print(f"\\n💡 هذا هو loss.backward() في PyTorch!")
print(f"   ثم optimizer.step() لتحديث المعاملات.")` },

        { type: "h2", content: "4. التدرج — مشتقة متعددة الأبعاد" },
        { type: "p", content: "في AI الحقيقي، النموذج ليس له معامل واحد بل ملايين. التدرج (Gradient) ∇f هو متجه يحتوي مشتقات f بالنسبة لكل معامل. اتجاه التدرج = أسرع اتجاه صعود. Gradient Descent يتحرك بعكس التدرج للوصول للقاع. كل optimizer.step() في PyTorch يحسب التدرج ويطبق الخطوة." },
        { type: "code", language: "python", content: `# التدرج — Gradient في فضاء متعدد الأبعاد
import numpy as np

# دالة ثنائية: f(w₁, w₂) = w₁² + w₂² + 3
# (القاع عند (0,0)، القيمة الدنيا = 3)
def f(w): return w[0]**2 + w[1]**2 + 3
def grad_f(w): return np.array([2*w[0], 2*w[1]])  # ∇f

# Gradient Descent — ثنائي الأبعاد
w = np.array([8.0, 6.0])  # نبدأ بعيداً
lr = 0.1

print("Gradient Descent في ℝ²")
print(f"  البداية: w = {w}, f(w) = {f(w):.1f}")

for step in range(1, 31):
    grad = grad_f(w)
    w = w - lr * grad  # تحرك بعكس التدرج
    if step % 10 == 0 or step == 1:
        print(f"  خطوة {step:2d}: w = [{w[0]:6.3f}, {w[1]:6.3f}], f(w) = {f(w):.4f}")
    if np.linalg.norm(grad) < 1e-6:
        break

print(f"\\n  النهائي:   w = [{w[0]:.6f}, {w[1]:.6f}], f(w) = {f(w):.6f}")
print(f"  الحل الدقيق: w = [0, 0], f(w) = 3.0")
print(f"\\n💡 في PyTorch: model.parameters() = [w₁, w₂, ..., wₙ]")
print(f"   loss.backward() يحسب ∂L/∂wᵢ لكل معامل.")
print(f"   optimizer.step() يطبق wᵢ = wᵢ - lr × ∂L/∂wᵢ")` },

        { type: "h2", content: "5. فضاء التحسين — المشهد الذي يراه Gradient Descent" },
        { type: "p", content: "تخيل سطحاً جبلياً: طوله وعرضه معاملات النموذج، وارتفاعه قيمة الـ Loss. Gradient Descent كمتسلق جبال يريد الوصول لأخفض نقطة — لكنه أعمى! لا يرى إلا ميل الأرض تحت قدميه (التدرج). التحديات: مضايق ضيقة (معاملات بمقاييس مختلفة)، هضاب (نقاط سرج)، ووديان متعرجة. Optimizers الحديثة (Adam, SGD+Momentum) هي 'أدوات ملاحة' متطورة لهذا المتسلق." },
        { type: "code", language: "python", content: `# فضاء التحسين — لماذا نحتاج Optimizers متطورة؟
import numpy as np

# دالة Rosenbrock — مشهورة بصعوبة تحسينها (وادي ضيق معوج)
def rosenbrock(w):
    x, y = w[0], w[1]
    return (1 - x)**2 + 100 * (y - x**2)**2

def grad_rosenbrock(w):
    x, y = w[0], w[1]
    dx = -2*(1 - x) - 400*x*(y - x**2)
    dy = 200*(y - x**2)
    return np.array([dx, dy])

# مقارنة: SGD بسيط vs SGD مع Momentum
w_sgd = np.array([-1.0, 1.0])
w_mom = np.array([-1.0, 1.0])
lr = 0.001
beta = 0.9
velocity = np.zeros(2)

# SGD بسيط
path_sgd = [w_sgd.copy()]
for _ in range(2000):
    w_sgd = w_sgd - lr * grad_rosenbrock(w_sgd)
    path_sgd.append(w_sgd.copy())

# SGD + Momentum
path_mom = [w_mom.copy()]
for _ in range(2000):
    g = grad_rosenbrock(w_mom)
    velocity = beta * velocity - lr * g
    w_mom = w_mom + velocity
    path_mom.append(w_mom.copy())

print("مقارنة: SGD vs SGD+Momentum على Rosenbrock")
print(f"  الهدف: w = [1, 1], f(w) = 0")
print(f"  SGD:          w = [{w_sgd[0]:.4f}, {w_sgd[1]:.4f}], f = {rosenbrock(w_sgd):.6f}")
print(f"  SGD+Momentum: w = [{w_mom[0]:.4f}, {w_mom[1]:.4f}], f = {rosenbrock(w_mom):.6f}")
print(f"\\n💡 Momentum أسرع لأن لديه 'ذاكرة' — يستمر في نفس الاتجاه")
print(f"   Adam أفضل: يجمع Momentum + تكييف learning rate لكل معامل.")
print(f"   هذه أدوات 'ملاحة' Gradient Descent في فضاء التحسين الوعر.")` },

        { type: "callout", calloutType: "ai-tip", title: "افهم Backpropagation = افهم كيف يتعلم كل نموذج", content: [
          { type: "p", content: "جرب: «اشرح لي Backpropagation كأنني أفهم Chain Rule لكني لم أدرس Deep Learning. اشرح لي: كيف تمر المشتقة عبر طبقات الشبكة؟ لماذا نضرب المشتقات ولا نجمعها؟ ارسم لي ممر forward و backward على شبكة بسيطة من 3 طبقات. ثم اشرح لي لماذا اختفاء التدرج (Vanishing Gradient) مشكلة في الشبكات العميقة وكيف يحلها ReLU و BatchNorm.»" }
        ]},

        { type: "project", title: "بناء Optimizer من الصفر", content: [
          { type: "p", content: "لنبني Mini-Optimizer يطبق كل ما تعلمناه: Gradient Descent، Momentum، و Adam مصغر." },
          { type: "code", language: "python", content: `class MiniOptimizer:
    """محاكي PyTorch optimizer — يفهم Gradient Descent"""
    
    @staticmethod
    def sgd(param, grad, lr=0.01):
        """SGD بسيط: param -= lr * grad"""
        return param - lr * grad
    
    @staticmethod
    def sgd_momentum(param, grad, velocity, lr=0.01, momentum=0.9):
        """SGD + Momentum"""
        velocity = momentum * velocity - lr * grad
        return param + velocity, velocity
    
    @staticmethod
    def adam(param, grad, m, v, t, lr=0.001, beta1=0.9, beta2=0.999, eps=1e-8):
        """Adam مصغر — أشهر optimizer في AI"""
        m = beta1 * m + (1 - beta1) * grad
        v = beta2 * v + (1 - beta2) * (grad ** 2)
        m_hat = m / (1 - beta1 ** t)
        v_hat = v / (1 - beta2 ** t)
        return param - lr * m_hat / (np.sqrt(v_hat) + eps), m, v

# اختبار: العثور على minimum دالة بسيطة
f = lambda x: (x - 5) ** 2 + 3
df = lambda x: 2 * (x - 5)

# SGD
x_sgd = 20.0
for _ in range(50): x_sgd = MiniOptimizer.sgd(x_sgd, df(x_sgd), lr=0.1)

# Adam
x_adam, m, v = 20.0, 0.0, 0.0
for t in range(1, 51):
    x_adam, m, v = MiniOptimizer.adam(x_adam, df(x_adam), m, v, t, lr=0.1)

print(f"SGD:  x = {x_sgd:.6f} (الحل: 5.0)")
print(f"Adam: x = {x_adam:.6f} (الحل: 5.0)")
print(f"\\n💡 في PyTorch: optimizer = torch.optim.Adam(model.parameters(), lr=0.001)")
print(f"   ثم loss.backward() ← optimizer.step() ← يحسب ويطبق كل هذا تلقائياً!")` }
        ]},

        { type: "active-recall", questions: [
          { q: "ما هي المشتقة؟ وكيف تستخدم في Gradient Descent؟", a: "المشتقة f'(x) = ميل المنحنى عند x = معدل تغير f بالنسبة لـ x. في GD: إذا كانت المشتقة موجبة (الدالة تصعد)، نتحرك يساراً (ننقص x). إذا سالبة، نتحرك يميناً (نزيد x). x_new = x - lr × f'(x). هذا التحديث البسيط يكرر حتى نصل لأدنى نقطة." },
          { q: "اشرح Chain Rule وعلاقتها بـ Backpropagation.", a: "Chain Rule: dy/dx = dy/du × du/dx — المشتقة الكلية = جداء المشتقات الجزئية. في Backpropagation: بدل حساب مشتقة شبكة كاملة دفعة واحدة، نحسب مشتق كل طبقة على حدة، ثم نضربهم من النهاية للبداية. loss.backward() يطبق Chain Rule آلياً عبر الـ Computation Graph." },
          { q: "ما هو التدرج (Gradient)؟ وكيف يختلف عن المشتقة العادية؟", a: "المشتقة: لدالة ذات متغير واحد (f'(x) رقم واحد). التدرج: لدالة متعددة المتغيرات (∇f متجه من n مشتقة جزئية). في الشبكات العصبية، model.parameters() ملايين المعاملات — التدرج متجه بنفس الحجم. Gradient Descent: w = w - lr × ∇L(w) — نطرح متجه التدرج كاملاً." },
          { q: "لماذا نحتاج Adam بدل SGD البسيط؟", a: "① Adam يكيّف learning rate لكل معامل على حدة (معاملات بمقاييس مختلفة تحتاج خطوات مختلفة). ② Momentum: يستمر في الاتجاهات الناجحة ويتجاهل التذبذبات. ③ Bias correction: يصحح تقديرات اللحظات الأولى. النتيجة: تقارب أسرع وأكثر استقراراً. Adam هو الـ default optimizer في معظم أبحاث Deep Learning." }
        ]}
      ]
    }
  ]
};
