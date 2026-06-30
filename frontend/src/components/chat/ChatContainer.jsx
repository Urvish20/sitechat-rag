import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import { useAutoScroll } from '../../hooks/useAutoScroll';

export const ChatSkeleton = () => (
  <div className="space-y-6 py-4 animate-pulse select-none">
    <div className="flex gap-4 items-start max-w-xl">
      <div className="h-9 w-9 rounded-xl bg-zinc-250 dark:bg-zinc-800 shrink-0" />
      <div className="space-y-2 flex-1 mt-1">
        <div className="h-3.5 bg-zinc-250 dark:bg-zinc-800 rounded-md w-1/3" />
        <div className="h-3.5 bg-zinc-250 dark:bg-zinc-800 rounded-md w-full" />
        <div className="h-3.5 bg-zinc-250 dark:bg-zinc-800 rounded-md w-5/6" />
      </div>
    </div>

    <div className="flex gap-4 items-start max-w-xl ml-auto justify-end">
      <div className="space-y-2 flex-1 mt-1 flex flex-col items-end">
        <div className="h-3.5 bg-zinc-250 dark:bg-zinc-800 rounded-md w-1/4" />
        <div className="h-3.5 bg-zinc-250 dark:bg-zinc-800 rounded-md w-2/3" />
      </div>
      <div className="h-9 w-9 rounded-xl bg-zinc-250 dark:bg-zinc-800 shrink-0" />
    </div>
  </div>
);

export default function ChatContainer({
  url,
  messages = [],
  isTyping,
  onSendMessage,
  onClearSession,
  isLoadingHistory = false,
}) {
  // Integrate auto-scroll custom hook
  const scrollContainerRef = useAutoScroll(messages.length + (isTyping ? 1 : 0));

  return (
    <div className="flex flex-col h-full flex-1 w-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Active Session Info Header */}
      <ChatHeader url={url} onClearSession={onClearSession} disabled={isTyping} />

      {/* Main Conversation Scroll Feed */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-6 py-6.5 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800"
      >
        <div className="mx-auto max-w-3xl space-y-6">
          {isLoadingHistory ? (
            <ChatSkeleton />
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ChatMessage message={message} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <TypingIndicator />
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Fixed Textbox */}
      <ChatInput onSendMessage={onSendMessage} disabled={isTyping} />
    </div>
  );
}
