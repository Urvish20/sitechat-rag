import { Plus, Settings, Info, X, MessageSquare, History } from 'lucide-react';
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
}) {
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-zinc-950/20 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 lg:static lg:z-0 lg:flex transform transition-transform duration-350 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-0 max-lg:-translate-x-full'
          }`}
      >
        {/* Header (with mobile close button) */}
        <div className="flex h-14 items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-900">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Navigation
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            icon={X}
          />
        </div>

        {/* Action Button: New Session */}
        <div className="p-4">
          <Button
            onClick={() => {
              onNewSession();
              onClose();
            }}
            variant="secondary"
            className="w-full flex justify-start pl-4"
            icon={Plus}
          >
            New Chat Session
          </Button>
        </div>

        {/* Main Menu / Recent Sessions */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
          <div className="space-y-2">
            <span className="flex items-center gap-2 px-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
              <History size={12} />
              Recent Sites
            </span>
            <div className="space-y-1">
              {sessions.length === 0 ? (
                <p className="px-2 py-3 text-xs italic text-zinc-400 dark:text-zinc-500">
                  No crawled sites yet.
                </p>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => {
                      onSelectSession(session);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-colors cursor-pointer ${activeSessionId === session.id
                        ? 'bg-zinc-200/60 dark:bg-zinc-800/60 text-zinc-900 dark:text-white'
                        : 'text-zinc-650 hover:bg-zinc-150 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
                      }`}
                  >
                    <MessageSquare size={13} className="shrink-0 text-zinc-400" />
                    <span className="truncate">{session.url}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer controls (Settings, About) */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-900 space-y-1 bg-zinc-100/50 dark:bg-zinc-950">
          <button
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <Settings size={15} />
            Settings
          </button>
          <button
            onClick={() => {
              onOpenAbout();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <Info size={15} />
            About SiteChat
          </button>
        </div>
      </aside>
    </>
  );
}
