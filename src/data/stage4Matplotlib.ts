import { StageDef } from './types';

export const stage4Matplotlib: StageDef = {
  id: "stage-4",
  stageNumber: 4,
  title: "Matplotlib & التصور البياني",
  description: "سرد القصص بالبيانات — من الرسم البياني البسيط إلى التقارير الاحترافية.",
  units: [
    {
      id: "unit-ai-18", stageId: "stage-4", unitNumber: 18,
      title: "معمارية Matplotlib",
      description: "نموذج Figure/Axes، OOP vs pyplot، التخصيص — التحكم الكامل.",
      difficulty: 2, estimatedHours: 3, tags: ["matplotlib", "visualization"],
      content: [
        { type: "h1", content: "الوحدة 18: معمارية Matplotlib" },
        { type: "p", content: "التصور البياني ليس تجميلاً — إنه أداة تحليل. الرسم الصحيح يكشف أنماطاً لا تراها في جداول الأرقام. Matplotlib هي أقدم وأقوى مكتبة تصور في Python. API المزدوج (pyplot للرسوم السريعة، OOP للتحكم الكامل) يمنحك مرونة لا متناهية." },
        { type: "code", language: "python", content: `import matplotlib.pyplot as plt
import numpy as np

# أسلوب OOP (موصى به للتحكم الكامل)
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# رسم 1: خطي
x = np.linspace(0, 10, 100)
axes[0, 0].plot(x, np.sin(x), 'b-', linewidth=2, label='sin(x)')
axes[0, 0].plot(x, np.cos(x), 'r--', linewidth=2, label='cos(x)')
axes[0, 0].set_title('دوال مثلثية', fontsize=14, fontweight='bold')
axes[0, 0].legend()
axes[0, 0].grid(True, alpha=0.3)

# رسم 2: مبعثر
np.random.seed(42)
x = np.random.randn(200)
y = 0.7 * x + np.random.randn(200) * 0.5
axes[0, 1].scatter(x, y, c=np.abs(x+y), cmap='viridis', alpha=0.6, edgecolors='white')
axes[0, 1].set_title('علاقة ارتباطية', fontsize=14)
axes[0, 1].set_xlabel('متغير X')
axes[0, 1].set_ylabel('متغير Y')

# رسم 3: Histogram
axes[1, 0].hist(np.random.randn(1000), bins=30, color='teal', alpha=0.7, edgecolor='white')
axes[1, 0].axvline(0, color='red', linestyle='--', label='μ=0')
axes[1, 0].set_title('توزيع طبيعي', fontsize=14)
axes[1, 0].legend()

# رسم 4: Bar
categories = ['نموذج A', 'نموذج B', 'نموذج C', 'نموذج D']
scores = [0.85, 0.92, 0.78, 0.88]
colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
axes[1, 1].bar(categories, scores, color=colors, edgecolor='white')
axes[1, 1].set_title('مقارنة أداء النماذج', fontsize=14)
axes[1, 1].set_ylim(0, 1)
axes[1, 1].axhline(np.mean(scores), color='gray', linestyle=':', label=f'متوسط={np.mean(scores):.2f}')
axes[1, 1].legend()

plt.tight_layout()
# plt.savefig('dashboard.png', dpi=150, bbox_inches='tight')
print("✓ تم إنشاء لوحة تحكم من 4 رسوم بيانية")
print("  استخدم fig.savefig() لحفظ الصورة بدقة عالية")` },

        { type: "active-recall", questions: [
          { q: "ما الفرق بين أسلوب pyplot و OOP في Matplotlib؟", a: "pyplot: واجهة سريعة تشبه MATLAB (plt.plot(), plt.show()). جيد للرسوم البسيطة السريعة. OOP: تحكم كامل عبر Figure و Axes (fig, ax = plt.subplots()). يسمح بتخصيص دقيق ورسوم متعددة معقدة. المحترفون يستخدمون OOP دائماً." }
        ]}
      ]
    },
    {
      id: "unit-ai-19", stageId: "stage-4", unitNumber: 19,
      title: "الرسوم الإحصائية",
      description: "التوزيعات، الارتباطات، عدم اليقين — كل رسم يحكي قصة.",
      difficulty: 2, estimatedHours: 3, tags: ["matplotlib", "statistics"],
      content: [
        { type: "h1", content: "الوحدة 19: الرسوم الإحصائية" },
        { type: "p", content: "في AI، الرسوم الإحصائية ليست 'جميلة' فقط — إنها أدوات تشخيص. Box plot يكشف القيم الشاذة. Correlation heatmap يكشف العلاقات بين المتغيرات. Learning curves تكشف overfitting. كل رسم يجب أن يجيب على سؤال محدد عن بياناتك." },
        { type: "code", language: "python", content: `import matplotlib.pyplot as plt
import numpy as np; np.random.seed(42)

fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# Box Plot — كشف القيم الشاذة
data = [np.random.normal(0, std, 100) for std in range(1, 5)]
axes[0, 0].boxplot(data, labels=['σ=1','σ=2','σ=3','σ=4'], patch_artist=True)
axes[0, 0].set_title('Box Plot: كشف القيم الشاذة', fontweight='bold')

# Violin Plot — توزيع كامل
axes[0, 1].violinplot(data, showmedians=True)
axes[0, 1].set_title('Violin Plot: شكل التوزيع', fontweight='bold')

# Correlation Heatmap (يدوياً)
corr = np.array([[1.0, 0.8, -0.3], [0.8, 1.0, 0.1], [-0.3, 0.1, 1.0]])
im = axes[1, 0].imshow(corr, cmap='RdBu_r', vmin=-1, vmax=1)
axes[1, 0].set_title('Correlation Heatmap', fontweight='bold')
for i in range(3):
    for j in range(3):
        axes[1, 0].text(j, i, f'{corr[i,j]:.1f}', ha='center', va='center', fontweight='bold')
plt.colorbar(im, ax=axes[1, 0])

# Learning Curve — كشف overfitting
epochs = np.arange(1, 51)
train_loss = 0.5 * np.exp(-epochs/15) + 0.05
val_loss = 0.5 * np.exp(-epochs/15) + 0.05 + 0.1 * (epochs/80)
axes[1, 1].plot(epochs, train_loss, 'b-', label='Training', linewidth=2)
axes[1, 1].plot(epochs, val_loss, 'r--', label='Validation', linewidth=2)
axes[1, 1].axvline(25, color='gray', linestyle=':', alpha=0.5)
axes[1, 1].annotate('Overfitting يبدأ هنا', xy=(30, val_loss[29]), fontsize=9, color='red')
axes[1, 1].set_title('Learning Curve', fontweight='bold')
axes[1, 1].legend()
plt.tight_layout()
print("✓ 4 رسوم إحصائية — أدوات تشخيص AI الأساسية")` },

        { type: "active-recall", questions: [
          { q: "متى تستخدم Box Plot ومتى Violin Plot؟", a: "Box Plot: يظهر الإحصائيات الخمسة (min, Q1, median, Q3, max) + القيم الشاذة. جيد للمقارنة السريعة بين مجموعات. Violin Plot: يظهر شكل التوزيع الكامل (كثافة الاحتمال). أفضل لفهم طبيعة البيانات. إذا كانت البيانات متعددة القمم (bimodal)، Violin Plot أفضل." }
        ]}
      ]
    },
    {
      id: "unit-ai-20", stageId: "stage-4", unitNumber: 20,
      title: "الرسوم المتقدمة والحركية",
      description: "Subplots معقدة، رسوم متحركة، 3D — المستوى المتقدم من التصور.",
      difficulty: 3, estimatedHours: 3, tags: ["matplotlib", "advanced"],
      content: [
        { type: "h1", content: "الوحدة 20: الرسوم المتقدمة والحركية" },
        { type: "p", content: "أحياناً الرسم الثابت لا يكفي. Matplotlib تدعم: 3D plotting، animation، interactive backends، و GridSpec للتحكم الدقيق في التخطيط. هذه الأدوات تحولك من 'راسم بياني' إلى 'راوي قصص بالبيانات'." },
        { type: "code", language: "python", content: `import matplotlib.pyplot as plt
import numpy as np
from matplotlib.gridspec import GridSpec

# GridSpec — تحكم دقيق في التخطيط
fig = plt.figure(figsize=(14, 8))
gs = GridSpec(3, 3, figure=fig)

# رسم كبير في الأعلى
ax_main = fig.add_subplot(gs[0, :])
x = np.linspace(0, 4*np.pi, 200)
ax_main.plot(x, np.sin(x), linewidth=2)
ax_main.fill_between(x, np.sin(x), alpha=0.2)
ax_main.set_title('الرسم الرئيسي', fontweight='bold', fontsize=14)

# 3 رسوم صغيرة في الأسفل
for i, freq in enumerate([1, 2, 3]):
    ax = fig.add_subplot(gs[1:, i])
    ax.plot(x, np.sin(freq * x))
    ax.set_title(f'موجة: تردد={freq}')
    ax.grid(True, alpha=0.3)

plt.tight_layout()
print("✓ GridSpec: تخطيط معقد بسهولة")

# 3D Plotting
fig3d = plt.figure(figsize=(8, 6))
ax3d = fig3d.add_subplot(111, projection='3d')
t = np.linspace(0, 2*np.pi, 100)
x_3d = np.sin(t); y_3d = np.cos(t); z_3d = t
ax3d.plot(x_3d, y_3d, z_3d, linewidth=2, color='purple')
ax3d.set_title('مسار حلزوني 3D', fontweight='bold')
print("✓ 3D Plot: تصور البيانات متعددة الأبعاد")` },

        { type: "active-recall", questions: [
          { q: "لماذا نستخدم GridSpec بدل plt.subplots؟", a: "GridSpec يمنحك تحكماً دقيقاً في أحجام ومواضع الرسوم — يمكن لرسم أن يأخذ عدة خلايا أو صفوف/أعمدة كاملة. subplots جيدة للتخطيطات المنتظمة، GridSpec للتخطيطات المعقدة غير المتماثلة." }
        ]}
      ]
    },
    {
      id: "unit-ai-21", stageId: "stage-4", unitNumber: 21,
      title: "Seaborn والتقارير الاحترافية",
      description: "Seaborn API، تصميم، تقارير جاهزة — سرد القصص بالبيانات.",
      difficulty: 2, estimatedHours: 3, tags: ["seaborn", "reports"],
      content: [
        { type: "h1", content: "الوحدة 21: Seaborn والتقارير الاحترافية" },
        { type: "p", content: "Seaborn مبنية على Matplotlib وتوفر واجهة أبسط ورسوماً إحصائية أجمل تلقائياً. في حين أن Matplotlib تمنحك تحكماً كاملاً، Seaborn تجعل 80% من الرسوم الإحصائية في سطرين من الكود. المحترف يستخدم الاثنتين معاً." },
        { type: "code", language: "python", content: `import seaborn as sns
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# إعداد نمط احترافي
sns.set_style("whitegrid")
sns.set_palette("husl")

# بيانات تدريب نموذج (محاكاة)
np.random.seed(42)
df = pd.DataFrame({
    'model': ['ResNet', 'EfficientNet', 'ViT', 'ResNet', 'EfficientNet', 'ViT'] * 10,
    'accuracy': np.concatenate([
        np.random.normal(0.93, 0.02, 10),
        np.random.normal(0.94, 0.015, 10),
        np.random.normal(0.955, 0.01, 10),
        np.random.normal(0.91, 0.02, 10),
        np.random.normal(0.93, 0.015, 10),
        np.random.normal(0.94, 0.01, 10),
    ]),
    'dataset': ['Train', 'Train', 'Train', 'Test', 'Test', 'Test'] * 10
})

fig, axes = plt.subplots(1, 3, figsize=(16, 5))

# 1. Bar plot with error bars
sns.barplot(data=df, x='model', y='accuracy', hue='dataset', ax=axes[0], errorbar='sd')
axes[0].set_title('مقارنة أداء النماذج', fontweight='bold')

# 2. Box plot
sns.boxplot(data=df, x='model', y='accuracy', hue='dataset', ax=axes[1])
axes[1].set_title('توزيع الدقة', fontweight='bold')

# 3. Swarm plot
sns.swarmplot(data=df[df['dataset']=='Test'], x='model', y='accuracy', ax=axes[2], size=6)
axes[2].set_title('نقاط الاختبار الفردية', fontweight='bold')

plt.tight_layout()
# plt.savefig('model_report.png', dpi=200, bbox_inches='tight')
print("✓ تقرير مقارنة نماذج احترافي — جاهز للعرض!")
print("  Seaborn = جمال Matplotlib + سهولة Pandas")` },

        { type: "active-recall", questions: [
          { q: "متى تستخدم Matplotlib مباشرة ومتى Seaborn؟", a: "Seaborn: للرسوم الإحصائية السريعة والجميلة (distplot, heatmap, pairplot, boxplot, violinplot). Matplotlib مباشرة: للرسوم المخصصة المعقدة، 3D، animation، والتحكم الدقيق في كل تفصيل. في الممارسة، نبدأ بـ Seaborn ونستخدم Matplotlib للتخصيصات الإضافية." }
        ]}
      ]
    }
  ]
};
