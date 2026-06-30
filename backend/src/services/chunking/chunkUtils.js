/**
 * Splits text into paragraphs/sentences without exceeding the maximum chunk size,
 * trying to preserve sentence or word boundaries where possible.
 * 
 * @param {string} text - Raw text content.
 * @param {number} chunkSize - Max characters per chunk (default 1000).
 * @param {number} overlap - Overlapping character context (default 200).
 * @returns {Array<string>} Array of raw text chunks.
 */
export function splitIntoChunks(text, chunkSize = 1000, overlap = 200) {
  if (!text) return [];
  if (text.length <= chunkSize) {
    return [text];
  }

  const chunks = [];
  let currentIndex = 0;
  const textLength = text.length;

  while (currentIndex < textLength) {
    let endIndex = currentIndex + chunkSize;

    if (endIndex >= textLength) {
      chunks.push(text.slice(currentIndex));
      break;
    }

    const lookbackLimit = endIndex - Math.floor(chunkSize * 0.25);
    let boundaryIndex = -1;

    for (let i = endIndex; i > lookbackLimit; i--) {
      const char = text[i];
      const prevChar = text[i - 1];

      if ((char === ' ' || char === '\n') && ['.', '!', '?'].includes(prevChar)) {
        boundaryIndex = i;
        break;
      }
    }

    if (boundaryIndex === -1) {
      for (let i = endIndex; i > lookbackLimit; i--) {
        const char = text[i];
        if (char === ' ' || char === '\n') {
          boundaryIndex = i;
          break;
        }
      }
    }

    if (boundaryIndex === -1) {
      boundaryIndex = endIndex;
    }

    const chunk = text.slice(currentIndex, boundaryIndex);
    chunks.push(chunk);

    currentIndex = boundaryIndex - overlap;

    if (currentIndex <= 0 || currentIndex >= textLength || boundaryIndex <= currentIndex) {
      break;
    }
  }

  return chunks;
}

/**
 * Trims spacing and normalizes multi-newline blocks.
 * 
 * @param {string} text - Raw chunk segment.
 * @returns {string} Cleaned chunk segment.
 */
export function cleanChunk(text) {
  if (!text) return '';
  let cleaned = text.trim();
  cleaned = cleaned.replace(/\n\s*\n/g, '\n\n');
  return cleaned;
}
