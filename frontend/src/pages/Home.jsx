import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import UrlInput from '../components/crawler/UrlInput';
import ProcessingStatus from '../components/crawler/ProcessingStatus';
import ChatContainer from '../components/chat/ChatContainer';
import Button from '../components/common/Button';
import { useSession } from '../hooks/useSession';
import { useChat } from '../hooks/useChat';
import { usePolling } from '../hooks/usePolling';
import { resetSession } from '../slices/chatSlice';

export default function Home() {
  const dispatch = useDispatch();

  // Custom Hooks
  const { appState, currentUrl, createSession, deleteSession } = useSession();
  const { messages, isTyping, sendMessage } = useChat();
  const { statusData } = usePolling(); // runs polling loop dynamically

  // Local selectors for status steps
  const crawlingProgress = useSelector((state) => state.chat.crawlingProgress);
  const steps = useSelector((state) => state.chat.steps);

  const handleReset = () => {
    dispatch(resetSession());
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
      <AnimatePresence mode="wait">
        
        {/* Idle (Landing) State */}
        {appState === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center max-w-4xl mx-auto space-y-8 select-none"
          >
            {/* Logo Badge */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-500 text-white shadow-xl shadow-cyan-500/20">
              <MessageSquare size={32} />
            </div>

            {/* Heading */}
            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl dark:text-white leading-[1.1]">
                Chat with any <span className="bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">Website</span>
              </h1>
              <p className="text-base sm:text-lg text-zinc-550 dark:text-zinc-400 max-w-xl mx-auto font-medium">
                Enter a website URL to crawl, index and chat with its content instantly.
              </p>
            </div>

            <UrlInput onSubmit={createSession} isLoading={false} />
          </motion.div>
        )}

        {/* Processing State */}
        {appState === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-start justify-center py-10 x-4 bg-zinc-50 dark:bg-zinc-950 overflow-y-auto"
          >
            <ProcessingStatus
              progress={crawlingProgress}
              steps={steps}
              currentUrl={currentUrl}
              statusData={statusData}
              onCancel={deleteSession}
            />
          </motion.div>
        )}

        {/* Deleting State */}
        {appState === 'deleting' && (
          <motion.div
            key="deleting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 space-y-4"
          >
            <Loader2 className="animate-spin text-red-500" size={32} />
            <p className="text-sm font-bold text-zinc-650 dark:text-zinc-400">
              Deleting session knowledge-base vectors...
            </p>
          </motion.div>
        )}

        {/* Error State */}
        {appState === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto text-center space-y-6"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400 shadow-md">
              <AlertCircle size={28} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                Crawling Process Failed
              </h2>
              <p className="text-xs text-zinc-550 dark:text-zinc-450 leading-relaxed font-semibold">
                An error occurred attempting to parse or fetch contents. Verify the url is valid and that the backend server is running correctly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <Button
                variant="primary"
                onClick={() => createSession(currentUrl)}
                icon={RefreshCw}
                className="bg-cyan-600 hover:bg-cyan-550 dark:bg-cyan-700 dark:hover:bg-cyan-650"
              >
                Retry Crawling
              </Button>
              <Button
                variant="secondary"
                onClick={handleReset}
              >
                Reset & Try New URL
              </Button>
            </div>
          </motion.div>
        )}

        {/* Ready / Chatting State */}
        {(appState === 'ready' || appState === 'chatting') && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col h-full w-full overflow-hidden"
          >
            <ChatContainer
              url={currentUrl}
              messages={messages}
              isTyping={isTyping}
              onSendMessage={sendMessage}
              onClearSession={deleteSession}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
