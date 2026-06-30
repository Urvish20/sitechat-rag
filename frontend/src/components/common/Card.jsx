import React from 'react';

export default function Card({
  children,
  className = '',
  hover = false,
  ...props
}) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/50 backdrop-blur-md transition-all duration-300 ${
        hover ? 'hover:border-zinc-300 hover:shadow-md dark:hover:border-zinc-700/85 hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
