import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { siteChatApi } from '../src/services/siteChatApi.js';
import chatReducer from '../src/slices/chatSlice.js';
import toastReducer from '../src/slices/toastSlice.js';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    toast: toastReducer,
    [siteChatApi.reducerPath]: siteChatApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(siteChatApi.middleware),
});

setupListeners(store.dispatch);
