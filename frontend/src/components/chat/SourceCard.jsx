import React from 'react';
import { ExternalLink, FileText } from 'lucide-react';

export default function SourceCard({ source }) {
  // source: { title, url, snippet }
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer"
      className="group block p-3.5 rounded-xl border border-zinc-200/80 bg-white hover:border-zinc-350 dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:hover:border-zinc-700/80 transition-all duration-200 shadow-xs hover:shadow-sm"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className="text-zinc-400 group-hover:text-cyan-500 dark:text-zinc-500 dark:group-hover:text-cyan-400 transition-colors">
          <FileText size={14} />
        </div>
        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate flex-1 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
          {source.title}
        </span>
        <ExternalLink size={10} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
      </div>
      
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
        {source.snippet}
      </p>
      
      <div className="mt-2 text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 truncate">
        {source.url}
      </div>
    </a>
  );
}
