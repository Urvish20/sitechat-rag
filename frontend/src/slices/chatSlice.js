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
  appState: 'landing', // 'landing' | 'processing' | 'ready'
  currentUrl: '',
  sessionId: null,
  crawlingProgress: 0,
  steps: initialSteps,
  messages: [],
  sessions: [
    {
      id: 'sess-1',
      url: 'https://tailwindcss.com',
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
    },
    setAppState: (state, action) => {
      state.appState = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    resetSession: (state) => {
      state.appState = 'landing';
      state.currentUrl = '';
      state.sessionId = null;
      state.crawlingProgress = 0;
      state.steps = initialSteps;
      state.messages = [];
      state.activeSessionId = null;
    },
    addSession: (state, action) => {
      const url = action.payload.url;
      const id = action.payload.id;
      // Prevent duplication in recent history list
      const exists = state.sessions.some(s => s.url === url);
      if (!exists) {
        state.sessions.unshift({
          id,
          url,
          messages: []
        });
      }
      state.activeSessionId = id;
    },
    selectSession: (state, action) => {
      const session = action.payload;
      state.activeSessionId = session.id;
      state.currentUrl = session.url;
      state.sessionId = session.id; // use session ID directly
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
} = chatSlice.actions;

export default chatSlice.reducer;
