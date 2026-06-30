import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { siteChatApi } from '../src/services/siteChatApi.js';
import chatReducer from '../src/slices/chatSlice.js';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    [siteChatApi.reducerPath]: siteChatApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(siteChatApi.middleware),
});

setupListeners(store.dispatch);
