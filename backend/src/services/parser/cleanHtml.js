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

  $(REMOVE_TAGS.join(',')).remove();
  $(COOKIE_SELECTORS.join(',')).remove();
  $(AD_SELECTORS.join(',')).remove();

  $('[hidden]').remove();
  $('[aria-hidden="true"]').remove();
  
  $('*').each((_, el) => {
    const style = $(el).attr('style');
    if (style && /display\s*:\s*none/i.test(style)) {
      $(el).remove();
    }
  });

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
