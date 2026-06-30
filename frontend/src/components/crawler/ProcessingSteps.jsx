import React from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

export default function ProcessingSteps({ steps }) {
  return (
    <div className="space-y-2.5 w-full max-w-md mx-auto text-left py-2 select-none">
      {steps.map((step, idx) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: idx * 0.04 }}
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all border ${
            step.status === 'running'
              ? 'bg-zinc-100/80 dark:bg-zinc-900/80 scale-[1.02] border-cyan-200 dark:border-cyan-900/40 shadow-sm'
              : step.status === 'completed'
              ? 'opacity-80 border-transparent bg-zinc-50/50 dark:bg-zinc-950/20'
              : 'opacity-35 border-transparent'
          }`}
        >
          {/* Status Indicator Icon */}
          <div className="flex shrink-0 items-center justify-center">
            {step.status === 'completed' ? (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
              >
                <Check size={11} strokeWidth={3} />
              </motion.div>
            ) : step.status === 'running' ? (
              <div className="flex h-5 w-5 items-center justify-center text-cyan-500">
                <Loader2 size={15} className="animate-spin" />
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-transparent" />
            )}
          </div>

          {/* Step Labels */}
          <div className="flex-1">
            <span
              className={`text-sm font-semibold transition-colors duration-300 ${
                step.status === 'running'
                  ? 'text-zinc-900 dark:text-white'
                  : step.status === 'completed'
                  ? 'text-zinc-400 dark:text-zinc-550 line-through decoration-zinc-300 dark:decoration-zinc-700'
                  : 'text-zinc-400 dark:text-zinc-650'
              }`}
            >
              {step.label}
            </span>
          </div>

          {/* Running Spinner Badge */}
          {step.status === 'running' && (
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-cyan-600 dark:text-cyan-400 animate-pulse">
              Running
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
