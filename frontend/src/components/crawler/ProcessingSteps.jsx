import React from 'react';
import { Check, Loader2 } from 'lucide-react';

export default function ProcessingSteps({ steps }) {
  // steps is an array of { id, label, status: 'pending' | 'running' | 'completed' }
  return (
    <div className="space-y-4.5 w-full max-w-md mx-auto text-left py-4">
      {steps.map((step) => (
        <div
          key={step.id}
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 ${
            step.status === 'running'
              ? 'bg-zinc-100/80 dark:bg-zinc-900/80 scale-[1.02] border border-zinc-200 dark:border-zinc-800'
              : step.status === 'completed'
              ? 'opacity-85'
              : 'opacity-40'
          }`}
        >
          {/* Icon indicator */}
          <div className="flex shrink-0 items-center justify-center">
            {step.status === 'completed' ? (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                <Check size={12} strokeWidth={3} />
              </div>
            ) : step.status === 'running' ? (
              <div className="flex h-5 w-5 items-center justify-center text-cyan-500 dark:text-cyan-400">
                <Loader2 size={16} className="animate-spin" />
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-zinc-300 dark:border-zinc-700 bg-transparent" />
            )}
          </div>

          {/* Text labels */}
          <div className="flex-1">
            <span
              className={`text-sm font-semibold transition-colors duration-300 ${
                step.status === 'running'
                  ? 'text-zinc-900 dark:text-white'
                  : step.status === 'completed'
                  ? 'text-zinc-700 dark:text-zinc-300 line-through decoration-zinc-400 dark:decoration-zinc-650'
                  : 'text-zinc-400 dark:text-zinc-600'
              }`}
            >
              {step.label}
            </span>
          </div>

          {/* Running status context */}
          {step.status === 'running' && (
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-cyan-600 dark:text-cyan-400 animate-pulse">
              Processing...
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
