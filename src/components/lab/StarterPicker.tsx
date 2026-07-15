import { Link } from 'wouter';
import { Sparkles, FolderPlus, Plus } from 'lucide-react';
import type { StarterProject } from '@/lib/lab/types';
import { STARTERS } from '@/data/lab/starters';
import { getLanguageDisplay } from '@/lib/lab/languages';

/**
 * Starter picker gallery. Each card creates a fresh project from the
 * corresponding StarterProject and navigates the user to /lab. Clicking
 * the "Empty project" card creates a blank workspace in JavaScript.
 */

interface StarterPickerProps {
  onPickEmpty?: () => void;
}

export function StarterPicker({ onPickEmpty }: StarterPickerProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <button
        onClick={onPickEmpty}
        className="group p-4 rounded-xl border-2 border-dashed border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-start transition-all"
      >
        <div className="text-2xl mb-1">📄</div>
        <div className="flex items-center gap-1.5 font-bold text-sm">
          <Plus className="w-4 h-4" /> مشروع فارغ
        </div>
        <p className="text-xs text-muted-foreground mt-1">ابدأ بملف واحد ولغة تختارها لاحقًا.</p>
      </button>

      {STARTERS.map((s) => (
        <StarterCard key={s.id} starter={s} />
      ))}
    </div>
  );
}

function StarterCard({ starter }: { starter: StarterProject }) {
  const href = starter.mode === 'project'
    ? `/lab/project/starter:${starter.id}`
    : `/lab/workspace/starter:${starter.id}`;
  return (
    <Link href={href}>
      <span className="block p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-start transition-all cursor-pointer">
        <div className="text-2xl mb-1">{starter.icon}</div>
        <div className="font-bold text-sm">{starter.title}</div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{starter.description}</p>
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Sparkles className="w-3 h-3" />
          <span>{getLanguageDisplay(starter.language)}</span>
          {starter.mode === 'project' && (
            <>
              <span>·</span>
              <FolderPlus className="w-3 h-3" />
              <span>مشروع متعدد الملفات</span>
            </>
          )}
        </div>
      </span>
    </Link>
  );
}
