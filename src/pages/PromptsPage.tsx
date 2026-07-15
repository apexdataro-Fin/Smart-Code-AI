import { Shell } from "@/components/Shell";
import { promptsPage } from "@/data/prompts";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function PromptsPage() {
  return (
    <Shell>
      <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in duration-500">
        <div className="text-center mb-16">
          <div className="text-6xl mb-4">🤖</div>
          <h1 className="text-4xl font-black text-foreground mb-4">{promptsPage.title}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{promptsPage.description}</p>
        </div>

        <div className="space-y-12">
          {promptsPage.prompts.map((category, idx) => (
            <div key={idx} className="space-y-6">
              <h2 className="text-2xl font-bold text-primary border-b border-primary/20 pb-2 inline-block">
                {category.category}
              </h2>
              <div className="grid gap-6">
                {category.items.map((item, i) => (
                  <PromptCard key={i} title={item.title} prompt={item.prompt} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function PromptCard({ title, prompt }: { title: string; prompt: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-muted/50 px-5 py-3 border-b border-border flex items-center justify-between">
        <h3 className="font-bold text-foreground">{title}</h3>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2 text-muted-foreground hover:text-foreground">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          {copied ? "تم النسخ" : "نسخ الكود"}
        </Button>
      </div>
      <div className="p-5 text-foreground/80 leading-relaxed whitespace-pre-wrap font-medium">
        {prompt}
      </div>
    </div>
  );
}
