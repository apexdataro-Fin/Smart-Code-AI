import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { Shell } from '@/components/Shell';
import { LabShell } from '@/components/lab/LabShell';
import { getProject, createProject, updateProject } from '@/lib/lab/projectManager';
import { getStarter } from '@/data/lab/starters';
import type { LabProject } from '@/lib/lab/types';

/**
 * Multi-file Lab project. Same routing convention as LabWorkspacePage
 * but enables the FileExplorer column in LabShell.
 */
export default function LabProjectPage() {
  const [, params] = useRoute<{ id: string }>('/lab/project/:id');
  const id = params?.id;
  const [project, setProject] = useState<LabProject | null>(null);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setRedirectTo('/lab'); return; }
    if (id.startsWith('starter:')) {
      const starterId = id.slice('starter:'.length);
      const starter = getStarter(starterId);
      if (!starter) { setRedirectTo('/lab'); return; }
      if (starter.mode !== 'project') {
        // Wrong route; switch to workspace mode.
        setRedirectTo(`/lab/workspace/starter:${starter.id}`);
        return;
      }
      const created = createProject({
        name: starter.title,
        language: starter.language,
        mode: 'project',
        files: starter.files,
        starterCode: starter.files?.find((f) => f.language === 'javascript')?.content,
      });
      setProject(updateProject(created, { description: starter.description }));
      setRedirectTo(`/lab/project/${created.id}`);
      return;
    }
    const p = getProject(id);
    if (!p) { setRedirectTo('/lab'); return; }
    setProject(p);
  }, [id]);

  if (redirectTo) {
    if (typeof window !== 'undefined' && window.location.hash !== `#${redirectTo}`) {
      window.location.hash = `#${redirectTo}`;
    }
    return (
      <Shell>
        <div className="grid place-items-center h-64 text-muted-foreground">جارٍ التحويل…</div>
      </Shell>
    );
  }
  if (!project) {
    return (
      <Shell>
        <div className="grid place-items-center h-64 text-muted-foreground">يتم التحميل…</div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="h-[calc(100vh-3.5rem)] min-h-[500px]">
        <LabShell project={project} withFileExplorer onProjectChange={(p) => setProject(p)} />
      </div>
    </Shell>
  );
}
