import React from 'react';
import ProgressBar from '../common/ProgressBar';

export default function ProcessingProgress({ progress, currentUrl }) {
  return (
    <div className="space-y-1.5 text-center">
      <div className="space-y-0.5">
        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-md mx-auto">
          {currentUrl}
        </p>
      </div>

      <div className="py-1">
        <ProgressBar progress={progress} showLabel={true} />
      </div>
    </div>
  );
}
