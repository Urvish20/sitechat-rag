import * as cheerio from 'cheerio';
import { REMOVE_TAGS, COOKIE_SELECTORS, AD_SELECTORS } from './selectors.js';

/**
 * Sanitizes a raw HTML page by stripping scripts, styles, layouts, ads,
 * cookie bars, hidden elements, and empty parent wrapper blocks.
 * 
 * @param {string} html - Raw HTML source.
 * @returns {string} Cleaned HTML markup.
 */
export function cleanHtml(html) {
  if (!html) return '';

  const $ = cheerio.load(html);

  // 1. Strip unwanted HTML elements
  $(REMOVE_TAGS.join(',')).remove();

  // 2. Strip cookie consent banners and overlay walls
  $(COOKIE_SELECTORS.join(',')).remove();

  // 3. Strip promotion ads, newsletters, and social buttons
  $(AD_SELECTORS.join(',')).remove();

  // 4. Remove elements marked hidden by attributes or styles
  $('[hidden]').remove();
  $('[aria-hidden="true"]').remove();
  
  $('*').each((_, el) => {
    const style = $(el).attr('style');
    if (style && /display\s*:\s*none/i.test(style)) {
      $(el).remove();
    }
  });

  // 5. Clean up recursively any empty nodes (skipping key exceptions)
  const stripEmptyNodes = () => {
    let changed = false;
    $(':empty').each((_, el) => {
      const tagName = el.name;
      if (tagName && !['pre', 'code', 'br', 'hr', 'img', 'a'].includes(tagName)) {
        $(el).remove();
        changed = true;
      }
    });
    if (changed) stripEmptyNodes();
  };
  
  stripEmptyNodes();

  return $.html();
}
