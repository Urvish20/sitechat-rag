import { createSlice } from '@reduxjs/toolkit';

const initialSteps = [
  { id: 'crawl', label: 'Crawling Website', status: 'pending' },
  { id: 'extract', label: 'Extracting Content', status: 'pending' },
  { id: 'clean', label: 'Cleaning HTML', status: 'pending' },
  { id: 'chunk', label: 'Chunking Content', status: 'pending' },
  { id: 'embed', label: 'Creating Embeddings', status: 'pending' },
  { id: 'index', label: 'Building Search Index', status: 'pending' },
];

const initialState = {
  appState: 'idle', // 'idle' | 'processing' | 'ready' | 'chatting' | 'deleting' | 'error'
  currentUrl: '',
  sessionId: null,
  crawlingProgress: 0,
  steps: initialSteps,
  messages: [],
  sessions: [
    {
      id: 'sess-1',
      url: 'https://tailwindcss.com',
      status: 'completed',
      progress: 100,
      messages: [
        {
          id: 'prev-1',
          role: 'assistant',
          text: 'Welcome back! I have cached the Tailwind v4 index. Ask me any syntax queries.',
          sources: []
        }
      ]
    },
    {
      id: 'sess-2',
      url: 'https://react.dev',
      status: 'completed',
      progress: 100,
      messages: [
        {
          id: 'prev-2',
          role: 'assistant',
          text: 'React 19 documentation is fully cached. How can I assist you with hooks?',
          sources: []
        }
      ]
    }
  ],
  activeSessionId: null,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    startSession: (state, action) => {
      state.currentUrl = action.payload;
      state.appState = 'processing';
      state.crawlingProgress = 0;
      state.sessionId = null;
      state.steps = initialSteps.map(step => ({ ...step, status: 'pending' }));
      state.steps[0].status = 'running';
      state.messages = [];
    },
    setSessionId: (state, action) => {
      state.sessionId = action.payload;
    },
    updateProgress: (state, action) => {
      const progress = action.payload;
      state.crawlingProgress = progress;
      
      const stepCount = state.steps.length;
      state.steps = state.steps.map((step, idx) => {
        const threshold = (idx + 1) * (100 / stepCount);
        if (progress >= 100) {
          return { ...step, status: 'completed' };
        } else if (progress >= threshold) {
          return { ...step, status: 'completed' };
        } else if (progress >= threshold - (100 / stepCount) && step.status === 'pending') {
          return { ...step, status: 'running' };
        }
        return step;
      });

      // Update progress in session object list
      if (state.sessionId) {
        const session = state.sessions.find(s => s.id === state.sessionId);
        if (session) {
          session.progress = progress;
        }
      }
    },
    setAppState: (state, action) => {
      state.appState = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      // Synchronize back to active history list
      if (state.activeSessionId) {
        const session = state.sessions.find(s => s.id === state.activeSessionId);
        if (session) {
          session.messages = state.messages;
        }
      }
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
      if (state.activeSessionId) {
        const session = state.sessions.find(s => s.id === state.activeSessionId);
        if (session) {
          session.messages = state.messages;
        }
      }
    },
    clearMessages: (state) => {
      state.messages = [];
      if (state.activeSessionId) {
        const session = state.sessions.find(s => s.id === state.activeSessionId);
        if (session) {
          session.messages = [];
        }
      }
    },
    resetSession: (state) => {
      state.appState = 'idle';
      state.currentUrl = '';
      state.sessionId = null;
      state.crawlingProgress = 0;
      state.steps = initialSteps;
      state.messages = [];
      state.activeSessionId = null;
    },
    addSession: (state, action) => {
      const { url, id } = action.payload;
      const exists = state.sessions.some(s => s.url === url);
      if (!exists) {
        state.sessions.unshift({
          id,
          url,
          status: 'completed',
          progress: 100,
          messages: []
        });
      }
      state.activeSessionId = id;
    },
    selectSession: (state, action) => {
      // Disallow context change during processing
      if (state.appState === 'processing' || state.appState === 'deleting') return;

      const session = action.payload;
      state.activeSessionId = session.id;
      state.currentUrl = session.url;
      state.sessionId = session.id;
      state.appState = 'ready';
      
      const foundSession = state.sessions.find(s => s.id === session.id);
      if (foundSession && foundSession.messages.length > 0) {
        state.messages = foundSession.messages;
      } else {
        state.messages = [
          {
            id: 'sess-greet',
            role: 'assistant',
            text: `Loaded cached index for **${session.url}**. Ask me any question related to this website's knowledge-base!`,
            sources: []
          }
        ];
      }
    },
    updateSessionMessages: (state, action) => {
      const { sessionId, messages } = action.payload;
      const session = state.sessions.find(s => s.id === sessionId);
      if (session) {
        session.messages = messages;
      }
    },
    updateSessionStatus: (state, action) => {
      const { id, status } = action.payload;
      const session = state.sessions.find(s => s.id === id);
      if (session) {
        session.status = status;
      }
    }
  },
});

export const {
  startSession,
  setSessionId,
  updateProgress,
  setAppState,
  addMessage,
  setMessages,
  clearMessages,
  resetSession,
  addSession,
  selectSession,
  updateSessionMessages,
  updateSessionStatus,
} = chatSlice.actions;

export default chatSlice.reducer;
