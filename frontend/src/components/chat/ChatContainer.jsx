import React, { useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';

export default function ChatContainer({
  url,
  messages,
  isTyping,
  onSendMessage,
  onClearSession,
}) {
  const messagesEndRef = useRef(null);

  // Auto-scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full flex-1 w-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Active Session Info Header */}
      <ChatHeader url={url} onClearSession={onClearSession} />

      {/* Main Conversation Scroll Feed */}
      <div className="flex-1 overflow-y-auto px-6 py-6.5">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Fixed Textbox */}
      <ChatInput onSendMessage={onSendMessage} disabled={isTyping} />
    </div>
  );
}
