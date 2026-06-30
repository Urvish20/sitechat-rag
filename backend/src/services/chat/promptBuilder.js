/**
 * Assembles a grounded RAG prompt from retrieved context chunks and the user question.
 *
 * @param {Array<{chunkText: string, pageUrl: string, pageTitle: string}>} chunks
 * @param {string} question - The user's original question.
 * @returns {string} Complete prompt string ready to send to Gemini.
 */
export function buildPrompt(chunks, question) {
  const contextBlocks = chunks
    .map((chunk, i) => {
      const source = chunk.pageTitle ? `[${chunk.pageTitle}](${chunk.pageUrl})` : chunk.pageUrl;
      return `--- Context ${i + 1} (Source: ${source}) ---\n${chunk.chunkText.trim()}`;
    })
    .join('\n\n');

  return `You are a helpful AI assistant for SiteChat.

Your job is to answer questions strictly based on the provided context retrieved from a crawled website.

Rules:
- Only use information from the context below to answer.
- Do not use your own training knowledge or make up information.
- If the answer cannot be found in the context, reply exactly: "I couldn't find that information in the crawled website."
- Be concise, accurate, and direct.
- Use markdown formatting where appropriate.

Context:
${contextBlocks}

Question: ${question}

Answer:`;
}
