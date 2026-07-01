import React from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

export default function ProcessingSteps({ steps }) {
  return (
    <div className="space-y-1 w-full max-w-md mx-auto text-left py-1 select-none">
      {steps.map((step, idx) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: idx * 0.03 }}
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all border ${
            step.status === 'running'
              ? 'bg-zinc-100/80 dark:bg-zinc-900/80 scale-[1.01] border-cyan-200 dark:border-cyan-900/40 shadow-sm'
              : step.status === 'completed'
              ? 'opacity-70 border-transparent bg-zinc-50/50 dark:bg-zinc-950/10'
              : 'opacity-30 border-transparent'
          }`}
        >
          {/* Status Indicator Icon */}
          <div className="flex shrink-0 items-center justify-center">
            {step.status === 'completed' ? (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm"
              >
                <Check size={9} strokeWidth={3} />
              </motion.div>
            ) : step.status === 'running' ? (
              <div className="flex h-4 w-4 items-center justify-center text-cyan-500">
                <Loader2 size={12} className="animate-spin" />
              </div>
            ) : (
              <div className="h-4 w-4 rounded-full border border-zinc-300 dark:border-zinc-700 bg-transparent" />
            )}
          </div>

          {/* Step Labels */}
          <div className="flex-1">
            <span
              className={`text-xs font-semibold transition-colors duration-300 ${
                step.status === 'running'
                  ? 'text-zinc-900 dark:text-white font-bold'
                  : step.status === 'completed'
                  ? 'text-zinc-400 dark:text-zinc-550 line-through decoration-zinc-300 dark:decoration-zinc-700'
                  : 'text-zinc-400 dark:text-zinc-600'
              }`}
            >
              {step.label}
            </span>
          </div>

          {/* Running Spinner Badge */}
          {step.status === 'running' && (
            <span className="text-[8px] uppercase tracking-wider font-extrabold text-cyan-600 dark:text-cyan-400 animate-pulse">
              Running
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
