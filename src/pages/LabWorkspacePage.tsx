import { useEffect, useMemo, useState } from 'react';
import { useRoute } from 'wouter';
import { Shell } from '@/components/Shell';
import { LabShell } from '@/components/lab/LabShell';
import { getProject, createProject, updateProject } from '@/lib/lab/projectManager';
import { getStarter } from '@/data/lab/starters';
import type { LabProject } from '@/lib/lab/types';

/**
 * Single-file lab workspace. URL forms:
 *   /lab/workspace/<id>        — open an existing project
 *   /lab/workspace/starter:<id> — create-on-demand from a starter
 *
 * On miss → redirect to /lab. Read-only is OFF; full toolbar enabled.
 */
export default function LabWorkspacePage() {
  const [, params] = useRoute<{ id: string }>('/lab/workspace/:id');
  const id = params?.id;
  const [project, setProject] = useState<LabProject | null>(null);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setRedirectTo('/lab');
      return;
    }
    if (id.startsWith('starter:')) {
      const starterId = id.slice('starter:'.length);
      const starter = getStarter(starterId);
      if (!starter) { setRedirectTo('/lab'); return; }
      if (starter.mode === 'project') {
        // Wrong route; send user to project page instead.
        setRedirectTo(`/lab/project/starter:${starter.id}`);
        return;
      }
      const created = createProject({
        name: starter.title,
        language: starter.language,
        mode: 'workspace',
        starterCode: starter.defaultCode,
      });
      setProject(updateProject(created, { description: starter.description }));
      setRedirectTo(`/lab/workspace/${created.id}`);
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
        <LabShell project={project} onProjectChange={(p) => setProject(p)} />
      </div>
    </Shell>
  );
}
