import React from 'react';
import ProgressBar from '../common/ProgressBar';

export default function ProcessingProgress({ progress, currentUrl }) {
  return (
    <div className="space-y-3.5 text-center">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-widest font-extrabold text-zinc-400 dark:text-zinc-500">
          Indexing Target
        </p>
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-md mx-auto">
          {currentUrl}
        </p>
      </div>

      <div className="py-2.5">
        <ProgressBar progress={progress} showLabel={true} />
      </div>
    </div>
  );
}
