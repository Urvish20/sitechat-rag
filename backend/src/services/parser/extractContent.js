import * as cheerio from 'cheerio';

// Leaf block text elements to pull text from directly without duplicating container parent texts
const LEAF_TEXT_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'li', 'pre', 'code', 'blockquote'
];

/**
 * Extracts normalized, meaningful text content from clean HTML.
 * Skips pages containing less than 100 characters of data.
 * 
 * @param {object} page - Visited page details.
 * @param {string} page.url - Page URL.
 * @param {string} page.title - Page title.
 * @param {string} page.html - Clean HTML markup.
 * @returns {object|null} Object containing URL, title, and content, or null if page is skipped.
 */
export function extractContent({ url, title, html }) {
  if (!html) return null;

  const $ = cheerio.load(html);
  const textBlocks = [];

  // Anchor text extraction inside main body tags first (article/main) or default to body
  const targetRoot = $('main, article').length > 0 ? $('main, article').first() : $('body');

  // Extract from leaf block elements
  targetRoot.find(LEAF_TEXT_TAGS.join(',')).each((_, el) => {
    const text = $(el).text().trim();
    if (text) {
      textBlocks.push(text);
    }
  });

  // Fallback to body text elements if leaf nodes returned empty
  if (textBlocks.length === 0) {
    const text = targetRoot.text().trim();
    if (text) textBlocks.push(text);
  }

  // Normalize duplicate blank lines and trim extra space layouts
  let content = textBlocks.join('\n');
  content = content.replace(/[ \t]+/g, ' '); // remove double spaces
  content = content.replace(/\n\s*\n/g, '\n\n'); // normalize double newlines
  content = content.trim();

  // Skip pages with insufficient content (under 100 characters)
  if (content.length < 100) {
    return null;
  }

  return {
    url,
    title,
    content,
  };
}
