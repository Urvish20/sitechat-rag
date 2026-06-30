import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../common/Card';
import ProcessingProgress from './ProcessingProgress';
import ProcessingSteps from './ProcessingSteps';
import { Loader2, Globe, Eye, Hash, Cpu, Database, ChevronDown, ChevronUp, Terminal, XCircle, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';

export default function ProcessingStatus({ progress, steps, currentUrl, statusData, onCancel }) {
  const pagesVisited = statusData?.pagesVisited ?? 0;
  const currentPage = statusData?.currentPage ?? '';
  const chunksCreated = statusData?.chunksCreated ?? 0;
  const embeddingsCreated = statusData?.embeddingsCreated ?? 0;
  const vectorsStored = statusData?.vectorsStored ?? 0;
  const pagesSkipped = statusData?.pagesSkipped ?? 0;
  const stage = statusData?.stage ?? 'Starting';
  const logs = statusData?.logs ?? [];

  const [showLogs, setShowLogs] = useState(false);

  const stats = [
    { icon: Globe, label: 'Pages Crawled', value: pagesVisited, show: pagesVisited > 0 },
    { icon: AlertTriangle, label: 'Pages Skipped', value: pagesSkipped, show: pagesSkipped > 0 },
    { icon: Hash, label: 'Chunks Created', value: chunksCreated, show: chunksCreated > 0 },
    { icon: Cpu, label: 'Embeddings Generated', value: embeddingsCreated, show: embeddingsCreated > 0 },
    { icon: Database, label: 'Vectors Stored', value: vectorsStored, show: vectorsStored > 0 },
  ].filter((s) => s.show);

  return (
    <Card className="w-full max-w-xl mx-auto p-8 shadow-xl bg-white/40 dark:bg-zinc-900/40 border-zinc-200/50 dark:border-zinc-800/50 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-left space-y-1.5">
            <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <Loader2 className="animate-spin text-cyan-500" size={20} />
              Analyzing Website Content
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-450 font-semibold">
              {stage}
            </p>
          </div>
          {onCancel && (
            <Button
              variant="secondary"
              onClick={onCancel}
              icon={XCircle}
              className="text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900/40"
            >
              Cancel
            </Button>
          )}
        </div>

        <ProcessingProgress progress={progress} currentUrl={currentUrl} />

        {/* Live Activity Card */}
        <AnimatePresence mode="wait">
          {(currentPage || stats.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="bg-zinc-100/50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-900 space-y-3"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                <Eye size={12} />
                <span>Live Activity</span>
              </div>

              {currentPage && (
                <div className="flex items-start gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-300">
                  <Globe size={13} className="text-cyan-500 shrink-0 mt-0.5" />
                  <span className="truncate flex-1 font-mono">{currentPage}</span>
                </div>
              )}

              {stats.length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {stats.map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 bg-white dark:bg-zinc-900 rounded-lg px-3 py-2 border border-zinc-200 dark:border-zinc-800"
                    >
                      <Icon size={13} className="text-cyan-500 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wide truncate">
                          {label}
                        </div>
                        <div className="text-sm font-extrabold text-zinc-900 dark:text-white font-mono">
                          {value.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <ProcessingSteps steps={steps} />

        {/* Collapsible Console Logs Panel */}
        {logs.length > 0 && (
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/20">
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-cyan-500" />
                <span>Processing Logs ({logs.length})</span>
              </div>
              {showLogs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <AnimatePresence>
              {showLogs && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto', maxHeight: '160px' }}
                  exit={{ height: 0 }}
                  className="overflow-y-auto border-t border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-950 font-mono text-[10px] text-zinc-350 text-left space-y-1.5 select-text"
                >
                  {logs.map((log, idx) => (
                    <div key={idx} className="leading-normal break-all">
                      <span className="text-cyan-500">&gt;</span> {log}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Card>
  );
}
