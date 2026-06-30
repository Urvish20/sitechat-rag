import React, { useState, useEffect } from 'react';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Button from './components/common/Button';
import { X, Sparkles, Sliders, Shield, Database, Cpu } from 'lucide-react';

const GithubIcon = ({ size = 20 }) => (
  <svg height={size} width={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

export default function App() {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appState, setAppState] = useState('landing'); // 'landing' | 'processing' | 'ready' | 'notfound'
  
  // Site crawling parameters
  const [currentUrl, setCurrentUrl] = useState('');
  const [crawlingProgress, setCrawlingProgress] = useState(0);
  const [steps, setSteps] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // Mock sessions list
  const [sessions, setSessions] = useState([
    {
      id: 'sess-1',
      url: 'https://tailwindcss.com',
      messages: [
        {
          id: 'prev-1',
          role: 'assistant',
          text: 'Welcome back! I have cached the Tailwind v4 index. Ask me any syntax queries.',
          sources: []
        }
      ]
    },
    {
      id: 'sess-2',
      url: 'https://react.dev',
      messages: [
        {
          id: 'prev-2',
          role: 'assistant',
          text: 'React 19 documentation is fully cached. How can I assist you with hooks?',
          sources: []
        }
      ]
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState(null);

  // Dialog Modals
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);


  const handleAddSession = (url) => {
    const newSession = {
      id: `sess-${Date.now()}`,
      url,
      messages: [] // Main Home state maintains active messages
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleSelectSession = (session) => {
    setActiveSessionId(session.id);
    setCurrentUrl(session.url);
    setAppState('ready');
    setMessages(session.messages.length > 0 ? session.messages : [
      {
        id: 'sess-greet',
        role: 'assistant',
        text: `Loaded cached index for **${session.url}**. Ask me any question related to this website's knowledge-base!`,
        sources: []
      }
    ]);
  };

  const handleNewSession = () => {
    setAppState('landing');
    setCurrentUrl('');
    setMessages([]);
    setActiveSessionId(null);
  };

  return (
    <AppLayout
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      onNewSession={handleNewSession}
      sessions={sessions}
      activeSessionId={activeSessionId}
      onSelectSession={handleSelectSession}
      onOpenSettings={() => setShowSettings(true)}
      onOpenAbout={() => setShowAbout(true)}
    >
      {appState === 'notfound' ? (
        <NotFound onGoBack={handleNewSession} />
      ) : (
        <Home
          appState={appState}
          setAppState={setAppState}
          currentUrl={currentUrl}
          setCurrentUrl={setCurrentUrl}
          crawlingProgress={crawlingProgress}
          setCrawlingProgress={setCrawlingProgress}
          steps={steps}
          setSteps={setSteps}
          messages={messages}
          setMessages={setMessages}
          onAddSession={handleAddSession}
        />
      )}

      {/* Modal Settings Backdrop */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-md px-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-250">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Sliders size={18} className="text-purple-500" />
                Index Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-850 dark:hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="py-4 space-y-4 text-left">
              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Chunk Size</h4>
                  <p className="text-xs text-zinc-550 dark:text-zinc-450">Tokens per text block</p>
                </div>
                <span className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold font-mono dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                  500 Tokens
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Overlap size</h4>
                  <p className="text-xs text-zinc-550 dark:text-zinc-450">Token sharing between chunks</p>
                </div>
                <span className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold font-mono dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                  50 Tokens
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Mock Vector DB</h4>
                  <p className="text-xs text-zinc-550 dark:text-zinc-450">Local database used for RAG</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Database size={13} /> Active (LocalMemory)
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="primary" onClick={() => setShowSettings(false)}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal About Backdrop */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-md px-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-7 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-250">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Sparkles size={18} className="text-cyan-500" />
                About SiteChat
              </h3>
              <button
                onClick={() => setShowAbout(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-850 dark:hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-5 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-500 text-white shadow-lg">
                <Cpu size={28} />
              </div>
              
              <div className="space-y-1">
                <h4 className="text-md font-bold text-zinc-900 dark:text-white">SiteChat RAG Workspace</h4>
                <p className="text-xs text-zinc-550 dark:text-zinc-450">Version 1.0.0 (Client Demo)</p>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-450 leading-relaxed text-left max-w-sm mx-auto bg-zinc-100/50 dark:bg-zinc-950 p-4.5 rounded-xl border border-zinc-200/50 dark:border-zinc-900">
                SiteChat allows user-friendly, real-time question answering over crawlable web resources. This interface is fully designed using utility styles from **Tailwind CSS v4** to resemble premium modern SaaS products.
              </p>
            </div>

            <div className="mt-4 flex justify-between items-center gap-3">
              <a
                href="https://github.com/Urvish20/sitechat-rag"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                <GithubIcon size={14} /> Github Project
              </a>
              <Button variant="secondary" onClick={() => setShowAbout(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
