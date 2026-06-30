import React, { useState, useRef } from 'react';
import { Send, CornerDownLeft } from 'lucide-react';
import Button from '../common/Button';

export default function ChatInput({ onSendMessage, disabled }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    onSendMessage(message.trim());
    setMessage('');
    
    // Reset heights
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    // Dynamic height resize
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
    }
  };

  return (
    <div className="border-t border-zinc-200 bg-white/70 p-4.5 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/70">
      <div className="mx-auto max-w-3xl relative flex items-center">
        <textarea
          ref={textareaRef}
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Ask a question about this website..."
          disabled={disabled}
          className="w-full resize-none rounded-2xl border border-zinc-200 bg-white px-5 py-4.5 pr-20 text-sm shadow-xs transition-all focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-300 dark:focus:ring-zinc-300 max-h-48"
          style={{ height: 'auto' }}
        />
        
        <div className="absolute right-3.5 flex items-center gap-2">
          {/* Key shortcut indicator */}
          <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-extrabold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest mr-1.5 pointer-events-none">
            Enter <CornerDownLeft size={10} strokeWidth={2.5} />
          </span>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            variant="primary"
            size="sm"
            className="h-8.5 w-8.5 rounded-lg px-0 py-0 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 cursor-pointer"
            icon={Send}
            aria-label="Send message"
          />
        </div>
      </div>
      <p className="text-[10px] text-center text-zinc-400 dark:text-zinc-500 mt-2 font-medium">
        SiteChat checks website contents locally using simulated Vector embeddings.
      </p>
    </div>
  );
}
