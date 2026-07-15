import { StageDef } from './types';

export const stage12MLOps: StageDef = {
  id: "stage-12",
  stageNumber: 12,
  title: "MLOps & Deployment — النشر والإنتاج",
  description: "من النموذج إلى الإنتاج — FastAPI، Docker، سحابة، مراقبة، CI/CD.",
  units: [
    {
      id: "unit-ai-68", stageId: "stage-12", unitNumber: 68,
      title: "FastAPI لنشر النماذج",
      description: "API design, async inference, batching, streaming.",
      difficulty: 3, estimatedHours: 4, tags: ["deployment", "fastapi"],
      content: [
        { type: "h1", content: "الوحدة 68: FastAPI لنشر النماذج" },
        { type: "p", content: "النموذج المدرب بلا API = لا قيمة له في الإنتاج. FastAPI هو أفضل إطار لبناء APIs للنماذج: سريع (async)، كتابة تلقائية للتوثيق (OpenAPI/Swagger)، التحقق من الأنواع (Pydantic). في 10 أسطر تبني endpoint تستقبل بيانات وترجع تنبؤات. هذه هي الخطوة الأولى في MLOps." },
        { type: "code", language: "python", content: `from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI(title="ML Model API", version="1.0")

# تحميل النموذج عند بدء التشغيل
model = joblib.load("model_pipeline.joblib")

class PredictionRequest(BaseModel):
    features: list[float]
    
class PredictionResponse(BaseModel):
    prediction: int
    probability: float
    model_version: str = "1.0"

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """توقع من مدخلات"""
    X = np.array(request.features).reshape(1, -1)
    pred = model.predict(X)[0]
    proba = model.predict_proba(X)[0].max()
    return PredictionResponse(
        prediction=int(pred),
        probability=float(proba)
    )

@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": model is not None}

# تشغيل: uvicorn app:app --host 0.0.0.0 --port 8000
print("✓ FastAPI: توثيق تلقائي في /docs")
print("  اختبار: curl -X POST localhost:8000/predict -d '{\"features\":[1,2,3,4,5]}'")` }
      ]
    },
    {
      id: "unit-ai-69", stageId: "stage-12", unitNumber: 69,
      title: "Docker والحاويات",
      description: "Dockerfiles, multi-stage builds, GPU containers.",
      difficulty: 3, estimatedHours: 4, tags: ["deployment", "docker"],
      content: [
        { type: "h1", content: "الوحدة 69: Docker والحاويات" },
        { type: "p", content: "'يعمل على جهازي' ليست جملة مقبولة في الإنتاج. Docker يحزم كل شيء — النموذج، المكتبات، التبعيات — في حاوية (Container) تعمل بنفس الشكل في أي مكان. Multi-stage builds تبقي الصورة النهائية صغيرة (بدون أدوات التطوير). GPU containers تستخدم nvidia-docker للوصول للكرت." },
        { type: "code", language: "dockerfile", title: "Dockerfile لنموذج ML", content: `# Multi-stage build
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11 /usr/local/lib/python3.11
COPY . .
COPY model_pipeline.joblib /app/model/

EXPOSE 8000
HEALTHCHECK CMD curl --fail http://localhost:8000/health || exit 1
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]` },
        { type: "code", language: "yaml", title: "docker-compose.yml", content: `version: '3.8'
services:
  model-api:
    build: .
    ports: ["8000:8000"]
    environment:
      - MODEL_PATH=/app/model/model_pipeline.joblib
    restart: unless-stopped
  prometheus:
    image: prom/prometheus
    ports: ["9090:9090"]
  grafana:
    image: grafana/grafana
    ports: ["3000:3000"]` }
      ]
    },
    {
      id: "unit-ai-70", stageId: "stage-12", unitNumber: 70,
      title: "تحسين النماذج — Quantization, ONNX, TensorRT",
      description: "Quantization, pruning, distillation, ONNX, TensorRT.",
      difficulty: 5, estimatedHours: 5, tags: ["deployment", "optimization"],
      content: [
        { type: "h1", content: "الوحدة 70: تحسين النماذج" },
        { type: "p", content: "النموذج في الإنتاج يحتاج أن يكون: سريعاً (latency منخفضة)، خفيفاً (حجم صغير)، وفعالاً (تكلفة أقل). Quantization: تخفيض دقة الأوزان من float32 إلى int8 — النموذج يصبح أصغر 4x وأسرع 2-4x مع خسارة دقة طفيفة. ONNX: صيغة موحدة للتشغيل على أي منصة. TensorRT: تحسين NVIDIA الأقصى." },
        { type: "code", language: "python", content: `import torch

# Quantization — نموذج أصغر وأسرع
model = DeepNet(20, 128, 2)
model.eval()

# Dynamic Quantization (الأسهل)
model_quantized = torch.quantization.quantize_dynamic(
    model, {torch.nn.Linear}, dtype=torch.qint8
)

# مقارنة الحجم
import io
def get_size(m):
    buf = io.BytesIO(); torch.save(m.state_dict(), buf)
    return buf.tell() / 1024

print(f"Float32: {get_size(model):.0f} KB")
print(f"Int8:    {get_size(model_quantized):.0f} KB")
print(f"توفير: {(1 - get_size(model_quantized)/get_size(model))*100:.0f}%")

# ONNX Export
# torch.onnx.export(model, dummy_input, "model.onnx")
print(f"\\n✓ استراتيجيات التحسين:")
print(f"  Quantization: أصغر 4x وأسرع 2-4x")
print(f"  ONNX: تشغيل في أي لغة (C++, Java, JS)")
print(f"  TensorRT: أقصى أداء على NVIDIA GPUs")
print(f"  Distillation: نموذج صغير يتعلم من نموذج كبير")` }
      ]
    },
    {
      id: "unit-ai-71", stageId: "stage-12", unitNumber: 71,
      title: "النشر السحابي",
      description: "AWS/GCP/Azure, serverless inference, GPU instances.",
      difficulty: 4, estimatedHours: 4, tags: ["deployment", "cloud"],
      content: [
        { type: "h1", content: "الوحدة 71: النشر السحابي" },
        { type: "p", content: "النشر السحابي يوفر: قابلية التوسع التلقائية (Auto-scaling)، موازنة الأحمال (Load Balancing)، إدارة البنية التحتية. خياراتك: ① Serverless (AWS Lambda, Cloud Run) — مثالي للـ APIs البسيطة، ② Container Services (ECS, GKE) — مرونة كاملة، ③ Managed ML (SageMaker, Vertex AI) — من التدريب للنشر." },
        { type: "code", language: "python", content: `# مقارنة خيارات النشر
cloud_options = {
    "AWS SageMaker": "تدريب + نشر + مراقبة — حل متكامل",
    "GCP Vertex AI": "منافس SageMaker مع Gemini integration",
    "HuggingFace Inference Endpoints": "نشر بنقرة واحدة — الأسهل",
    "Modal / Banana / Replicate": "نشر serverless لنماذج GPU",
    "Self-hosted (Docker + VPS)": "تحكم كامل، تكلفة أقل للاستخدام المستمر",
}

print("خيارات النشر السحابي:")
for option, desc in cloud_options.items():
    print(f"  • {option}: {desc}")

print(f"\\n✓ القاعدة:")
print(f"  MVP / اختبار → HuggingFace Spaces أو Replicate")
print(f"  إنتاج صغير → Cloud Run + Docker")
print(f"  إنتاج كبير → SageMaker / Vertex AI")
print(f"  تحكم كامل → Kubernetes + GPU nodes")` }
      ]
    },
    {
      id: "unit-ai-72", stageId: "stage-12", unitNumber: 72,
      title: "المراقبة والملاحظة",
      description: "Drift detection, performance monitoring, logging, alerting.",
      difficulty: 4, estimatedHours: 4, tags: ["mlops", "monitoring"],
      content: [
        { type: "h1", content: "الوحدة 72: المراقبة والملاحظة" },
        { type: "p", content: "النموذج في الإنتاج يتحلل (degrade) مع الوقت — لأن البيانات تتغير (Data Drift). تحتاج مراقبة مستمرة: ① توزيع المدخلات (هل البيانات الجديدة مختلفة؟)، ② دقة التنبؤات (هل الأداء يتراجع؟)، ③ latency و throughput (هل الخدمة سريعة؟). Prometheus + Grafana = المعيار الذهبي للمراقبة." },
        { type: "code", language: "python", content: `# مراقبة Data Drift
from scipy import stats
import numpy as np

class DriftDetector:
    def __init__(self, reference_data):
        self.reference = np.array(reference_data)
    
    def detect(self, new_data, threshold=0.05):
        """Kolmogorov-Smirnov test للكشف عن drift"""
        new = np.array(new_data)
        statistic, p_value = stats.ks_2samp(self.reference, new)
        drift_detected = p_value < threshold
        return {
            "drift_detected": drift_detected,
            "p_value": p_value,
            "statistic": statistic,
        }

# محاكاة
ref_data = np.random.normal(0, 1, 1000)
new_normal = np.random.normal(0, 1, 1000)     # لا drift
new_drifted = np.random.normal(1, 2, 1000)     # drift!

detector = DriftDetector(ref_data)
print(f"No drift:    {detector.detect(new_normal)['drift_detected']}")
print(f"Drift:       {detector.detect(new_drifted)['drift_detected']}")

# أدوات المراقبة الأساسية
print(f"\\n✓ أدوات المراقبة:")
print(f"  Prometheus + Grafana: مقاييس + لوحات تحكم")
print(f"  Evidently AI: تقارير drift وتقييم النموذج")
print(f"  WhyLabs: مراقبة ML متكاملة")
print(f"  Arize / Fiddler: مراقبة ML للمؤسسات")` }
      ]
    },
    {
      id: "unit-ai-73", stageId: "stage-12", unitNumber: 73,
      title: "CI/CD لـ ML",
      description: "Model versioning, experiment tracking, automated testing, DVC.",
      difficulty: 4, estimatedHours: 4, tags: ["mlops", "cicd"],
      content: [
        { type: "h1", content: "الوحدة 73: CI/CD لـ ML" },
        { type: "p", content: "CI/CD في ML أكثر تعقيداً من البرمجة العادية: تحتاج تتبع البيانات (DVC)، تتبع التجارب (MLflow/W&B)، اختبار النموذج آلياً، ونشر النموذج الجديد تلقائياً إذا كان أفضل. ML Pipeline الآلي = نموذج جديد يصل للإنتاج في دقائق بدل أسابيع." },
        { type: "code", language: "yaml", title: ".github/workflows/ml-pipeline.yml", content: `name: ML Pipeline
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # كل أحد

jobs:
  train-and-evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: {python-version: '3.11'}
      - run: pip install -r requirements.txt
      - run: python train.py
      - run: python evaluate.py
      - name: Compare with production
        run: python scripts/compare_models.py
      - name: Deploy if better
        if: success()
        run: python scripts/deploy_model.py` },
        { type: "code", language: "python", content: `# أدوات ML Pipeline
print("MLOps Stack:")
print("  • DVC: Version control للبيانات والنماذج")
print("  • MLflow: تتبع التجارب + Model Registry")
print("  • Weights & Biases: تتبع التجارب (الأفضل للفرق)")
print("  • GitHub Actions / Jenkins: CI/CD")
print("  • Great Expectations: اختبار جودة البيانات")
print(f"\\n✓ الهدف: من commit → إلى الإنتاج تلقائياً")
print(f"  إذا النموذج الجديد أفضل: يُنشر تلقائياً")
print(f"  إذا أسوأ: يُرفض مع تقرير تلقائي")` }
      ]
    }
  ]
};
