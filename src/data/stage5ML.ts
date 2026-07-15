import { StageDef } from './types';

export const stage5ML: StageDef = {
  id: "stage-5",
  stageNumber: 5,
  title: "Machine Learning — التعلم الآلي",
  description: "بناء نماذج تعلم آلي من الصفر إلى الإنتاج باستخدام Scikit-learn.",
  units: [
    {
      id: "unit-ai-22", stageId: "stage-5", unitNumber: 22,
      title: "أسس التعلم الآلي",
      description: "Bias-Variance tradeoff، Under/Overfitting، No Free Lunch — فلسفة التعلم.",
      difficulty: 3, estimatedHours: 4, tags: ["ml", "fundamentals"],
      content: [
        { type: "h1", content: "الوحدة 22: أسس التعلم الآلي" },
        { type: "p", content: "التعلم الآلي ليس سحراً — إنه بحث عن دالة. بالنظر إلى بيانات (X, y)، نريد إيجاد f بحيث f(X) ≈ y لأمثلة جديدة لم ترها أثناء التدريب. كل شيء آخر — الشبكات العصبية، gradient boosting، transformers — هو مجرد طرق مختلفة لتمثيل هذه الدالة." },
        { type: "p", content: "المشكلة الأساسية: كيف نبني نموذجاً يعمم (generalize) ولا يحفظ (memorize)؟ هذا هو صراع bias-variance: نموذج بسيط جداً = underfitting (لم يتعلم). نموذج معقد جداً = overfitting (حفظ عن ظهر قلب). الحل الأمثل في المنتصف." },
        
        { type: "h2", content: "1. أنواع التعلم الآلي" },
        { type: "mermaid", content: "graph TD\n  ML[\"تعلم آلي\"] --> SL[\"Supervised - بإشراف\"]\n  ML --> UL[\"Unsupervised - بدون إشراف\"]\n  ML --> RL[\"Reinforcement - تعزيزي\"]\n  SL --> REG[\"Regression - تنبؤ بقيمة\"]\n  SL --> CLS[\"Classification - تصنيف\"]\n  UL --> CLU[\"Clustering - تجميع\"]\n  UL --> DIM[\"Dimensionality Reduction\"]\n  style ML fill:#ffcdd2\n  style SL fill:#e3f2fd\n  style UL fill:#fff9c4\n  style RL fill:#c8e6c9", caption: "خريطة التعلم الآلي" },
        
        { type: "h2", content: "2. التدريب، التحقق، الاختبار" },
        { type: "code", language: "python", content: `from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
import numpy as np

X, y = make_classification(n_samples=1000, n_features=20, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
X_train, X_val, y_train, y_val = train_test_split(X_train, y_train, test_size=0.2, random_state=42)

print(f"Train: {X_train.shape[0]} | Val: {X_val.shape[0]} | Test: {X_test.shape[0]}")

# تدريب
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)
print(f"\\nTrain accuracy: {model.score(X_train, y_train):.3f}")
print(f"Val accuracy:   {model.score(X_val, y_val):.3f}")
print(f"Test accuracy:  {model.score(X_test, y_test):.3f}")

# Cross-validation — معيار ذهبي
cv_scores = cross_val_score(model, X_train, y_train, cv=5)
print(f"\\nCV scores: {np.round(cv_scores, 3)}")
print(f"Mean CV: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")` },

        { type: "callout", calloutType: "best-practice", title: "القاعدة الذهبية", content: [
          { type: "p", content: "Never touch test data until the very end. Train on train set, tune on validation set, report on test set once. Cross-validation on train set is your friend for reliable estimates." }
        ]},

        { type: "active-recall", questions: [
          { q: "اشرح bias-variance tradeoff.", a: "Bias عالي = النموذج مبسط جداً (underfitting) — يفشل حتى في بيانات التدريب. Variance عالي = النموذج معقد جداً (overfitting) — ممتاز في التدريب لكنه يفشل في البيانات الجديدة. الهدف: أقل خطأ إجمالي = bias² + variance + irreducible error. Regularization يزيد bias قليلاً لكنه يقلل variance كثيراً." }
        ]}
      ]
    },
    {
      id: "unit-ai-23", stageId: "stage-5", unitNumber: 23,
      title: "الانحدار — Regression",
      description: "Linear، Polynomial، Ridge، Lasso، ElasticNet — التنبؤ بالقيم المستمرة.",
      difficulty: 3, prerequisites: ["unit-ai-22"], estimatedHours: 4, tags: ["ml", "regression"],
      content: [
        { type: "h1", content: "الوحدة 23: الانحدار" },
        { type: "p", content: "الانحدار يجيب على 'كم؟': كم سعر المنزل؟ كم درجة الحرارة غداً؟ كم مبيعات الشهر القادم؟ من أبسط انحدار خطي إلى ElasticNet مع regularization، Scikit-learn توفر كل الأدوات. المفتاح: فهم متى تستخدم Ridge (عندما كل المتغيرات مهمة) ومتى Lasso (عندما تريد اختيار المتغيرات)." },
        { type: "code", language: "python", content: `from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

# بيانات غير خطية
np.random.seed(42)
X = np.linspace(-3, 3, 100).reshape(-1, 1)
y = X.ravel()**2 + np.random.normal(0, 0.5, 100)

# مقارنة النماذج
models = {
    'Linear': LinearRegression(),
    'Ridge (α=1.0)': Ridge(alpha=1.0),
    'Lasso (α=0.1)': Lasso(alpha=0.1),
    'ElasticNet': ElasticNet(alpha=0.1, l1_ratio=0.5),
    'Polynomial (deg=3)': Pipeline([
        ('poly', PolynomialFeatures(degree=3)),
        ('scaler', StandardScaler()),
        ('ridge', Ridge(alpha=1.0))
    ])
}

for name, model in models.items():
    model.fit(X, y)
    y_pred = model.predict(X)
    mse = mean_squared_error(y, y_pred)
    r2 = r2_score(y, y_pred)
    print(f"{name:20s} | MSE: {mse:6.2f} | R²: {r2:.3f}")

print(f"\\n✓ Polynomial deg=3 أفضل نموذج — يلتقط العلاقة غير الخطية")
print(f"  Lasso أنتج معاملات قليلة غير صفرية (feature selection)")` },

        { type: "active-recall", questions: [
          { q: "ما الفرق بين Ridge و Lasso؟", a: "Ridge (L2): تضيف αΣw² — تقلص المعاملات لكن لا تصفرها. مناسبة عندما كل المتغيرات مهمة. Lasso (L1): تضيف αΣ|w| — يمكنها تصفير معاملات (feature selection). مناسبة عندما عدد المتغيرات كبير وتريد اختيار المهم منها. ElasticNet تجمع الاثنتين." }
        ]}
      ]
    },
    {
      id: "unit-ai-24", stageId: "stage-5", unitNumber: 24,
      title: "التصنيف — Classification",
      description: "Logistic Regression، SVM، Decision Trees، k-NN — حدود القرار.",
      difficulty: 3, prerequisites: ["unit-ai-22"], estimatedHours: 4, tags: ["ml", "classification"],
      content: [
        { type: "h1", content: "الوحدة 24: التصنيف" },
        { type: "p", content: "التصنيف هو أكثر تطبيقات التعلم الآلي شيوعاً: هل هذا البريد مزعج؟ هل هذه الصورة قطة؟ هل سيتخلى العميل عن الخدمة؟ Logistic Regression هو أبسط وأهم مصنف — ورغم اسمه، فهو للتصنيف وليس الانحدار. SVM و Decision Trees و k-NN كل منها له نقاط قوته." },
        { type: "code", language: "python", content: `from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.datasets import make_classification

X, y = make_classification(n_samples=1000, n_features=10, n_informative=5, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

classifiers = {
    'LogisticRegression': LogisticRegression(max_iter=1000),
    'SVM (RBF)': SVC(kernel='rbf'),
    'DecisionTree': DecisionTreeClassifier(max_depth=5),
    'KNN (k=5)': KNeighborsClassifier(n_neighbors=5),
    'RandomForest': RandomForestClassifier(n_estimators=100)
}

for name, clf in classifiers.items():
    clf.fit(X_train, y_train)
    acc = clf.score(X_test, y_test)
    print(f"{name:20s} | Accuracy: {acc:.3f}")

# تقرير تفصيلي لأفضل نموذج
best = RandomForestClassifier(n_estimators=100, random_state=42)
best.fit(X_train, y_train)
y_pred = best.predict(X_test)
print(f"\\nتقرير التصنيف — RandomForest:")
print(classification_report(y_test, y_pred, target_names=['فئة 0', 'فئة 1']))
print(f"Confusion Matrix:\\n{confusion_matrix(y_test, y_pred)}")` },

        { type: "active-recall", questions: [
          { q: "متى تختار Logistic Regression ومتى Random Forest؟", a: "Logistic Regression: بيانات خطية، تفسير مباشر (معاملات تعطي أهمية كل متغير)، سريع، أساسي. Random Forest: علاقات غير خطية، لا يحتاج scaling، مقاوم للـ overfitting، يعطي feature importance. ابدأ دائماً بـ Logistic Regression كـ baseline، ثم جرب Random Forest." }
        ]}
      ]
    },
    {
      id: "unit-ai-25", stageId: "stage-5", unitNumber: 25,
      title: "النماذج المجمعة — Ensemble Methods",
      description: "Random Forest، Gradient Boosting، XGBoost، Stacking — قوة الجماعة.",
      difficulty: 4, prerequisites: ["unit-ai-24"], estimatedHours: 4, tags: ["ml", "ensemble"],
      content: [
        { type: "h1", content: "الوحدة 25: النماذج المجمعة" },
        { type: "p", content: "Ensemble Methods هي 'حكمة الجماعة' في التعلم الآلي: بدل نموذج واحد، ندرب عدة نماذج ونجمع تنبؤاتهم. Random Forest تجمع أشجار قرار متعددة. Gradient Boosting تبني أشجاراً بالتسلسل — كل شجرة تصحح أخطاء سابقتها. XGBoost و LightGBM هما 'السلاح السري' للفوز في مسابقات Kaggle." },
        { type: "code", language: "python", content: `from sklearn.ensemble import (RandomForestClassifier, GradientBoostingClassifier,
    VotingClassifier, StackingClassifier)
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
import numpy as np

X, y = make_classification(n_samples=1000, n_features=15, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Voting — تصويت الأغلبية
voting = VotingClassifier([
    ('lr', LogisticRegression(max_iter=1000)),
    ('rf', RandomForestClassifier(n_estimators=100)),
    ('gb', GradientBoostingClassifier(n_estimators=100))
], voting='soft')  # soft = متوسط الاحتمالات
voting.fit(X_train, y_train)
print(f"Voting Ensemble accuracy: {voting.score(X_test, y_test):.3f}")

# Stacking — نموذج يتعلم كيف يجمع النماذج
stacking = StackingClassifier([
    ('rf', RandomForestClassifier(n_estimators=50)),
    ('gb', GradientBoostingClassifier(n_estimators=50)),
], final_estimator=LogisticRegression())
stacking.fit(X_train, y_train)
print(f"Stacking accuracy: {stacking.score(X_test, y_test):.3f}")

# مقارنة شاملة
models = {
    'DecisionTree': DecisionTreeClassifier(max_depth=5),
    'RandomForest': RandomForestClassifier(n_estimators=100),
    'GradientBoosting': GradientBoostingClassifier(n_estimators=100),
    'Voting': voting,
    'Stacking': stacking,
}
for name, m in models.items():
    m.fit(X_train, y_train)
    print(f"{name:20s}: {m.score(X_test, y_test):.3f}")

print(f"\\n✓ Ensemble دائماً أفضل من نموذج واحد!")
print(f"  XGBoost, LightGBM, CatBoost = Gradient Boosting محسّن")` },

        { type: "active-recall", questions: [
          { q: "ما الفرق بين Bagging و Boosting؟", a: "Bagging (Random Forest): نماذج متوازية ومستقلة — كل نموذج يرى عينة عشوائية من البيانات. يقلل variance. Boosting (Gradient Boosting, XGBoost): نماذج متسلسلة — كل نموذج يصحح أخطاء السابق. يقلل bias. Boosting عادةً أدق لكنه أبطأ وأكثر عرضة للـ overfitting." }
        ]}
      ]
    },
    {
      id: "unit-ai-26", stageId: "stage-5", unitNumber: 26,
      title: "التجميع وتقليل الأبعاد",
      description: "K-Means، DBSCAN، PCA، t-SNE — التعلم بدون إشراف.",
      difficulty: 3, estimatedHours: 4, tags: ["ml", "unsupervised"],
      content: [
        { type: "h1", content: "الوحدة 26: التعلم بدون إشراف" },
        { type: "p", content: "ليس كل البيانات معنونة (labeled). أحياناً تحتاج أن تكتشف الأنماط بنفسك: تجميع العملاء المتشابهين، اكتشاف الحالات الشاذة، ضغط البيانات عالية الأبعاد للتصور. هذا هو التعلم بدون إشراف — والنموذجان الأساسيان: K-Means للتجميع، PCA/t-SNE لتقليل الأبعاد." },
        { type: "code", language: "python", content: `from sklearn.cluster import KMeans, DBSCAN
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
import numpy as np

# بيانات متجمعة طبيعياً
np.random.seed(42)
X = np.vstack([
    np.random.randn(200, 2) + [0, 0],
    np.random.randn(200, 2) + [5, 0],
    np.random.randn(200, 2) + [2.5, 5],
])

# K-Means
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
labels_km = kmeans.fit_predict(X)
print(f"K-Means: 3 clusters found")
print(f"  Cluster sizes: {np.bincount(labels_km)}")
print(f"  Inertia (WCSS): {kmeans.inertia_:.1f}")

# DBSCAN — لا يحتاج تحديد عدد المجموعات
dbscan = DBSCAN(eps=0.8, min_samples=10)
labels_db = dbscan.fit_predict(X)
n_clusters = len(set(labels_db)) - (1 if -1 in labels_db else 0)
n_noise = np.sum(labels_db == -1)
print(f"\\nDBSCAN: {n_clusters} clusters, {n_noise} noise points")

# PCA للضغط من 64D إلى 2D
X_high = np.random.randn(500, 64)
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_high)
print(f"\\nPCA: {X_high.shape} → {X_pca.shape}")
print(f"  Explained variance: {pca.explained_variance_ratio_.sum():.1%}")

# t-SNE — أفضل للتصور لكن أبطأ
tsne = TSNE(n_components=2, random_state=42)
X_tsne = tsne.fit_transform(X_high[:200])
print(f"t-SNE: أفضل للتصور البصري للبيانات عالية الأبعاد")` },

        { type: "active-recall", questions: [
          { q: "متى تستخدم DBSCAN بدل K-Means؟", a: "K-Means: يفترض مجموعات كروية متساوية الحجم تقريباً، تحتاج تحديد k مسبقاً. DBSCAN: يكتشف مجموعات بأي شكل، ويعزل النقاط الشاذة (noise)، لا يحتاج تحديد عدد المجموعات. DBSCAN أفضل للبيانات ذات الأشكال المعقدة والضوضاء. لكنه حساس لمعامل eps." }
        ]}
      ]
    },
    {
      id: "unit-ai-27", stageId: "stage-5", unitNumber: 27,
      title: "هندسة السمات — Feature Engineering",
      description: "الترميز، القياس، سمات التفاعل، اختيار السمات.",
      difficulty: 3, estimatedHours: 4, tags: ["ml", "features"],
      content: [
        { type: "h1", content: "الوحدة 27: هندسة السمات" },
        { type: "p", content: "جودة المدخلات تحدد جودة النموذج أكثر من أي شيء آخر. هندسة السمات (Feature Engineering) هي فن تحويل البيانات الخام إلى إشارة يستطيع النموذج التعلم منها. Scikit-learn توفر: StandardScaler، OneHotEncoder، PolynomialFeatures، وSelectKBest." },
        { type: "code", language: "python", content: `from sklearn.preprocessing import StandardScaler, OneHotEncoder, PolynomialFeatures
from sklearn.compose import ColumnTransformer
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.pipeline import Pipeline

# بيانات مختلطة (رقمية + فئوية)
X_num = np.random.randn(100, 3)
X_cat = np.random.choice(['A', 'B', 'C'], (100, 2))
y = (X_num[:, 0] + X_num[:, 1] > 0).astype(int)

# ColumnTransformer — معالجة أنواع مختلفة معاً
preprocessor = ColumnTransformer([
    ('num', StandardScaler(), [0, 1, 2]),
    ('cat', OneHotEncoder(drop='first'), [3, 4])  # أعمدة فئوية
])

# Pipeline كامل
pipeline = Pipeline([
    ('features', PolynomialFeatures(degree=2, include_bias=False)),
    ('selection', SelectKBest(f_classif, k=10)),
    ('classifier', LogisticRegression(max_iter=1000))
])

from sklearn.model_selection import cross_val_score
X_combined = np.hstack([X_num, np.random.randint(0, 3, (100, 2)).astype(float)])
scores = cross_val_score(pipeline, X_combined, y, cv=5)
print(f"Pipeline CV accuracy: {scores.mean():.3f} ± {scores.std():.3f}")
print(f"\\n✓ Pipeline يطبق: Polynomial → Feature Selection → Classifier")
print(f"  كل هذا في سطر واحد!")` },

        { type: "active-recall", questions: [
          { q: "ما أهم تقنيات هندسة السمات؟", a: "① Scaling: StandardScaler (للبيانات الطبيعية)، MinMaxScaler (للشبكات العصبية). ② Encoding: OneHotEncoder (فئات غير مرتبة)، OrdinalEncoder (فئات مرتبة). ③ إنشاء سمات: PolynomialFeatures، تفاعلات (تفاعل متغيرين معاً). ④ اختيار السمات: SelectKBest، RFE، أهمية السمات من النموذج." }
        ]}
      ]
    },
    {
      id: "unit-ai-28", stageId: "stage-5", unitNumber: 28,
      title: "تقييم النماذج و Cross-Validation",
      description: "Metrics، استراتيجيات CV، ضبط المعاملات، منحنيات التعلم.",
      difficulty: 4, estimatedHours: 4, tags: ["ml", "evaluation"],
      content: [
        { type: "h1", content: "الوحدة 28: تقييم النماذج" },
        { type: "p", content: "دقة 95% قد تكون مضللة! إذا كانت 95% من بياناتك من فئة واحدة، فنموذج يقول دائماً 'الفئة الأكثر' ستكون دقته 95% — لكنه عديم الفائدة. التقييم الصحيح يستخدم مقاييس متعددة (precision, recall, F1, AUC-ROC) و Cross-Validation لتقدير موثوق للأداء." },
        { type: "code", language: "python", content: `from sklearn.model_selection import cross_validate, GridSearchCV
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, make_scorer)

# بيانات غير متوازنة
X, y = make_classification(n_samples=1000, weights=[0.9, 0.1], random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# نموذج بسيط
rf = RandomForestClassifier(random_state=42)

# Cross-validation مع مقاييس متعددة
scoring = {'accuracy': 'accuracy', 'precision': 'precision',
           'recall': 'recall', 'f1': 'f1', 'roc_auc': 'roc_auc'}
cv_results = cross_validate(rf, X_train, y_train, cv=5, scoring=scoring)

print("Cross-validation results:")
for metric in scoring:
    scores = cv_results[f'test_{metric}']
    print(f"  {metric:12s}: {scores.mean():.3f} ± {scores.std():.3f}")

# Grid Search — بحث عن أفضل معاملات
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [None, 10, 20],
    'min_samples_split': [2, 5]
}
grid = GridSearchCV(RandomForestClassifier(random_state=42), param_grid, cv=3, scoring='f1')
grid.fit(X_train, y_train)
print(f"\\nأفضل معاملات: {grid.best_params_}")
print(f"أفضل F1: {grid.best_score_:.3f}")
print(f"Test F1: {f1_score(y_test, grid.predict(X_test)):.3f}")` },

        { type: "active-recall", questions: [
          { q: "متى تستخدم precision ومتى recall؟", a: "Precision: من الذين قال عنهم النموذج 'موجب'، كم كانوا فعلاً موجبين؟ مهم عندما تكلفة false positive عالية (مثلاً: تصنيف بريد عادي كـ spam). Recall: من كل الحالات الموجبة، كم اكتشف النموذج؟ مهم عندما تكلفة false negative عالية (مثلاً: اكتشاف مرض — لا تريد تفويت حالة). F1 = المتوسط التوافقي = توازن بينهما." }
        ]}
      ]
    },
    {
      id: "unit-ai-29", stageId: "stage-5", unitNumber: 29,
      title: "خطوط إنتاج ML",
      description: "Pipeline، ColumnTransformer، FeatureUnion، joblib، ONNX.",
      difficulty: 4, estimatedHours: 4, tags: ["ml", "pipelines", "production"],
      content: [
        { type: "h1", content: "الوحدة 29: خطوط إنتاج التعلم الآلي" },
        { type: "p", content: "النموذج الجيد ليس كافياً — تحتاج طريقة موثوقة لنقله من Jupyter Notebook إلى الإنتاج. Scikit-learn Pipelines توفر ذلك: كل خطوات المعالجة والتدريب مغلفة في كائن واحد. joblib يحفظه. ONNX يصدره لأي لغة أو منصة. هذه هي الفجوة بين 'Data Scientist' و 'AI Engineer'." },
        { type: "code", language: "python", content: `from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import GradientBoostingClassifier
import joblib

# Pipeline إنتاجي كامل
numeric_features = ['age', 'salary', 'experience']
categorical_features = ['department', 'city']

numeric_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])
categorical_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

preprocessor = ColumnTransformer([
    ('num', numeric_transformer, numeric_features),
    ('cat', categorical_transformer, categorical_features)
])

full_pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('classifier', GradientBoostingClassifier(n_estimators=100, random_state=42))
])

# تدريب
X = pd.DataFrame({
    'age': [25, 30, np.nan, 28, 35],
    'salary': [50000, 60000, 55000, np.nan, 65000],
    'experience': [2, 5, 3, 4, 7],
    'department': ['هندسة', 'بيانات', 'هندسة', 'تسويق', 'بيانات'],
    'city': ['الرياض', 'جدة', 'الرياض', 'الدمام', 'جدة']
})
y = [1, 0, 1, 0, 1]

full_pipeline.fit(X, y)

# حفظ ونشر
joblib.dump(full_pipeline, 'model_pipeline.joblib')
print("✓ Pipeline محفوظ — جاهز للنشر!")

# تحميل واستخدام
loaded = joblib.load('model_pipeline.joblib')
prediction = loaded.predict(X)
print(f"Predictions: {prediction}")
print(f"\\n✓ نفس pipeline يعمل في التدريب والإنتاج — لا Data Leakage!")` },

        { type: "active-recall", questions: [
          { q: "لماذا Pipeline بدل تطبيق preprocessing يدوياً؟", a: "① يمنع Data Leakage: عند استخدام cross-validation، الـ scaler يُطبق فقط على training fold في كل مرة. ② تكرارية: نفس الكود في التدريب والإنتاج. ③ سهولة النشر: joblib.dump(pipeline, 'model.pkl') يحفظ كل شيء — preprocessing + model. ④ صيانة: أي تغيير في preprocessing يُطبق تلقائياً في كل مكان." }
        ]}
      ]
    }
  ]
};
