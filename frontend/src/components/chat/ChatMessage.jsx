import React from 'react';
import { Bot, User } from 'lucide-react';
import SourceCard from './SourceCard';

export default function ChatMessage({ message }) {
  // message: { id, role: 'user' | 'assistant', text, sources: [...] }
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex w-full gap-4.5 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-xs ${
        isAssistant
          ? 'bg-gradient-to-tr from-cyan-500 to-purple-500 text-white'
          : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
      }`}>
        {isAssistant ? <Bot size={18} /> : <User size={18} />}
      </div>

      {/* Bubble Container */}
      <div className={`flex flex-col max-w-[80%] gap-3`}>
        {/* Main Bubble */}
        <div className={`px-5 py-4 rounded-2xl border text-sm leading-relaxed ${
          isAssistant
            ? 'bg-zinc-50 border-zinc-200/60 dark:bg-zinc-900 dark:border-zinc-800/80 rounded-tl-sm text-zinc-850 dark:text-zinc-250'
            : 'bg-zinc-900 border-zinc-900 text-white rounded-tr-sm dark:bg-white dark:border-white dark:text-zinc-950'
        }`}>
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>

        {/* Sources Section (only for AI responses if sources are present) */}
        {isAssistant && message.sources && message.sources.length > 0 && (
          <div className="space-y-2 mt-1">
            <div className="flex items-center gap-2 px-1">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-zinc-400 dark:text-zinc-500">
                Sources & References
              </span>
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {message.sources.map((source, index) => (
                <SourceCard key={index} source={source} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
