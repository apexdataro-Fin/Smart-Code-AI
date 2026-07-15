import { Shell } from "@/components/Shell";
import { appendixPage } from "@/data/appendix";
import type { AppendixSection } from "@/data/appendix";
import { ContentRenderer } from "@/components/Renderer";

function SectionRenderer({ section }: { section: AppendixSection }) {
  if (section.type === "table" && section.rows && section.headers) {
    return (
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm text-right">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
            <tr>
              {section.headers.map((h, i) => <th key={i} className="px-6 py-4">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {section.rows.map((row, i) => (
              <tr key={i} className="bg-card hover:bg-muted/30">
                {row.map((cell, j) => (
                  <td key={j} className={`px-6 py-4 ${j === 0 ? 'font-mono font-bold' : ''}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (section.type === "code" && section.language && section.content) {
    return (
      <div className="my-6 rounded-lg overflow-hidden border border-border bg-[#1d1f21] shadow-sm" dir="ltr">
        <div className="p-4 overflow-x-auto text-sm font-mono text-left">
          <pre className={`language-${section.language} !m-0 !p-0 !bg-transparent`}>
            <code className={`language-${section.language}`}>{section.content}</code>
          </pre>
        </div>
      </div>
    );
  }

  if (section.type === "content" && section.nodes) {
    return <ContentRenderer nodes={section.nodes} />;
  }

  return null;
}

export default function AppendixPage() {
  return (
    <Shell>
      <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in duration-500">
        <h1 className="text-4xl font-black text-primary mb-4">{appendixPage.title}</h1>
        <p className="text-xl text-muted-foreground mb-12">{appendixPage.description}</p>

        <div className="space-y-16">
          {appendixPage.sections.map((section, idx) => (
            <div key={idx} className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                {section.title}
              </h2>
              <SectionRenderer section={section} />
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
