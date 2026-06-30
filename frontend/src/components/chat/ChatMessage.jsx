import React from 'react';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SourceCard from './SourceCard';

export default function ChatMessage({ message }) {
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
          {isAssistant ? (
            <div className="prose prose-zinc dark:prose-invert max-w-none text-left text-sm leading-relaxed space-y-2.5">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  // Keep code blocks formatted nicely
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline ? (
                      <pre className="bg-zinc-250 dark:bg-zinc-950 p-3 rounded-lg overflow-x-auto text-xs my-2 font-mono">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code className="bg-zinc-250 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md text-xs font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                  ul({ children }) {
                    return <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>;
                  },
                  h1({ children }) { return <h1 className="text-base font-extrabold mt-3 mb-1.5">{children}</h1>; },
                  h2({ children }) { return <h2 className="text-sm font-bold mt-2.5 mb-1">{children}</h2>; },
                  h3({ children }) { return <h3 className="text-xs font-bold mt-2 mb-1">{children}</h3>; },
                  a({ href, children }) {
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 underline font-semibold">
                        {children}
                      </a>
                    );
                  }
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-left">{message.text}</p>
          )}
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
