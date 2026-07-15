import { useLocation } from 'wouter';
import { Beaker, ArrowLeft, Trash2 } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { StarterPicker } from '@/components/lab/StarterPicker';
import { createProject, listProjects, deleteProject } from '@/lib/lab/projectManager';

/**
 * Lab landing page. Shows:
 *  - Hero with a one-line description
 *  - Starter gallery (cards for each StarterProject)
 *  - Recently-opened projects (only if any exist)
 *
 * Clicking a card creates a fresh project, persists it to localStorage,
 * and routes to the appropriate LabWorkspacePage or LabProjectPage.
 */
export default function LabPage() {
  const [, navigate] = useLocation();
  const recents = listProjects().slice(0, 6);

  const handleEmpty = () => {
    const p = createProject({
      name: 'مشروع فارغ',
      language: 'javascript',
      mode: 'workspace',
      starterCode: `console.log('مرحبا من Smart Code Lab!');\n`,
    });
    navigate(`/lab/workspace/${p.id}`);
  };

  return (
    <Shell>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Beaker className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-primary">مختبر Smart Code</h1>
            <p className="text-muted-foreground mt-1">
              بيئة احترافية للتجريب والتعلّم. محرّر Monaco كامل المزايا، تشغيل حقيقي لـ JavaScript و Python (Pyodide)، معاينة HTML حيّة، استيراد/تصدير ZIP، وحفظ تلقائي لكل مشاريعك.
            </p>
          </div>
        </header>

        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3">ابدأ من قالب جاهز</h2>
          <StarterPicker onPickEmpty={handleEmpty} />
        </section>

        {recents.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold">آخر مشاريعك</h2>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recents.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/30">
                  <button
                    className="flex-1 text-start min-w-0"
                    onClick={() => navigate(p.mode === 'project' ? `/lab/project/${p.id}` : `/lab/workspace/${p.id}`)}
                  >
                    <div className="font-bold truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {p.mode === 'project' ? 'مشروع متعدد الملفات' : 'مساحة عمل'} · {p.language} · {p.files.length} ملف
                    </div>
                  </button>
                  <button
                    onClick={() => { deleteProject(p.id); navigate('/lab'); }}
                    className="p-1.5 rounded hover:bg-accent text-muted-foreground"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold mb-3">تمارين موجَّهة</h2>
          <p className="text-sm text-muted-foreground mb-3">
            تمارين قصيرة بمهمّة واضحة، مع كود المعلّم الذي يمكنك كشفه عند الحاجة.
          </p>
          <a
            href="#/lab/guided"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> تصفّح التمارين الموجَّهة
          </a>
        </section>
      </div>
    </Shell>
  );
}
