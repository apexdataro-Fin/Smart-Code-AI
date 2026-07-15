import type { LabFile, LabProject, LanguageId } from './types';
import {
  deleteProject as _deleteProject,
  getActiveProjectId,
  loadProject,
  saveProject,
  setActiveProjectId,
  listProjectIds,
} from './storage';
import { getAdapter } from './registry';
import { detectLanguageFromFilename } from './languages';

/**
 * Project manager — pure functional helpers over `LabProject` plus the
 * storage layer. Stateless: every call returns a fresh value or directly
 * persists via `saveProject` / `_deleteProject`.
 *
 * No hardcoded filename ternary chains — all language-specific defaults
 * flow through the registry's LanguageAdapter so adding Java / SQL / C++
 * only requires a new adapter entry in registry.ts.
 */

function uid(prefix = 'p'): string {
  return (
    prefix +
    '_' +
    Math.random().toString(36).slice(2, 8) +
    Date.now().toString(36).slice(-4)
  );
}

function filenameToId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 80) || 'file';
}

/** Create a brand-new project. */
export function createProject(opts: {
  name: string;
  language: LanguageId;
  mode: 'workspace' | 'project';
  files?: LabFile[];
  starterCode?: string;
}): LabProject {
  const adapter = getAdapter(opts.language);
  const defaultFileName = adapter.meta.defaultFile;
  const defaultContent = opts.starterCode ?? adapter.meta.defaultCode;

  const mainFile: LabFile = {
    id: filenameToId(defaultFileName),
    name: defaultFileName,
    language: opts.language,
    content:
      opts.files?.find((f) => filenameToId(f.name) === filenameToId(defaultFileName))?.content ??
      defaultContent,
  };
  const files = opts.files && opts.files.length > 0
    ? ensureUniqueIds(opts.files)
    : [mainFile];

  const now = Date.now();
  const project: LabProject = {
    version: 1,
    id: uid('lab'),
    name: opts.name,
    language: opts.language,
    files,
    activeId: files[0].id,
    mode: opts.mode,
    createdAt: now,
    updatedAt: now,
    settings: defaultSettings(opts.language),
  };
  saveProject(project);
  setActiveProjectId(project.id);
  return project;
}

/**
 * Create a fresh project for a language switch — replaces the active
 * file with the new language's defaults. Used by LanguageSelector.
 * Keeps the original project id, name, mode, settings, and other files.
 */
export function switchActiveFileLanguage(
  project: LabProject,
  newLanguage: LanguageId,
): LabProject {
  const adapter = getAdapter(newLanguage);
  const active = project.files.find((f) => f.id === project.activeId) ?? project.files[0];
  if (!active) {
    // Empty project — seed with a default file.
    const seedName = adapter.meta.defaultFile;
    const seedFile: LabFile = {
      id: filenameToId(seedName),
      name: seedName,
      language: newLanguage,
      content: adapter.meta.defaultCode,
    };
    return updateProject(project, {
      language: newLanguage,
      files: [seedFile],
      activeId: seedFile.id,
    });
  }
  const files: LabFile[] = project.files.map((f) =>
    f.id === active.id
      ? {
          ...f,
          name: adapter.meta.defaultFile,
          language: newLanguage,
          content: adapter.meta.defaultCode,
        }
      : f,
  );
  return updateProject(project, {
    language: newLanguage,
    files,
    activeId: active.id,
  });
}

/** Load a project by id. */
export function getProject(id: string): LabProject | null {
  return loadProject(id);
}

/** List all projects (most-recent first). */
export function listProjects(): LabProject[] {
  return listProjectIds()
    .map((id) => loadProject(id))
    .filter((p): p is LabProject => !!p)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

/** Resolve the active project (if any). */
export function getActiveProject(): LabProject | null {
  const id = getActiveProjectId();
  return id ? loadProject(id) : null;
}

/** Update an existing project's fields and re-save it. */
export function updateProject(project: LabProject, patch: Partial<LabProject>): LabProject {
  const next: LabProject = { ...project, ...patch, version: 1, updatedAt: Date.now() };
  saveProject(next);
  return next;
}

/** Duplicate project (preserves contents but assigns new id, name, timestamps). */
export function duplicateProject(project: LabProject): LabProject {
  const now = Date.now();
  const copy: LabProject = {
    ...project,
    id: uid('lab'),
    name: `${project.name} (نسخة)`,
    createdAt: now,
    updatedAt: now,
    files: project.files.map((f) => ({ ...f })),
    settings: { ...project.settings },
  };
  saveProject(copy);
  setActiveProjectId(copy.id);
  return copy;
}

/** Permanently delete a project. */
export function deleteProject(id: string): void {
  _deleteProject(id);
}

/* ---------- file helpers ---------- */

export function addFile(project: LabProject, partial: Partial<LabFile> & { name: string }): LabProject {
  const lang = (partial.language ?? detectLanguageFromFilename(partial.name) ?? project.language) as LanguageId;
  const file: LabFile = {
    id: filenameToId(partial.id ?? partial.name),
    name: partial.name,
    language: lang,
    content: partial.content ?? getAdapter(lang).meta.defaultCode,
    readOnly: !!partial.readOnly,
  };
  // Avoid duplicate ids; bump with -2 -3 etc.
  const existingIds = new Set(project.files.map((f) => f.id));
  let id = file.id;
  let n = 2;
  while (existingIds.has(id)) id = `${file.id}-${n++}`;
  file.id = id;

  return updateProject(project, {
    files: [...project.files, file],
    activeId: id,
  });
}

export function renameFile(project: LabProject, fileId: string, newName: string): LabProject {
  const saneName = newName.trim().slice(0, 80) || 'file';
  const inferred = detectLanguageFromFilename(saneName);
  const files = project.files.map((f) =>
    f.id === fileId
      ? {
          ...f,
          name: saneName,
          id: filenameToId(saneName),
          language: inferred ?? f.language,
        }
      : f,
  );
  return updateProject(project, { files, activeId: files.find((f) => f.id === fileId)?.id ?? project.activeId });
}

export function removeFile(project: LabProject, fileId: string): LabProject {
  if (project.files.length <= 1) return project; // never empty
  const files = project.files.filter((f) => f.id !== fileId);
  const next: LabProject = updateProject(project, {
    files,
    activeId: project.activeId === fileId ? files[0].id : project.activeId,
  });
  return next;
}

export function setActiveFile(project: LabProject, fileId: string): LabProject {
  if (!project.files.find((f) => f.id === fileId)) return project;
  return updateProject(project, { activeId: fileId });
}

export function setFileContent(project: LabProject, fileId: string, content: string): LabProject {
  return updateProject(project, {
    files: project.files.map((f) => (f.id === fileId ? { ...f, content } : f)),
  });
}

/* ---------- defaults ---------- */

function defaultSettings(_language: LanguageId): LabProject['settings'] {
  return {
    fontSize: 14,
    theme: 'auto',
    wordWrap: true,
    softWrap: true,
    lineNumbers: true,
    tabSize: 2,
    minimap: false,
  };
}

function ensureUniqueIds(files: LabFile[]): LabFile[] {
  const used = new Set<string>();
  return files.map((f) => {
    let id = filenameToId(f.id || f.name);
    let n = 2;
    while (used.has(id)) id = `${id}-${n++}`;
    used.add(id);
    return { ...f, id };
  });
}
