import React from 'react';
import { Trash2, Globe, Sparkles } from 'lucide-react';
import Button from '../common/Button';

export default function ChatHeader({ url, onClearSession }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 bg-white/50 px-6 py-4.5 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/50">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
          <Globe size={18} />
        </div>
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-xs sm:max-w-md md:max-w-lg">
            {url}
          </h2>
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/20" />
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Index Live
            </span>
            <span className="text-zinc-350 dark:text-zinc-700 text-xs">•</span>
            <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={9} /> Mock RAG Active
            </span>
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSession}
        className="text-red-500 hover:bg-red-50 hover:text-red-650 dark:hover:bg-red-950/20 dark:hover:text-red-400 border border-transparent hover:border-red-200/50 dark:hover:border-red-950/30"
        icon={Trash2}
      >
        Clear Chat
      </Button>
    </div>
  );
}
