import React from 'react';

export default function ProgressBar({
  progress = 0, // 0 to 100
  className = '',
  showLabel = false,
}) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <span>Processing</span>
          <span>{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
