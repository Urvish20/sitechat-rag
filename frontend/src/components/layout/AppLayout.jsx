import Navbar from './Navbar';
import Sidebar from './Sidebar';

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
  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans">
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
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
