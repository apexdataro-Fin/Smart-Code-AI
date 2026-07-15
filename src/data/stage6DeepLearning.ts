import { StageDef } from './types';

export const stage6DeepLearning: StageDef = {
  id: "stage-6",
  stageNumber: 6,
  title: "Deep Learning — التعلم العميق",
  description: "بناء وتدريب الشبكات العصبية باستخدام PyTorch — من المعادلة إلى النموذج.",
  units: [
    {
      id: "unit-ai-30", stageId: "stage-6", unitNumber: 30,
      title: "Tensors & Computation Graphs",
      description: "عمليات الموترات، GPU، آلية autograd — من NumPy لـ PyTorch.",
      difficulty: 3, estimatedHours: 4, tags: ["pytorch", "tensors"],
      content: [
        { type: "h1", content: "الوحدة 30: الموترات ورسوم الحساب البيانية" },
        { type: "p", content: "PyTorch هي لغة التعلم العميق. الموتر (Tensor) مثل مصفوفة NumPy لكنه يمكن أن يعيش على GPU ويتتبع العمليات لحساب المشتقات تلقائياً. Computation Graph هي الشجرة التي تسجل كل العمليات — وعند استدعاء .backward()، تحسب المشتقات لكل عقدة تلقائياً. هذا هو سحر PyTorch." },
        { type: "code", language: "python", content: `import torch
import torch.nn as nn
import numpy as np

# Tensor = NumPy array + GPU + Autograd
x = torch.tensor([[1., 2.], [3., 4.]], requires_grad=True)
print(f"Tensor:\\n{x}")
print(f"Shape: {x.shape}, Device: {x.device}, Grad: {x.requires_grad}")

# العمليات تبني Computation Graph
y = (x ** 2).sum()  # y = 1² + 2² + 3² + 4² = 30
print(f"\\ny = {y.item()}")
print(f"grad_fn: {y.grad_fn}")  # <SumBackward0>

# backward() يحسب المشتقة تلقائياً!
y.backward()
print(f"\\n∂y/∂x:\\n{x.grad}")  # [[2, 4], [6, 8]] = 2*x

# GPU — انقل للكرت إذا كان متاحاً
if torch.cuda.is_available():
    x_gpu = x.cuda()
    print(f"\\n✓ على GPU: {x_gpu.device}")
else:
    print(f"\\n(لا يوجد GPU في هذه البيئة، لكن الكود جاهز!)")

# NumPy ↔ PyTorch
np_arr = np.array([[1., 2.], [3., 4.]])
torch_tensor = torch.from_numpy(np_arr)
back_to_np = torch_tensor.numpy()
print(f"\\nNumPy → PyTorch → NumPy: {back_to_np}")
print(f"مشاركة الذاكرة: {np.shares_memory(np_arr, back_to_np)}")` },

        { type: "h2", content: "لماذا PyTorch؟" },
        { type: "mermaid", content: "graph LR\n  D[\"بيانات\"] --> T[\"موتر PyTorch\"]\n  T --> M[\"نموذج nn.Module\"]\n  M --> L[\"Loss\"]\n  L --> B[\"loss.backward\"]\n  B --> O[\"optimizer.step\"]\n  O --> M\n  style T fill:#e3f2fd\n  style M fill:#fff9c4\n  style L fill:#ffcdd2\n  style B fill:#c8e6c9", caption: "دورة تدريب PyTorch" },
        { type: "active-recall", questions: [
          { q: "ما الفرق بين Tensor و NumPy array؟", a: "Tensor: ① يمكن العيش على GPU (.cuda()) — NumPy دائماً CPU. ② يدعم autograd (requires_grad=True) — تتبع العمليات وحساب المشتقات تلقائياً. ③ واجهة متشابهة جداً لـ NumPy (تعمد مطابقتها). NumPy للبيانات والمعالجة، PyTorch Tensor للتدريب والنماذج." }
        ]}
      ]
    },
    {
      id: "unit-ai-31", stageId: "stage-6", unitNumber: 31,
      title: "الشبكات العصبية من الصفر",
      description: "Forward/Backward يدوي، طبقات، دوال تنشيط — بناء شبكة يدوياً.",
      difficulty: 4, prerequisites: ["unit-ai-30"], estimatedHours: 4, tags: ["pytorch", "nn"],
      content: [
        { type: "h1", content: "الوحدة 31: الشبكات العصبية من الصفر" },
        { type: "p", content: "قبل استخدام nn.Linear و nn.Sequential الجاهزة، يجب أن تبني شبكة بيديك. هذا يعطيك فهماً عميقاً: كيف تتدفق البيانات، كيف تُحسب المشتقات، وكيف تُحدث الأوزان. هذه المعرفة هي ما يميز مهندس AI عن مجرد 'مستخدم PyTorch'." },
        { type: "code", language: "python", content: `import torch
import torch.nn as nn

# ═══ بناء شبكة من الصفر (No nn.Module) ═══
# شبكة: input(2) → hidden(3) → output(1)
torch.manual_seed(42)
n_input, n_hidden, n_output = 2, 3, 1

# أوزان وانحيازات — هذه ما سيتعلمه النموذج
W1 = torch.randn(n_input, n_hidden, requires_grad=True)
b1 = torch.zeros(n_hidden, requires_grad=True)
W2 = torch.randn(n_hidden, n_output, requires_grad=True)
b2 = torch.zeros(n_output, requires_grad=True)

def model(x):
    h = torch.relu(x @ W1 + b1)     # طبقة مخفية + ReLU
    return torch.sigmoid(h @ W2 + b2)  # مخرج + Sigmoid

# بيانات
X = torch.tensor([[0., 0.], [0., 1.], [1., 0.], [1., 1.]])
y = torch.tensor([[0.], [1.], [1.], [0.]])  # XOR

# تدريب
lr = 0.5
for epoch in range(2000):
    y_pred = model(X)
    loss = ((y_pred - y) ** 2).mean()  # MSE
    loss.backward()
    
    # تحديث يدوي (بدون optimizer)
    with torch.no_grad():
        W1 -= lr * W1.grad; b1 -= lr * b1.grad
        W2 -= lr * W2.grad; b2 -= lr * b2.grad
        W1.grad.zero_(); b1.grad.zero_()
        W2.grad.zero_(); b2.grad.zero_()
    
    if epoch % 500 == 0:
        print(f"Epoch {epoch:4d} | Loss: {loss.item():.4f}")

print(f"\\n✓ XOR solved! After training:")
with torch.no_grad():
    preds = model(X)
    for i in range(4):
        print(f"  {X[i].tolist()} → {preds[i].item():.4f} → {preds[i].round().item():.0f}")` },

        { type: "h2", content: "nn.Module — الطريقة الصحيحة" },
        { type: "code", language: "python", content: `# ═══ نفس الشبكة لكن بـ nn.Module ═══
class XORNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(2, 3)
        self.fc2 = nn.Linear(3, 1)
    
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        return torch.sigmoid(self.fc2(x))

model = XORNet()
criterion = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.5)

for epoch in range(2000):
    optimizer.zero_grad()
    loss = criterion(model(X), y)
    loss.backward()
    optimizer.step()

print(f"nn.Module Loss: {loss.item():.6f}")
print(f"✓ نفس النتيجة — كود أنظف بكثير!")` }
      ]
    },
    {
      id: "unit-ai-32", stageId: "stage-6", unitNumber: 32,
      title: "تدريب الشبكات العميقة",
      description: "Optimizers، schedulers، regularization، batch norm، dropout.",
      difficulty: 4, prerequisites: ["unit-ai-31"], estimatedHours: 4, tags: ["pytorch", "training"],
      content: [
        { type: "h1", content: "الوحدة 32: تدريب الشبكات العميقة" },
        { type: "p", content: "بناء الشبكة سهل — تدريبها هو التحدي. تحتاج: optimizer جيد (Adam هو default)، learning rate scheduler (يقلل lr تدريجياً)، regularization (يمنع overfitting)، batch normalization (يسرع التدريب). كل هذه القطع تعمل معاً لتنتج نموذجاً يتعلم بفعالية." },
        { type: "code", language: "python", content: `class DeepNet(nn.Module):
    def __init__(self, in_dim, hidden, out_dim, dropout=0.3):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, hidden), nn.BatchNorm1d(hidden), nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden, hidden), nn.BatchNorm1d(hidden), nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden, out_dim)
        )
    
    def forward(self, x):
        return self.net(x)

# مجموعة أدوات التدريب الكاملة
model = DeepNet(20, 128, 2)
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-4)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=100)

# بيانات
X = torch.randn(500, 20)
y = (X[:, 0] + X[:, 1] > 0).long()

# حلقة تدريب احترافية
model.train()
for epoch in range(100):
    optimizer.zero_grad()
    output = model(X)
    loss = criterion(output, y)
    loss.backward()
    optimizer.step()
    scheduler.step()
    
    if epoch % 25 == 0:
        acc = (output.argmax(1) == y).float().mean()
        print(f"Epoch {epoch:3d} | Loss: {loss:.4f} | Acc: {acc:.3f} | LR: {scheduler.get_last_lr()[0]:.6f}")

print(f"\\n✓ تدريب كامل مع: Adam + CosineAnnealing + BatchNorm + Dropout + WeightDecay")` },

        { type: "callout", calloutType: "ai-tip", title: "وصفة التدريب الناجح", content: [
          { type: "p", content: "① دائماً ابدأ بـ Adam (lr=1e-3). ② أضف BatchNorm بعد كل Linear (قبل activation). ③ Dropout (0.2-0.5) لمنع overfitting. ④ Weight decay (1e-4) كـ regularization إضافي. ⑤ CosineAnnealing أو ReduceLROnPlateau لتقليل lr تلقائياً. ⑥ هذه 'الوصفة' تعمل على 90% من المشاكل!" }
        ]}
      ]
    },
    {
      id: "unit-ai-33", stageId: "stage-6", unitNumber: 33,
      title: "الشبكات الالتفافية — CNN",
      description: "الالتفاف بصرياً، المعماريات، transfer learning، data augmentation.",
      difficulty: 4, prerequisites: ["unit-ai-32"], estimatedHours: 4, tags: ["pytorch", "cnn"],
      content: [
        { type: "h1", content: "الوحدة 33: الشبكات الالتفافية" },
        { type: "p", content: "CNN هي أساس الرؤية الحاسوبية: كشف الكائنات، التعرف على الوجوه، التصوير الطبي. فكرة الالتفاف (Convolution): نافذة صغيرة تنزلق على الصورة، تبحث عن أنماط (حواف، زوايا، أشكال). الطبقات الأولى تتعلم حواف بسيطة، والطبقات العميقة تتعلم أشكالاً معقدة (عيون، عجلات)." },
        { type: "code", language: "python", content: `class SimpleCNN(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1), nn.BatchNorm2d(32), nn.ReLU(),
            nn.MaxPool2d(2),  # 32×32 → 16×16
            nn.Conv2d(32, 64, 3, padding=1), nn.BatchNorm2d(64), nn.ReLU(),
            nn.MaxPool2d(2),  # 16×16 → 8×8
            nn.Conv2d(64, 128, 3, padding=1), nn.BatchNorm2d(128), nn.ReLU(),
            nn.AdaptiveAvgPool2d((1, 1))  # → 128×1×1
        )
        self.classifier = nn.Linear(128, num_classes)
    
    def forward(self, x):
        x = self.features(x)
        x = x.flatten(1)
        return self.classifier(x)

model = SimpleCNN()
x = torch.randn(2, 3, 32, 32)  # 2 صورة، 3 قنوات، 32×32
print(f"Input: {x.shape}")
print(f"Output: {model(x).shape}")
print(f"Parameters: {sum(p.numel() for p in model.parameters()):,}")

# Transfer Learning — الأهم في الممارسة
print(f"\\n✓ في الواقع: استخدم ResNet/EfficientNet مُدرّب مسبقاً!")
print(f"  model = torchvision.models.resnet50(pretrained=True)")
print(f"  model.fc = nn.Linear(model.fc.in_features, num_classes)")` }
      ]
    },
    {
      id: "unit-ai-34", stageId: "stage-6", unitNumber: 34,
      title: "الشبكات المتكررة — RNN/LSTM",
      description: "RNN، LSTM، GRU، نمذجة التسلسلات.",
      difficulty: 4, prerequisites: ["unit-ai-32"], estimatedHours: 4, tags: ["pytorch", "rnn", "lstm"],
      content: [
        { type: "h1", content: "الوحدة 34: الشبكات المتكررة" },
        { type: "p", content: "CNN للصور، RNN للتسلسلات: نصوص، صوت، سلاسل زمنية. الفكرة: الشبكة تحتفظ بـ 'ذاكرة' (hidden state) تنتقل من خطوة لأخرى. LSTM و GRU تحلان مشكلة 'النسيان' في RNN التقليدية — تستطيعان تذكر المعلومات المهمة لمسافات طويلة." },
        { type: "code", language: "python", content: `class SentimentLSTM(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim, num_classes):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, num_layers=2, 
                            bidirectional=True, batch_first=True, dropout=0.3)
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim * 2, hidden_dim), nn.ReLU(), nn.Dropout(0.3),
            nn.Linear(hidden_dim, num_classes)
        )
    
    def forward(self, x):
        x = self.embedding(x)           # (batch, seq_len, embed_dim)
        _, (hidden, _) = self.lstm(x)   # hidden: (4, batch, hidden_dim)
        hidden = torch.cat((hidden[-2], hidden[-1]), dim=1)  # bidirectional
        return self.classifier(hidden)

print("✓ LSTM للتصنيف — تحليل المشاعر مثلاً")
print("  ملاحظة: اليوم Transformers استبدلت LSTMs في معظم مهام NLP")
print("  لكن LSTMs لا تزال مهمة للسلاسل الزمنية والأنظمة المضمنة")` }
      ]
    },
    {
      id: "unit-ai-35", stageId: "stage-6", unitNumber: 35,
      title: "معمارية Transformers",
      description: "Self-attention، multi-head، positional encoding — قلب الثورة الحديثة.",
      difficulty: 5, prerequisites: ["unit-ai-34"], estimatedHours: 5, tags: ["pytorch", "transformers"],
      content: [
        { type: "h1", content: "الوحدة 35: معمارية Transformers" },
        { type: "p", content: "Transformers هي أهم ابتكار في AI منذ decade. Attention — 'الانتباه' — يسمح لكل كلمة في الجملة بالنظر إلى كل الكلمات الأخرى في آن واحد، على عكس RNN التي تعالج كلمة كلمة. هذا مكّن النماذج من فهم السياق الطويل وأنتج ChatGPT و GPT-4 وكل LLMs الحديثة." },
        { type: "code", language: "python", content: `class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, n_heads):
        super().__init__()
        assert d_model % n_heads == 0
        self.d_k = d_model // n_heads
        self.n_heads = n_heads
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
    
    def forward(self, x):
        B, T, D = x.shape  # batch, seq_len, d_model
        
        # Q, K, V
        Q = self.W_q(x).view(B, T, self.n_heads, self.d_k).transpose(1, 2)
        K = self.W_k(x).view(B, T, self.n_heads, self.d_k).transpose(1, 2)
        V = self.W_v(x).view(B, T, self.n_heads, self.d_k).transpose(1, 2)
        
        # Scaled Dot-Product Attention
        scores = (Q @ K.transpose(-2, -1)) / (self.d_k ** 0.5)
        attn = torch.softmax(scores, dim=-1)
        out = attn @ V
        
        # Concatenate heads
        out = out.transpose(1, 2).contiguous().view(B, T, D)
        return self.W_o(out)

# قلب Transformer — من الصفر!
x = torch.randn(2, 10, 512)  # 2 sentences, 10 tokens, 512 dims
mha = MultiHeadAttention(512, 8)
out = mha(x)
print(f"Multi-Head Attention: {x.shape} → {out.shape}")
print(f"✓ هذا هو قلب ChatGPT! الباقي تفاصيل.")` },

        { type: "callout", calloutType: "note", title: "Attention Is All You Need", content: [
          { type: "p", content: "ورقة 2017: 'Attention Is All You Need' غيرت العالم. Self-attention = كل كلمة تسأل: 'ما الكلمات الأخرى المهمة لفهمي؟'. Multi-head = عدة 'مناظير' للانتباه في آن واحد. Positional encoding = إخبار النموذج بموقع كل كلمة (لأنه لا يوجد ترتيب طبيعي)." }
        ]}
      ]
    },
    {
      id: "unit-ai-36", stageId: "stage-6", unitNumber: 36,
      title: "PyTorch Lightning وأفضل الممارسات",
      description: "تغليف حلقة التدريب، logging، checkpointing، reproducibility.",
      difficulty: 3, prerequisites: ["unit-ai-32"], estimatedHours: 3, tags: ["pytorch", "lightning"],
      content: [
        { type: "h1", content: "الوحدة 36: أفضل ممارسات PyTorch" },
        { type: "p", content: "حلقة التدريب اليدوية جيدة للتعلم، لكن المشاريع الحقيقية تحتاج: حفظ checkpoints، early stopping، logging، mixed precision training، وتكرارية. PyTorch Lightning تغلف كل هذا في هيكل منظم دون أن تخفي مرونة PyTorch." },
        { type: "code", language: "python", content: `# أفضل الممارسات بدون Lightning
import torch.amp  # mixed precision

def train_epoch(model, dataloader, optimizer, criterion, scaler, device):
    model.train()
    total_loss = 0
    for X_batch, y_batch in dataloader:
        X_batch, y_batch = X_batch.to(device), y_batch.to(device)
        optimizer.zero_grad()
        
        # Mixed Precision — أسرع 2x على GPUs حديثة
        with torch.amp.autocast('cuda'):
            output = model(X_batch)
            loss = criterion(output, y_batch)
        
        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()
        total_loss += loss.item()
    return total_loss / len(dataloader)

# Reproducibility
torch.manual_seed(42)
torch.backends.cudnn.deterministic = True
torch.backends.cudnn.benchmark = False

print("✓ Mixed Precision + Reproducibility")
print("  Lightning: نفس الكود لكن بـ Trainer.fit() فقط!")` }
      ]
    },
    {
      id: "unit-ai-37", stageId: "stage-6", unitNumber: 37,
      title: "PyTorch المتقدم",
      description: "Custom datasets، mixed precision، Distributed Training، TorchScript.",
      difficulty: 5, prerequisites: ["unit-ai-36"], estimatedHours: 4, tags: ["pytorch", "advanced"],
      content: [
        { type: "h1", content: "الوحدة 37: PyTorch المتقدم" },
        { type: "p", content: "للوصول لمستوى الإنتاج، تحتاج: Custom Datasets (لأي نوع بيانات)، Distributed Training (تدريب على عدة GPUs)، TorchScript (لتحسين سرعة inference)، و Quantization (لتقليل حجم النموذج 4x)." },
        { type: "code", language: "python", content: `from torch.utils.data import Dataset, DataLoader

class CustomDataset(Dataset):
    def __init__(self, data_path):
        self.data = np.load(data_path)['features']
        self.labels = np.load(data_path)['labels']
    
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        return torch.tensor(self.data[idx], dtype=torch.float32), torch.tensor(self.labels[idx])

# DDP — تدريب موزع
# torchrun --nproc_per_node=4 train.py
# model = nn.parallel.DistributedDataParallel(model)

# Quantization — نموذج أصغر 4x
# model_int8 = torch.quantization.quantize_dynamic(model, {nn.Linear}, dtype=torch.qint8)

print("✓ أدوات الإنتاج: Custom Datasets + DDP + Quantization + TorchScript")
print("  هذه هي أدوات مهندس AI الذي ينشر نماذج في الإنتاج.")` }
      ]
    }
  ]
};
