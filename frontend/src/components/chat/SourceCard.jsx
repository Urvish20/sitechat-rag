import React from 'react';
import { ExternalLink, FileText, Sparkles } from 'lucide-react';

export default function SourceCard({ source }) {
  const { title, url, snippet, score } = source;
  const matchPercentage = score ? Math.round(score * 100) : null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group block p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-350 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-zinc-750 transition-all duration-200 shadow-sm text-left relative overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="text-zinc-400 group-hover:text-cyan-500 dark:text-zinc-500 dark:group-hover:text-cyan-400 transition-colors shrink-0">
          <FileText size={14} />
        </div>
        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate flex-1 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
          {title}
        </span>
        
        {/* Similarity Score */}
        {matchPercentage !== null && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/50">
            <Sparkles size={8} />
            {matchPercentage}% Match
          </span>
        )}
      </div>
      
      {snippet && (
        <p className="text-[11px] text-zinc-550 dark:text-zinc-450 line-clamp-2 leading-relaxed mb-3">
          {snippet}
        </p>
      )}
      
      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-850/30">
        <div className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 truncate max-w-[120px]">
          {url}
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 opacity-80 group-hover:opacity-100 transition-opacity">
          Open Source <ExternalLink size={10} className="shrink-0" />
        </span>
      </div>
    </a>
  );
}
