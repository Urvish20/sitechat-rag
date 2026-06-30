import React from 'react';

export default function Loader({
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
}) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-t-zinc-900 border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 dark:border-t-white dark:border-r-zinc-800 dark:border-b-zinc-800 dark:border-l-zinc-800 ${sizeClasses[size]}`}
      />
    </div>
  );
}
