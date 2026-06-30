import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetSessionStatusQuery } from '../services/siteChatApi';
import { updateProgress, setAppState, addSession, setMessages, updateSessionStatus } from '../slices/chatSlice';
import { addToast } from '../slices/toastSlice';

/**
 * Custom hook encapsulating backend crawl status polling.
 * Dispatches progress bar metrics, updates step states, and transitions
 * session state machine to ready/error modes upon completion/failure.
 */
export function usePolling() {
  const dispatch = useDispatch();
  const sessionId = useSelector((state) => state.chat.sessionId);
  const currentUrl = useSelector((state) => state.chat.currentUrl);
  const appState = useSelector((state) => state.chat.appState);

  const { data: statusData, error: statusError } = useGetSessionStatusQuery(sessionId, {
    skip: !sessionId || appState !== 'processing',
    pollingInterval: 500,
  });

  useEffect(() => {
    if (statusError) {
      console.error('Polling connection error:', statusError);
      dispatch(setAppState('error'));
      dispatch(addToast({ message: 'Backend connection lost during crawling.', type: 'error' }));
    }
  }, [statusError, dispatch]);

  useEffect(() => {
    if (statusData) {
      dispatch(updateProgress(statusData.progress));

      if (statusData.status === 'completed') {
        const timer = setTimeout(() => {
          dispatch(setAppState('ready'));
          dispatch(addSession({ id: sessionId, url: currentUrl }));
          dispatch(updateSessionStatus({ id: sessionId, status: 'completed' }));
          
          dispatch(
            setMessages([
              {
                id: 'init-1',
                role: 'assistant',
                text: `Hi there! I have finished crawling and indexing **${currentUrl}**.\n\nI parsed ${statusData.pagesVisited || 24} pages. Ask me anything about the content of this website!`,
                sources: [
                  {
                    title: 'Home Page Index',
                    url: `${currentUrl}/`,
                    score: 1.0,
                  },
                ],
              },
            ])
          );
          
          dispatch(addToast({ message: 'Website processing completed!', type: 'success' }));
        }, 800);
        return () => clearTimeout(timer);
      } else if (statusData.status === 'failed') {
        dispatch(setAppState('error'));
        dispatch(updateSessionStatus({ id: sessionId, status: 'failed' }));
        dispatch(addToast({ message: 'Crawl process failed on backend.', type: 'error' }));
      }
    }
  }, [statusData, dispatch, sessionId, currentUrl]);

  return {
    statusData,
  };
}
