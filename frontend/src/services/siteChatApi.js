import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const siteChatApi = createApi({
  reducerPath: 'siteChatApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({
    createSession: builder.mutation({
      query: (url) => ({
        url: 'api/session',
        method: 'POST',
        body: { url },
      }),
    }),
    getSessionStatus: builder.query({
      query: (sessionId) => `api/session/${sessionId}/status`,
    }),
    deleteSession: builder.mutation({
      query: (sessionId) => ({
        url: `api/session/${sessionId}`,
        method: 'DELETE',
      }),
    }),
    askQuestion: builder.mutation({
      query: ({ sessionId, question }) => ({
        url: 'api/chat',
        method: 'POST',
        body: { sessionId, question },
      }),
    }),
  }),
});

export const {
  useCreateSessionMutation,
  useGetSessionStatusQuery,
  useLazyGetSessionStatusQuery,
  useDeleteSessionMutation,
  useAskQuestionMutation,
} = siteChatApi;
