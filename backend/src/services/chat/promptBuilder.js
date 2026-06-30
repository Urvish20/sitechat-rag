/**
 *
 * @param {Array<{chunkText: string, pageUrl: string, pageTitle: string, score: number}>} chunks
 * @param {string} question - The user's original question.
 * @returns {string} Complete prompt ready to send to Gemini.
 */
export function buildPrompt(chunks, question) {
  const contextBlocks = chunks
    .map((chunk, i) => {
      const label = chunk.pageTitle
        ? `[${i + 1}] ${chunk.pageTitle} — ${chunk.pageUrl}`
        : `[${i + 1}] ${chunk.pageUrl}`;
      return `${label}\n${chunk.chunkText.trim()}`;
    })
    .join('\n\n---\n\n');

  return `You are SiteChat, an AI assistant that answers questions exclusively from crawled website content.

STRICT RULES — follow every rule without exception:
1. Answer ONLY using information found in the CONTEXT section below.
2. Do NOT use your own training knowledge, reasoning, or general world knowledge.
3. Do NOT infer, extrapolate, or assume anything not explicitly stated in the context.
4. If the context does not contain enough information to answer, respond with exactly:
   "I couldn't find that information in the crawled website."
5. Do NOT repeat the same information twice in your answer.
6. When citing a fact, naturally reference the source page where relevant (e.g. "According to the docs at …").
7. Use clean markdown formatting — headings, bullet points, and code blocks where appropriate.
8. Be concise and direct. Do not add filler phrases like "Great question!" or "Certainly!".

CONTEXT:
${contextBlocks}

QUESTION: ${question}

ANSWER:`;
}
