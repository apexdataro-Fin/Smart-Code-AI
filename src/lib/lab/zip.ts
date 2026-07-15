import { zip, unzip, strToU8, strFromU8 } from 'fflate';
import type { LabProject } from './types';

/**
 * Lightweight ZIP export / import using fflate (~8 KB). APIs:
 *   - makeProjectBlob(project)  → Blob
 *   - downloadProjectZip(project) → triggers a browser download
 *   - readZipBlob(blob)         → Record<name, Uint8Array>
 *   - importProjectFromZip(file)→ ImportedProject
 */

export async function makeProjectBlob(project: LabProject): Promise<Blob> {
  const filesObj: Record<string, Uint8Array> = {};
  filesObj['smart-code-lab.json'] = strToU8(JSON.stringify({
    version: 1,
    id: project.id,
    name: project.name,
    language: project.language,
    mode: project.mode,
    description: project.description ?? '',
    settings: project.settings,
    activeId: project.activeId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }, null, 2));
  for (const f of project.files) {
    const safe = f.name.replace(/^\/+/, '').replace(/^[A-Z]:[\\\/]/, '');
    filesObj[`src/${safe}`] = strToU8(f.content);
  }
  const buf = await new Promise<Uint8Array>((resolve, reject) => {
    zip(filesObj, { level: 6 }, (err: unknown, data: Uint8Array) => {
      if (err) reject(err instanceof Error ? err : new Error(String(err)));
      else resolve(data);
    });
  });
  // Make a fresh Uint8Array to satisfy BlobPart strict-blob typing.
  const fresh = new Uint8Array(buf.byteLength);
  fresh.set(buf);
  return new Blob([fresh], { type: 'application/zip' });
}

export function downloadProjectZip(project: LabProject): Promise<void> {
  return makeProjectBlob(project).then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safe = project.name.replace(/[^\w\- ]+/g, '_').slice(0, 60) || 'lab-project';
    a.download = `${safe}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  });
}

export interface ImportedProject {
  meta: any;
  files: Record<string, string>;
}

export async function readZipBlob(blob: Blob): Promise<Record<string, Uint8Array>> {
  const buf = new Uint8Array(await blob.arrayBuffer());
  return new Promise((resolve, reject) => {
    unzip(buf, (err: unknown, data: Record<string, Uint8Array>) => {
      if (err) reject(err instanceof Error ? err : new Error(String(err)));
      else resolve(data);
    });
  });
}

export async function importProjectFromZip(file: File): Promise<ImportedProject> {
  const entries = await readZipBlob(file);
  let meta: any = {};
  const files: Record<string, string> = {};
  for (const [name, data] of Object.entries(entries)) {
    if (name === 'smart-code-lab.json') {
      try { meta = JSON.parse(strFromU8(data)); } catch { meta = {}; }
    } else if (name.startsWith('src/')) {
      files[name.slice(4)] = strFromU8(data);
    }
  }
  return { meta, files };
}
