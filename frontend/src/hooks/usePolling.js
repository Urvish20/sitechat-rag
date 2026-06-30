import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetSessionStatusQuery } from '../services/siteChatApi';
import {
  updateProgress,
  updateStageFromBackend,
  setAppState,
  addSession,
  setMessages,
  updateSessionStatus,
} from '../slices/chatSlice';
import { addToast } from '../slices/toastSlice';

/**
 * Custom hook that polls backend session status every 500ms during processing.
 * Drives the step checklist via backend stage strings, updates counters, and
 * transitions the state machine to ready/error when the pipeline completes.
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
      console.error('[usePolling] Polling error:', statusError);
      dispatch(setAppState('error'));
      dispatch(addToast({ message: 'Backend connection lost during processing.', type: 'error' }));
    }
  }, [statusError, dispatch]);

  useEffect(() => {
    if (!statusData) return;

    // Update progress bar
    dispatch(updateProgress(statusData.progress ?? 0));

    // Drive checklist steps from backend stage string
    dispatch(
      updateStageFromBackend({
        stage: statusData.stage,
        chunksCreated: statusData.chunksCreated,
        embeddingsCreated: statusData.embeddingsCreated,
        vectorsStored: statusData.vectorsStored,
      })
    );

    const isReady = statusData.status === 'ready' || statusData.status === 'completed';

    if (isReady) {
      const pagesVisited = statusData.pagesVisited ?? 0;
      const chunksCreated = statusData.chunksCreated ?? 0;
      const vectorsStored = statusData.vectorsStored ?? 0;

      const timer = setTimeout(() => {
        dispatch(setAppState('ready'));
        dispatch(addSession({ id: sessionId, url: currentUrl }));
        dispatch(updateSessionStatus({ id: sessionId, status: 'completed' }));

        dispatch(
          setMessages([
            {
              id: 'init-ready',
              role: 'assistant',
              text: [
                `✅ I've finished crawling and indexing **${currentUrl}**.`,
                '',
                `📄 **${pagesVisited}** pages crawled`,
                `🧩 **${chunksCreated}** text chunks created`,
                `🔍 **${vectorsStored}** vectors stored in Qdrant`,
                '',
                'Ask me anything about the content of this website!',
              ].join('\n'),
              sources: [],
            },
          ])
        );

        dispatch(addToast({ message: 'Website is indexed and ready to chat!', type: 'success' }));
      }, 600);

      return () => clearTimeout(timer);
    }

    if (statusData.status === 'failed') {
      dispatch(setAppState('error'));
      dispatch(updateSessionStatus({ id: sessionId, status: 'failed' }));
      dispatch(addToast({ message: 'Pipeline failed on the backend. Check server logs.', type: 'error' }));
    }
  }, [statusData, dispatch, sessionId, currentUrl]);

  return { statusData };
}
