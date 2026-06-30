import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { removeToast } from '../../slices/toastSlice';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastItem = ({ id, message, type, duration, onRemove }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-xl pointer-events-auto bg-white dark:bg-zinc-900 ${
        type === 'success'
          ? 'border-emerald-200 dark:border-emerald-950 text-emerald-800 dark:text-emerald-400'
          : type === 'error'
          ? 'border-red-200 dark:border-red-950 text-red-800 dark:text-red-400'
          : 'border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-350'
      }`}
    >
      {type === 'success' && <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />}
      {type === 'error' && <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />}
      {type === 'info' && <Info size={16} className="text-cyan-500 shrink-0 mt-0.5" />}

      <span className="text-xs font-bold flex-1 leading-normal text-left">{message}</span>
      
      <button
        onClick={() => onRemove(id)}
        className="p-1 rounded-lg hover:bg-zinc-150 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
        aria-label="Dismiss alert"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

export default function AppLayout({
  children,
  sidebarOpen,
  setSidebarOpen,
  onNewSession,
  sessions,
  activeSessionId,
  onSelectSession,
  onOpenSettings,
  onOpenAbout,
}) {
  const dispatch = useDispatch();
  
  // Select states
  const toasts = useSelector((state) => state.toast.toasts);
  const appState = useSelector((state) => state.chat.appState);
  const isProcessingGlobal = appState === 'processing' || appState === 'deleting';

  const handleRemoveToast = (id) => {
    dispatch(removeToast(id));
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans select-none">
      <Navbar
        toggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <div className="flex flex-1 h-[calc(100vh-3.5rem)] w-full overflow-hidden relative">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNewSession={onNewSession}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={onSelectSession}
          onOpenSettings={onOpenSettings}
          onOpenAbout={onOpenAbout}
          isProcessingGlobal={isProcessingGlobal}
        />

        {/* Main Content View */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950 relative">
          {children}
        </main>
      </div>

      {/* Floating Toast Notification Containers */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              id={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onRemove={handleRemoveToast}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
