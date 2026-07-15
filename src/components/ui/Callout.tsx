import React from 'react';
import { CalloutType } from '@/data/types';
import { Info, AlertTriangle, CheckCircle2, Sparkles, XCircle } from 'lucide-react';

interface CalloutProps {
  type: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const config: Record<CalloutType, {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  classes: string;
  iconClass: string;
}> = {
  note: {
    icon: Info,
    title: 'ملاحظة',
    classes: 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-100',
    iconClass: 'text-blue-500 dark:text-blue-400'
  },
  warning: {
    icon: AlertTriangle,
    title: 'تحذير',
    classes: 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-100',
    iconClass: 'text-amber-500 dark:text-amber-400'
  },
  'best-practice': {
    icon: CheckCircle2,
    title: 'أفضل الممارسات',
    classes: 'bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900 text-green-900 dark:text-green-100',
    iconClass: 'text-green-500 dark:text-green-400'
  },
  'ai-tip': {
    icon: Sparkles,
    title: 'نصيحة ذكاء اصطناعي',
    classes: 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900 text-purple-900 dark:text-purple-100',
    iconClass: 'text-purple-500 dark:text-purple-400'
  },
  mistake: {
    icon: XCircle,
    title: 'خطأ شائع',
    classes: 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-900 dark:text-red-100',
    iconClass: 'text-red-500 dark:text-red-400'
  }
};

export function Callout({ type, title, children }: CalloutProps) {
  const c = config[type] ?? config.note;
  const Icon = c.icon;

  return (
    <div className={`my-6 p-4 rounded-lg border ${c.classes} flex gap-4 items-start`}>
      <div className={`mt-0.5 shrink-0 ${c.iconClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h4 className={`font-bold mb-2 ${c.iconClass}`}>{title || c.title}</h4>
        <div className="text-sm leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}
