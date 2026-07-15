import { StageDef } from './types';

export const stage3Pandas: StageDef = {
  id: "stage-3",
  stageNumber: 3,
  title: "Pandas — تحليل البيانات الاحترافي",
  description: "إتقان معالجة وتحليل البيانات باستخدام Pandas — لغة تحويل البيانات.",
  units: [
    {
      id: "unit-ai-13", stageId: "stage-3", unitNumber: 13,
      title: "أساسيات Pandas",
      description: "Series، DataFrame، Index — نموذج البيانات المجدول.",
      difficulty: 2, estimatedHours: 3, tags: ["pandas", "dataframe"],
      content: [
        { type: "h1", content: "الوحدة 13: أساسيات Pandas" },
        { type: "p", content: "Pandas هي مكتبة تحليل البيانات الأولى في Python. إذا كانت NumPy تتعامل مع الأرقام، فـ Pandas تتعامل مع البيانات المنظمة (Tabular Data) — جداول بأسماء أعمدة، صفوف مفهرسة، وأنواع بيانات مختلطة. كل AI Engineer يقضي 60-80% من وقته في تنظيف وتحضير البيانات — و Pandas هي أداته الأساسية." },
        { type: "p", content: "الـ DataFrame هو هيكل البيانات المركزي في Pandas: جدول ثنائي الأبعاد به أسماء أعمدة (columns) ومؤشر صفوف (index). إنه يشبه جدول SQL أو Excel spreadsheet لكن بقوة Python الكاملة." },
        
        { type: "h2", content: "1. Series و DataFrame — اللبنات الأساسية" },
        { type: "code", language: "python", title: "إنشاء Series و DataFrame", content: `import pandas as pd
import numpy as np

# Series = عمود مفهرس
temps = pd.Series([25, 30, 22, 28, 35], 
                  index=['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء'],
                  name='درجة الحرارة')
print("Series:")
print(temps)
print(f"\\nالقيم: {temps.values}")
print(f"المؤشر: {temps.index.tolist()}")

# DataFrame = جدول كامل
df = pd.DataFrame({
    'name': ['أحمد', 'سارة', 'محمد', 'نورة'],
    'age': [25, 30, 22, 28],
    'salary': [15000, 22000, 12000, 19000],
    'department': ['هندسة', 'بيانات', 'هندسة', 'بيانات']
})
print(f"\\nDataFrame:\\n{df}")
print(f"\\nالأعمدة: {df.columns.tolist()}")
print(f"الأنواع:\\n{df.dtypes}")
print(f"معلومات:\\n{df.describe()}")` },

        { type: "h2", content: "2. القراءة والكتابة — IO" },
        { type: "code", language: "python", content: `# Pandas تدعم عشرات الصيغ
# CSV (الأكثر شيوعاً)
# df = pd.read_csv('data.csv')
# df.to_csv('output.csv', index=False)

# Excel
# df = pd.read_excel('data.xlsx', sheet_name='Sheet1')
# df.to_excel('output.xlsx', index=False)

# SQL
# import sqlite3
# conn = sqlite3.connect('database.db')
# df = pd.read_sql('SELECT * FROM users', conn)

# JSON
# df = pd.read_json('data.json')

# Parquet (سريع جداً — أفضل صيغة لـ AI)
# df.to_parquet('data.parquet')

print("💡 Parquet أسرع 10x من CSV وأصغر حجماً — استخدمه في مشاريع AI")` },

        { type: "h2", content: "3. الفهرسة والاختيار — loc, iloc" },
        { type: "code", language: "python", content: `df = pd.DataFrame({
    'A': [10, 20, 30, 40, 50],
    'B': [100, 200, 300, 400, 500],
    'C': ['x', 'y', 'z', 'w', 'v']
}, index=['a', 'b', 'c', 'd', 'e'])

print(df)
print(f"\\n# loc: بالاسم")
print(f"df.loc['b', 'A']: {df.loc['b', 'A']}")
print(f"df.loc['a':'c', ['A', 'C']]:\\n{df.loc['a':'c', ['A', 'C']]}")

print(f"\\n# iloc: بالموقع (0-indexed)")
print(f"df.iloc[1, 0]: {df.iloc[1, 0]}")
print(f"df.iloc[0:3, 0:2]:\\n{df.iloc[0:3, 0:2]}")

print(f"\\n# Boolean indexing")
print(df[df['A'] > 25])
print(f"\\n# at/iat — أسرع لقيمة واحدة")
print(f"df.at['c', 'B']: {df.at['c', 'B']}")` },

        { type: "active-recall", questions: [
          { q: "ما الفرق بين loc و iloc؟", a: "loc: اختيار بالاسم (labels). مثال: df.loc['a':'c', ['A','B']]. iloc: اختيار بالموقع الرقمي (integer position). مثال: df.iloc[0:3, 0:2]. loc يشمل الحدود، iloc مثل Python slicing (لا يشمل النهاية)." }
        ]}
      ]
    },
    {
      id: "unit-ai-14", stageId: "stage-3", unitNumber: 14,
      title: "تحويل البيانات",
      description: "groupby، pivot، melt، merge، join — لغة تحويل البيانات.",
      difficulty: 3, prerequisites: ["unit-ai-13"], estimatedHours: 4, tags: ["pandas", "transformation"],
      content: [
        { type: "h1", content: "الوحدة 14: تحويل البيانات" },
        { type: "p", content: "البيانات الخام نادراً ما تكون جاهزة. 80% من وقت AI Engineer يذهب في تحويل البيانات: تجميع، دمج، تدوير، تصفية. Pandas توفر أدوات قوية لهذا — groupby للتجميع (مثل GROUP BY في SQL)، merge للدمج (مثل JOIN)، pivot/melt لإعادة التشكيل." },
        
        { type: "h2", content: "1. groupby — قلب تحليل البيانات" },
        { type: "code", language: "python", content: `df = pd.DataFrame({
    'قسم': ['هندسة', 'بيانات', 'هندسة', 'بيانات', 'هندسة', 'تسويق'],
    'موظف': ['أحمد', 'سارة', 'محمد', 'نورة', 'عمر', 'ليلى'],
    'راتب': [15000, 22000, 18000, 25000, 16000, 14000],
    'سنوات_خبرة': [3, 5, 4, 6, 3, 2]
})

# تجميع بسيط
print("متوسط الراتب حسب القسم:")
print(df.groupby('قسم')['راتب'].mean())

# تجميع متعدد
print(f"\\nإحصائيات حسب القسم:")
print(df.groupby('قسم').agg({
    'راتب': ['mean', 'min', 'max', 'count'],
    'سنوات_خبرة': 'mean'
}))

# transform — احتفظ بشكل البيانات الأصلي
df['متوسط_القسم'] = df.groupby('قسم')['راتب'].transform('mean')
df['فوق_المتوسط'] = df['راتب'] > df['متوسط_القسم']
print(f"\\nمع transform:\\n{df}")` },

        { type: "h2", content: "2. merge, join, concat — دمج البيانات" },
        { type: "code", language: "python", content: `employees = pd.DataFrame({
    'id': [1, 2, 3, 4],
    'name': ['أحمد', 'سارة', 'محمد', 'نورة'],
    'dept_id': [10, 20, 10, 30]
})
departments = pd.DataFrame({
    'dept_id': [10, 20, 30],
    'dept_name': ['هندسة', 'بيانات', 'تسويق']
})

# INNER JOIN
inner = employees.merge(departments, on='dept_id', how='inner')
print("INNER JOIN:")
print(inner)

# LEFT JOIN
left = employees.merge(departments, on='dept_id', how='left')
print(f"\\nLEFT JOIN:\\n{left}")

# concat — تراكم عمودي أو أفقي
dept2 = pd.DataFrame({'dept_id': [40], 'dept_name': ['موارد بشرية']})
all_depts = pd.concat([departments, dept2], ignore_index=True)
print(f"\\nconcat:\\n{all_depts}")` },

        { type: "h2", content: "3. pivot و melt — إعادة التشكيل" },
        { type: "code", language: "python", content: `sales = pd.DataFrame({
    'date': ['2024-01', '2024-01', '2024-02', '2024-02', '2024-03', '2024-03'],
    'product': ['A', 'B', 'A', 'B', 'A', 'B'],
    'amount': [100, 150, 110, 160, 120, 170]
})
print("بيانات طويلة (Long format):")
print(sales)

# pivot: Long → Wide
wide = sales.pivot(index='date', columns='product', values='amount')
print(f"\\nبعد pivot (Wide format):\\n{wide}")

# melt: Wide → Long
long = wide.reset_index().melt(id_vars='date', var_name='product', value_name='amount')
print(f"\\nبعد melt (عودة لـ Long):\\n{long}")` },

        { type: "active-recall", questions: [
          { q: "ما الفرق بين transform و apply في groupby؟", a: "transform: يرجع نفس شكل البيانات الأصلي (نفس الطول). يستخدم لإضافة أعمدة محسوبة. apply: يمكنه إرجاع أي شكل — حتى قيمة واحدة أو DataFrame مختلف. transform أسرع وأفضل لإضافة أعمدة، apply أكثر مرونة." }
        ]}
      ]
    },
    {
      id: "unit-ai-15", stageId: "stage-3", unitNumber: 15,
      title: "السلاسل الزمنية والنوافذ",
      description: "DatetimeIndex، resample، rolling، expanding — البيانات الزمنية.",
      difficulty: 3, prerequisites: ["unit-ai-13"], estimatedHours: 3, tags: ["pandas", "timeseries"],
      content: [
        { type: "h1", content: "الوحدة 15: السلاسل الزمنية والنوافذ" },
        { type: "p", content: "معظم بيانات العالم الحقيقي زمنية: أسعار الأسهم، قراءات الحساسات، سجلات المستخدمين. Pandas توفر أدوات متخصصة للتعامل مع السلاسل الزمنية: فهرسة زمنية، إعادة تجميع (resample)، نوافذ متحركة (rolling)، ونوافذ متوسعة (expanding)." },
        { type: "code", language: "python", content: `# إنشاء سلسلة زمنية
dates = pd.date_range('2024-01-01', periods=365, freq='D')
ts = pd.Series(np.random.randn(365).cumsum() + 100, index=dates, name='price')
print("سلسلة زمنية:")
print(ts.head(10))

# Resample — تجميع بفترات زمنية مختلفة
print(f"\\nشهرياً (متوسط):\\n{ts.resample('ME').mean().head(6)}")
print(f"\\nأسبوعياً (مجموع):\\n{ts.resample('W').sum().head(6)}")

# Rolling — نافذة متحركة
rolling_mean = ts.rolling(window=7).mean()   # متوسط 7 أيام
rolling_std = ts.rolling(window=30).std()     # انحراف معياري 30 يوم
print(f"\\nبعد rolling mean (7 أيام):\\n{rolling_mean.head(10)}")

# Expanding — نافذة متوسعة (من البداية)
expanding_max = ts.expanding().max()
print(f"\\nأعلى سعر حتى الآن:\\n{expanding_max.head(10)}")

# Shift و Diff
print(f"\\nتغير يومي (diff):\\n{ts.diff().head(10)}")
print(f"\\nقيمة أمس (shift 1):\\n{ts.shift(1).head(10)}")` },

        { type: "active-recall", questions: [
          { q: "ما الفرق بين rolling و expanding؟", a: "rolling: نافذة بحجم ثابت تتحرك مع الزمن (مثلاً آخر 7 أيام). expanding: نافذة تبدأ من البداية وتتوسع (كل البيانات من اليوم الأول حتى الآن). rolling لتحليل الاتجاهات قصيرة المدى، expanding للإحصائيات التراكمية." }
        ]}
      ]
    },
    {
      id: "unit-ai-16", stageId: "stage-3", unitNumber: 16,
      title: "العمليات المتقدمة",
      description: "MultiIndex، categoricals، apply/map/transform، method chaining.",
      difficulty: 4, prerequisites: ["unit-ai-14"], estimatedHours: 3, tags: ["pandas", "advanced"],
      content: [
        { type: "h1", content: "الوحدة 16: العمليات المتقدمة" },
        { type: "p", content: "Pandas المتقدمة تمكنك من التعامل مع بيانات متعددة المستويات (MultiIndex)، تحسين الأداء باستخدام أنواع بيانات فئوية (categorical)، وسلاسل من العمليات المتدفقة (method chaining) التي تجعل الكود أنظف وأسرع." },
        { type: "code", language: "python", content: `# MultiIndex — فهرسة متعددة المستويات
arrays = [['هندسة', 'هندسة', 'بيانات', 'بيانات', 'تسويق', 'تسويق'],
          ['مطور', 'مهندس', 'عالم', 'محلل', 'مدير', 'منسق']]
tuples = list(zip(*arrays))
index = pd.MultiIndex.from_tuples(tuples, names=['قسم', 'مسمى'])
df = pd.DataFrame({'الراتب': [15000, 18000, 25000, 20000, 17000, 12000]}, index=index)
print("MultiIndex DataFrame:")
print(df)
print(f"\\nاختيار من مستوى: \\n{df.loc['هندسة']}")

# Categoricals — توفير ذاكرة + سرعة
df2 = pd.DataFrame({'city': ['الرياض', 'جدة', 'الرياض', 'الدمام'] * 250000})
df2['city_cat'] = df2['city'].astype('category')
print(f"\\nذاكرة city (object): {df2['city'].memory_usage(deep=True) / 1e6:.1f} MB")
print(f"ذاكرة city_cat (category): {df2['city_cat'].memory_usage(deep=True) / 1e6:.1f} MB")

# Method Chaining — نمط Pandas الاحترافي
result = (df2
    .groupby('city_cat')
    .size()
    .reset_index(name='count')
    .sort_values('count', ascending=False)
    .head(3))
print(f"\\nMethod Chaining:\\n{result}")` },

        { type: "active-recall", questions: [
          { q: "متى تستخدم categorical dtype؟", a: "عندما يحتوي العمود على قيم متكررة قليلة (مثلاً: مدن، أقسام، فئات). categorical يوفر ذاكرة (يخزن أعداداً صحيحة بدل نصوص) ويسرع العمليات (خاصة groupby). مثالي للبيانات ذات الـ cardinality المنخفض." }
        ]}
      ]
    },
    {
      id: "unit-ai-17", stageId: "stage-3", unitNumber: 17,
      title: "تنظيف البيانات الواقعية",
      description: "استراتيجيات القيم المفقودة، القيم الشاذة، التطبيع، الترميز — 80% من عمل AI Engineer.",
      difficulty: 3, prerequisites: ["unit-ai-14"], estimatedHours: 4, tags: ["pandas", "cleaning"],
      content: [
        { type: "h1", content: "الوحدة 17: تنظيف البيانات الواقعية" },
        { type: "p", content: "البيانات الحقيقية فوضوية: قيم مفقودة، قيم شاذة، تنسيقات غير متسقة، أخطاء إملائية. 80% من وقت مهندس AI يذهب في تنظيف وتحضير البيانات. هذه الوحدة تعطيك الأدوات العملية للتعامل مع كل هذا بكفاءة." },
        { type: "code", language: "python", content: `# إنشاء بيانات فوضوية تشبه الواقع
df = pd.DataFrame({
    'age': [25, np.nan, 30, 150, 22, np.nan, 28],  # قيم مفقودة + شاذة
    'salary': [50000, 60000, np.nan, 55000, -1000, 62000, 58000],  # سالب شاذ
    'city': ['الرياض', 'جدة', 'الرياض', 'الدمام', None, 'جدة', 'الرياض'],
    'gender': ['M', 'F', 'm', 'female', 'M', None, 'F']  # تنسيق غير موحد
})
print("بيانات فوضوية:")
print(df)
print(f"\\nالقيم المفقودة:\\n{df.isnull().sum()}")

# 1. التعامل مع القيم المفقودة
df_clean = df.copy()
df_clean['age'] = df_clean['age'].fillna(df_clean['age'].median())
df_clean['salary'] = df_clean['salary'].fillna(df_clean['salary'].mean())
df_clean['city'] = df_clean['city'].fillna('غير معروف')
df_clean['gender'] = df_clean['gender'].fillna('غير محدد')

# 2. إصلاح القيم الشاذة
df_clean.loc[df_clean['age'] > 120, 'age'] = df_clean['age'].median()
df_clean.loc[df_clean['salary'] < 0, 'salary'] = np.nan
df_clean['salary'] = df_clean['salary'].fillna(df_clean['salary'].median())

# 3. توحيد التنسيق
df_clean['gender'] = df_clean['gender'].str.upper().map({'M': 'ذكر', 'F': 'أنثى', 'MALE': 'ذكر', 'FEMALE': 'أنثى'}).fillna('غير محدد')

# 4. One-Hot Encoding
df_encoded = pd.get_dummies(df_clean, columns=['city', 'gender'], drop_first=True)

print(f"\\nبعد التنظيف والترميز:\\n{df_encoded}")
print(f"\\nالأعمدة النهائية: {df_encoded.columns.tolist()}")
print("✓ البيانات جاهزة لنمذجة AI!")` },

        { type: "callout", calloutType: "best-practice", title: "قواعد تنظيف البيانات", content: [
          { type: "p", content: "① دائماً افحص البيانات قبل التنظيف: df.info(), df.describe(), df.isnull().sum(). ② القيم المفقودة: احذف إذا كانت < 5%، املأ بـ median (للأرقام) أو mode (للفئات). ③ القيم الشاذة: استخدم IQR أو Z-score لاكتشافها. ④ الترميز: One-Hot للفئات القليلة، Label Encoding للفئات المرتبة." }
        ]},

        { type: "active-recall", questions: [
          { q: "ما الاستراتيجيات الثلاث للتعامل مع القيم المفقودة؟", a: "① الحذف: dropna() — إذا كانت النسبة صغيرة (<5%). ② الملء البسيط: fillna() بـ mean/median للأرقام، mode للفئات. ③ الملء المتقدم: KNN Imputer، iterative imputer، أو النمذجة. في AI، الملء بالوسيط (median) هو الأكثر شيوعاً لأنه مقاوم للقيم الشاذة." }
        ]}
      ]
    }
  ]
};
