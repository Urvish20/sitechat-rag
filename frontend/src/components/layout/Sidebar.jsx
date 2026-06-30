import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Settings, Info, X, MessageSquare, History, Loader2 } from 'lucide-react';
import Button from '../common/Button';

export default function Sidebar({
  isOpen,
  onClose,
  onNewSession,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onOpenSettings,
  onOpenAbout,
  isProcessingGlobal = false, // state checking to disable action triggers
}) {
  const getBadgeStyle = (status) => {
    switch (status) {
      case 'processing':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50';
      case 'completed':
      case 'ready':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-750';
    }
  };

  const getStatusText = (status) => {
    if (status === 'processing') return 'Crawl';
    if (status === 'completed' || status === 'ready') return 'Ready';
    if (status === 'failed') return 'Failed';
    return status || 'Idle';
  };

  return (
    <>
      {/* Backdrop for mobile devices */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-sm lg:hidden cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-75 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 lg:static lg:z-0 lg:flex transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-0 max-lg:-translate-x-full'
        }`}
      >
        {/* Header with Close */}
        <div className="flex h-14 items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-900">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            SiteChat Database
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            icon={X}
            aria-label="Close menu"
          />
        </div>

        {/* Action Button: New Session */}
        <div className="p-4">
          <Button
            onClick={() => {
              if (isProcessingGlobal) return;
              onNewSession();
              onClose();
            }}
            variant="secondary"
            className="w-full flex justify-start pl-4"
            icon={Plus}
            disabled={isProcessingGlobal}
          >
            New Chat Session
          </Button>
        </div>

        {/* Main Menu / Recent Sessions */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
          <div className="space-y-2.5">
            <span className="flex items-center gap-2 px-2 text-xs font-bold text-zinc-400 dark:text-zinc-500">
              <History size={13} />
              Recent Index Files
            </span>
            
            <div className="space-y-1.5">
              {sessions.length === 0 ? (
                <p className="px-2 py-3 text-xs italic text-zinc-400 dark:text-zinc-550 select-none">
                  No crawled sites yet.
                </p>
              ) : (
                <div className="space-y-1.5">
                  <AnimatePresence initial={false}>
                    {sessions.map((session) => {
                      const isActive = activeSessionId === session.id;
                      const isProcessing = session.status === 'processing';

                      return (
                        <motion.button
                          key={session.id}
                          layoutId={`session-card-${session.id}`}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => {
                            if (isProcessingGlobal) return;
                            onSelectSession(session);
                            onClose();
                          }}
                          disabled={isProcessingGlobal}
                          className={`w-full flex flex-col gap-1 px-3.5 py-3 rounded-xl text-left text-xs transition-all relative border ${
                            isActive
                              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-800 shadow-md shadow-zinc-100 dark:shadow-none'
                              : 'text-zinc-650 hover:bg-zinc-150/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-100 border-transparent'
                          } ${isProcessingGlobal ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="flex items-center justify-between gap-2 w-full">
                            <div className="flex items-center gap-2 truncate">
                              <MessageSquare size={13} className={isActive ? 'text-cyan-500' : 'text-zinc-400'} />
                              <span className="truncate font-semibold">{session.url}</span>
                            </div>
                            
                            {/* Status Badge */}
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider shrink-0 ${getBadgeStyle(session.status)}`}>
                              {getStatusText(session.status)}
                            </span>
                          </div>

                          {/* Progress indicator */}
                          {isProcessing && (
                            <div className="w-full mt-2 space-y-1 animate-pulse">
                              <div className="flex justify-between text-[9px] text-amber-600 dark:text-amber-400 font-bold">
                                <span>Crawling Site...</span>
                                <span>{session.progress || 0}%</span>
                              </div>
                              <div className="w-full h-1 bg-amber-100 dark:bg-amber-950 rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full bg-amber-500 rounded-full" 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${session.progress || 0}%` }}
                                  transition={{ duration: 0.2 }}
                                />
                              </div>
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer controls (Settings, About) */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-900 space-y-1 bg-zinc-100/50 dark:bg-zinc-950">
          <button
            onClick={() => {
              if (isProcessingGlobal) return;
              onOpenSettings();
              onClose();
            }}
            disabled={isProcessingGlobal}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-zinc-650 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 transition-colors ${
              isProcessingGlobal ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <Settings size={15} />
            Settings
          </button>
          <button
            onClick={() => {
              if (isProcessingGlobal) return;
              onOpenAbout();
              onClose();
            }}
            disabled={isProcessingGlobal}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-zinc-650 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 transition-colors ${
              isProcessingGlobal ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <Info size={15} />
            About SiteChat
          </button>
        </div>
      </aside>
    </>
  );
}
