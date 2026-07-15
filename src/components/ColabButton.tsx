import React from 'react';
import { ExternalLink } from 'lucide-react';

interface ColabButtonProps {
  notebookUrl: string;
  title: string;
}

export function ColabButton({ notebookUrl, title }: ColabButtonProps) {
  return (
    <div className="my-4">
      <a
        href={notebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-orange-400 bg-orange-50 text-orange-700 hover:bg-orange-100 font-bold text-sm transition-colors cursor-pointer"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.13 4.84c-.95-.57-2.03-.89-3.14-.89-1.1 0-2.18.32-3.13.89L4.42 8.08A6.27 6.27 0 0 0 1.65 12.5v.01c0 1.66.66 3.24 1.84 4.41l.02.02c.58.58 1.27 1.04 2.03 1.35l2.6-2.6a3.17 3.17 0 0 1-.58-1.84c0-1.76 1.44-3.2 3.2-3.2.67 0 1.3.21 1.82.57l3.55-3.56v-.01c-.03-.04-.07-.07-.1-.11-.35-.45-.73-.85-1.16-1.18l-2.73-1.58.01-.02z"/>
        </svg>
        <span>جرّب في Google Colab</span>
        <ExternalLink className="w-4 h-4" />
      </a>
      <span className="block text-xs text-muted-foreground mt-1 mr-1">
        {title}
      </span>
    </div>
  );
}

export default ColabButton;
