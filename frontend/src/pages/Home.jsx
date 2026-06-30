import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MessageSquare } from 'lucide-react';
import UrlInput from '../components/crawler/UrlInput';
import ProcessingStatus from '../components/crawler/ProcessingStatus';
import ChatContainer from '../components/chat/ChatContainer';
import {
  startSession,
  setSessionId,
  updateProgress,
  setAppState,
  addMessage,
  setMessages,
  resetSession,
  addSession,
} from '../slices/chatSlice';
import {
  useCreateSessionMutation,
  useGetSessionStatusQuery,
  useDeleteSessionMutation,
  useAskQuestionMutation,
} from '../services/siteChatApi';

export default function Home() {
  const dispatch = useDispatch();
  const [isTyping, setIsTyping] = useState(false);

  // Redux selectors
  const appState = useSelector((state) => state.chat.appState);
  const currentUrl = useSelector((state) => state.chat.currentUrl);
  const sessionId = useSelector((state) => state.chat.sessionId);
  const crawlingProgress = useSelector((state) => state.chat.crawlingProgress);
  const steps = useSelector((state) => state.chat.steps);
  const messages = useSelector((state) => state.chat.messages);

  // RTK Query hooks
  const [createSession] = useCreateSessionMutation();
  const [deleteSession] = useDeleteSessionMutation();
  const [askQuestion] = useAskQuestionMutation();

  // Query session status - conditional polling
  const { data: statusData } = useGetSessionStatusQuery(sessionId, {
    skip: !sessionId || appState !== 'processing',
    pollingInterval: 500, // poll status every 500ms
  });

  // Watch polling updates
  useEffect(() => {
    if (statusData) {
      dispatch(updateProgress(statusData.progress));

      if (statusData.status === 'completed') {
        const timer = setTimeout(() => {
          dispatch(setAppState('ready'));
          dispatch(addSession({ id: sessionId, url: currentUrl }));
          dispatch(
            setMessages([
              {
                id: 'init-1',
                role: 'assistant',
                text: `Hi there! I have finished crawling and indexing **${currentUrl}**.\n\nI processed 24 pages, extracted 84 paragraphs, and generated local search embeddings. Feel free to ask me anything about the content of this website!`,
                sources: [
                  {
                    title: 'Home Page Index',
                    url: `${currentUrl}/`,
                    snippet: 'SiteChat local crawler completed crawling main homepage sections and layout templates.',
                  },
                  {
                    title: 'About Knowledge Hub',
                    url: `${currentUrl}/about`,
                    snippet: 'Company history, executive team info, and services description chunks compiled.',
                  },
                ],
              },
            ])
          );
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [statusData, dispatch, sessionId, currentUrl]);

  // Submit URL handler
  const handleUrlSubmit = async (url) => {
    try {
      // Setup initial visual status
      dispatch(startSession(url));

      // Trigger mutation call to backend
      const response = await createSession(url).unwrap();
      dispatch(setSessionId(response.sessionId));
    } catch (err) {
      console.error('Failed to create session on backend:', err);
      dispatch(resetSession());
    }
  };

  // Chat message send handler
  const handleSendMessage = async (text) => {
    const userMsg = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text,
    };
    dispatch(addMessage(userMsg));
    setIsTyping(true);

    try {
      // Trigger mutation call to backend
      const response = await askQuestion({ sessionId, question: text }).unwrap();
      
      const assistantMsg = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        text: response.answer,
        sources: response.sources.map((src) => ({
          title: src.title,
          url: src.url,
          snippet: `Retrieved context regarding "${text}" from indexed content.`,
        })),
      };
      dispatch(addMessage(assistantMsg));
    } catch (err) {
      console.error('Failed to ask question:', err);
      dispatch(
        addMessage({
          id: `msg-${Date.now()}-error`,
          role: 'assistant',
          text: 'Sorry, I encountered an error communicating with the backend. Please check if the server is running.',
          sources: [],
        })
      );
    } finally {
      setIsTyping(false);
    }
  };

  // Clear session handler
  const handleClearSession = async () => {
    try {
      if (sessionId) {
        await deleteSession(sessionId).unwrap();
      }
    } catch (err) {
      console.error('Failed to delete session on backend:', err);
    } finally {
      dispatch(resetSession());
    }
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
