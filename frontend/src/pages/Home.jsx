import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import UrlInput from '../components/crawler/UrlInput';
import ProcessingStatus from '../components/crawler/ProcessingStatus';
import ChatContainer from '../components/chat/ChatContainer';

export default function Home({
  appState, // 'landing' | 'processing' | 'ready'
  setAppState,
  currentUrl,
  setCurrentUrl,
  crawlingProgress,
  setCrawlingProgress,
  steps,
  setSteps,
  messages,
  setMessages,
  onAddSession,
}) {
  const [isTyping, setIsTyping] = useState(false);

  // Trigger RAG indexing simulation
  const handleUrlSubmit = (url) => {
    setCurrentUrl(url);
    setAppState('processing');
    setCrawlingProgress(0);
    
    // Reset steps to pending
    const initialSteps = [
      { id: 'crawl', label: 'Crawling Website', status: 'running' },
      { id: 'extract', label: 'Extracting Content', status: 'pending' },
      { id: 'clean', label: 'Cleaning HTML', status: 'pending' },
      { id: 'chunk', label: 'Chunking Content', status: 'pending' },
      { id: 'embed', label: 'Creating Embeddings', status: 'pending' },
      { id: 'index', label: 'Building Search Index', status: 'pending' },
    ];
    setSteps(initialSteps);
  };

  // Processing state machine simulation
  useEffect(() => {
    if (appState !== 'processing') return;

    let progressInterval = setInterval(() => {
      setCrawlingProgress((prev) => {
        const next = prev + 2.5;
        if (next >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [appState]);

  // Adjust steps based on progress
  useEffect(() => {
    if (appState !== 'processing') return;

    setSteps((prevSteps) => {
      return prevSteps.map((step, idx) => {
        const stepThreshold = (idx + 1) * 16.6; // evenly split up to 100%
        if (crawlingProgress >= 100) {
          return { ...step, status: 'completed' };
        } else if (crawlingProgress >= stepThreshold) {
          // Complete this step, start next
          return { ...step, status: 'completed' };
        } else if (crawlingProgress >= stepThreshold - 16.6 && step.status === 'pending') {
          return { ...step, status: 'running' };
        }
        return step;
      });
    });

    if (crawlingProgress >= 100) {
      const delay = setTimeout(() => {
        setAppState('ready');
        // Add to sidebar sessions
        onAddSession(currentUrl);
        // Setup initial greeting message
        setMessages([
          {
            id: 'init-1',
            role: 'assistant',
            text: `Hi there! I have finished crawling and indexing **${currentUrl}**.\n\nI processed 24 pages, extracted 84 paragraphs, and generated local search embeddings. Feel free to ask me anything about the content of this website!`,
            sources: [
              {
                title: 'Home Page Index',
                url: `${currentUrl}/`,
                snippet: 'SiteChat local crawler completed crawling main homepage sections and layout templates.'
              },
              {
                title: 'About Knowledge Hub',
                url: `${currentUrl}/about`,
                snippet: 'Company history, executive team info, and services description chunks compiled.'
              }
            ]
          }
        ]);
      }, 800);
      return () => clearTimeout(delay);
    }
  }, [crawlingProgress, appState]);

  // Handle user typing and simulated RAG response
  const handleSendMessage = (text) => {
    // Add user message
    const userMsg = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate RAG retrieval and response
    setTimeout(() => {
      let aiText = '';
      let sources = [];
      const query = text.toLowerCase();

      // Simple keyword matching for nice demo
      if (query.includes('summary') || query.includes('about') || query.includes('what is')) {
        aiText = `Based on the crawled pages, **${currentUrl}** appears to be a modern web service featuring highly responsive layout sections, client assets, and interactive frameworks.\n\nHere is a quick summary:\n1. **Core Purpose**: Offers digital resources, documentation guidelines, and community channels.\n2. **Architecture**: Relies on modern rendering stacks, optimized asset delivery pipelines, and secure user data storage.\n3. **Services**: Provides direct integration hooks, standard developer API keys, and enterprise support schemes.`;
        sources = [
          {
            title: 'Knowledge Base - Index',
            url: `${currentUrl}/docs/getting-started`,
            snippet: 'Getting started guide containing platform architectural design schemas and core features.'
          },
          {
            title: 'Product Overview',
            url: `${currentUrl}/products/overview`,
            snippet: 'Detailed catalog of software resources, API tools, and commercial licenses.'
          }
        ];
      } else if (query.includes('contact') || query.includes('support') || query.includes('help')) {
        aiText = `According to the contact page information indexed:\n- **Support channels**: Available via community discord and email ticket tracking systems.\n- **Technical Assistance**: Accessible on GitHub issues boards for code queries and developer bugs.\n- **Enterprise SLAs**: Managed directly via dedicated service desks.`;
        sources = [
          {
            title: 'Contact Support Channels',
            url: `${currentUrl}/contact`,
            snippet: 'Help center email guidelines, feedback forums, and physical address details.'
          }
        ];
      } else {
        aiText = `Thank you for your question. By query-searching the local RAG index of **${currentUrl}**, I located sections explaining general documentation rules, quick-start templates, and client-side setup configurations. \n\nIs there a specific section or feature (e.g., pricing, installation, support) you would like me to retrieve more context on?`;
        sources = [
          {
            title: 'General Documentation',
            url: `${currentUrl}/docs`,
            snippet: 'Main landing page for developer documentation, code examples, and tutorial workflows.'
          }
        ];
      }

      const assistantMsg = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        text: aiText,
        sources,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1500); // 1.5s typing delay for realism
  };

  const handleClearSession = () => {
    setMessages([]);
    setAppState('landing');
    setCurrentUrl('');
    setCrawlingProgress(0);
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
      {/* Landing State */}
      {appState === 'landing' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center max-w-4xl mx-auto space-y-8.5 select-none">
          {/* Logo Badge */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-500 text-white shadow-xl shadow-cyan-500/20 animate-bounce-slow">
            <MessageSquare size={32} />
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl dark:text-white leading-[1.1] transition-all">
              Chat with any <span className="bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">Website</span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-550 dark:text-zinc-400 max-w-xl mx-auto font-medium">
              Enter a website URL to crawl, index and chat with its content instantly.
            </p>
          </div>

          {/* UrlInput Form */}
          <UrlInput onSubmit={handleUrlSubmit} isLoading={false} />
        </div>
      )}

      {/* Processing State */}
      {appState === 'processing' && (
        <div className="flex-1 flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 overflow-y-auto">
          <ProcessingStatus
            progress={crawlingProgress}
            steps={steps}
            currentUrl={currentUrl}
          />
        </div>
      )}

      {/* Chat / Ready State */}
      {appState === 'ready' && (
        <ChatContainer
          url={currentUrl}
          messages={messages}
          isTyping={isTyping}
          onSendMessage={handleSendMessage}
          onClearSession={handleClearSession}
        />
      )}
    </div>
  );
}
