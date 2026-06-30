import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl rounded-tl-sm w-fit self-start">
      <span className="typing-dot w-2 h-2 rounded-full bg-zinc-450 dark:bg-zinc-500" />
      <span className="typing-dot w-2 h-2 rounded-full bg-zinc-450 dark:bg-zinc-500" />
      <span className="typing-dot w-2 h-2 rounded-full bg-zinc-450 dark:bg-zinc-500" />
    </div>
  );
}
