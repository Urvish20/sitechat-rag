import { useDispatch, useSelector } from 'react-redux';
import { useCreateSessionMutation, useDeleteSessionMutation } from '../services/siteChatApi';
import { startSession, setSessionId, resetSession, setAppState } from '../slices/chatSlice';
import { addToast } from '../slices/toastSlice';

/**
 * Custom hook managing crawlers session state machine transitions,
 * API mutations, and pushing user toast warnings/notices.
 */
export function useSession() {
  const dispatch = useDispatch();
  const sessionId = useSelector((state) => state.chat.sessionId);
  const currentUrl = useSelector((state) => state.chat.currentUrl);
  const appState = useSelector((state) => state.chat.appState);

  const [createSessionMutation, { isLoading: isCreating }] = useCreateSessionMutation();
  const [deleteSessionMutation, { isLoading: isDeleting }] = useDeleteSessionMutation();

  const handleCreateSession = async (url) => {
    // Basic regex URL check
    if (!/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i.test(url)) {
      dispatch(addToast({ message: 'Invalid URL. Please enter a valid website address.', type: 'error' }));
      return;
    }

    try {
      dispatch(startSession(url));
      dispatch(addToast({ message: 'Website processing and crawling started...', type: 'info' }));
      
      const res = await createSessionMutation(url).unwrap();
      dispatch(setSessionId(res.sessionId));
    } catch (error) {
      console.error('Failed to initialize session crawler:', error);
      dispatch(setAppState('error'));
      dispatch(addToast({ message: 'Backend connection offline or timed out.', type: 'error' }));
    }
  };

  const handleDeleteSession = async () => {
    if (!sessionId) return;
    try {
      dispatch(setAppState('deleting'));
      dispatch(addToast({ message: 'Cleaning session index...', type: 'info' }));
      
      await deleteSessionMutation(sessionId).unwrap();
      dispatch(addToast({ message: 'Session index deleted successfully.', type: 'success' }));
    } catch (error) {
      console.error('Failed to delete session:', error);
      dispatch(addToast({ message: 'Failed to delete session vectors from database.', type: 'error' }));
    } finally {
      dispatch(resetSession());
    }
  };

  return {
    sessionId,
    currentUrl,
    appState,
    isCreating,
    isDeleting,
    createSession: handleCreateSession,
    deleteSession: handleDeleteSession,
  };
}
