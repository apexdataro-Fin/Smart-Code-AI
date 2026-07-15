import { Shell } from "@/components/Shell";
import { capstonePage } from "@/data/capstone";
import { ContentRenderer } from "@/components/Renderer";

export default function CapstonePage() {
  return (
    <Shell>
      <div className="max-w-3xl mx-auto px-6 py-12 animate-in fade-in duration-500">
        <div className="mb-12 text-center">
          <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wider mb-6 border border-primary/20">
            تتويج المسار
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            {capstonePage.title}
          </h1>
          <p className="text-xl text-muted-foreground">
            {capstonePage.description}
          </p>
        </div>

        <div className="prose dark:prose-invert prose-lg max-w-none text-foreground/90 bg-card p-8 rounded-2xl border border-border shadow-sm">
          <ContentRenderer nodes={capstonePage.content} />
        </div>

        <div className="mt-12 text-center text-muted-foreground p-8 border-2 border-dashed border-border rounded-xl">
          <p className="font-bold text-xl text-foreground mb-2">🎓 تهانينا!</p>
          <p>بوصولك إلى هنا وإتمامك لهذا المشروع، أنت الآن جاهز لبدء مسيرتك كمهندس برمجيات محترف.</p>
        </div>
      </div>
    </Shell>
  );
}
