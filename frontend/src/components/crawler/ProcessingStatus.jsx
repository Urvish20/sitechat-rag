import React from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import ProcessingProgress from './ProcessingProgress';
import ProcessingSteps from './ProcessingSteps';
import { Loader2, Globe, Eye } from 'lucide-react';

export default function ProcessingStatus({ progress, steps, currentUrl, statusData }) {
  const pagesVisited = statusData?.pagesVisited ?? 0;
  const currentPage = statusData?.currentPage ?? '';

  return (
    <Card className="w-full max-w-xl mx-auto p-8 shadow-xl bg-white/40 dark:bg-zinc-900/40 border-zinc-200/50 dark:border-zinc-800/50 relative overflow-hidden">
      {/* Decorative top colored bar */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500" />
      
      <div className="space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center justify-center gap-2">
            <Loader2 className="animate-spin text-cyan-500" size={20} />
            Analyzing Website Content
          </h2>
          <p className="text-xs text-zinc-550 dark:text-zinc-450 font-medium">
            We are crawling, chunking, and indexing this website's knowledge-base locally.
          </p>
        </div>

        <ProcessingProgress progress={progress} currentUrl={currentUrl} />

        {/* Real-time details */}
        <AnimatePresence mode="wait">
          {currentPage && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="bg-zinc-100/50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-900 text-left space-y-2.5"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">
                <Eye size={12} />
                <span>Live Crawler Activity</span>
              </div>
              
              <div className="flex items-start gap-2 text-xs font-semibold text-zinc-850 dark:text-zinc-350">
                <Globe size={13} className="text-cyan-500 shrink-0 mt-0.5" />
                <span className="truncate flex-1 font-mono">{currentPage}</span>
              </div>

              <div className="flex justify-between items-center text-xs font-bold text-zinc-650 dark:text-zinc-400">
                <span>Pages Indexed:</span>
                <span className="font-mono bg-zinc-200/70 dark:bg-zinc-850 px-2 py-0.5 rounded-lg text-zinc-800 dark:text-zinc-200">
                  {pagesVisited} pages
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <ProcessingSteps steps={steps} />
      </div>
    </Card>
  );
}

import { AnimatePresence } from 'framer-motion';
