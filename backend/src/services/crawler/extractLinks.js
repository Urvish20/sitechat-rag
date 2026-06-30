import * as cheerio from 'cheerio';

const LOW_VALUE_PATTERNS = [
  '/search', '/feed', '/rss', '/tag/', '/author/', '/login', '/signup',
  '/logout', '/cart', '/privacy', '/terms', '/contact', '/sitemap', '/toc'
];

/**
 * Normalizes a URL by removing trailing slashes, hash fragments, and tracking query params.
 *
 * @param {string} urlStr  - Raw URL to normalize.
 * @param {string} baseUrl - Base URL to resolve relative paths.
 * @returns {string} Normalized absolute URL.
 */
export function normalizeUrl(urlStr, baseUrl) {
  try {
    const parsed = new URL(urlStr, baseUrl);
    
    // Strip hash fragment
    parsed.hash = '';
    
    // List of tracking/non-essential query parameters to strip
    const trackingParams = [
      'ref', 'fbclid', 'gclid', 'dclid', 'msclkid', 'clickid', 'cx', 'cof', 'ie', 'siteurl',
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_cid', 'utm_reader'
    ];
    
    const searchParams = parsed.searchParams;
    for (const param of trackingParams) {
      searchParams.delete(param);
    }
    
    // Strip any parameters starting with 'utm_'
    for (const key of Array.from(searchParams.keys())) {
      if (key.toLowerCase().startsWith('utm_')) {
        searchParams.delete(key);
      }
    }
    
    // Strip trailing slash if not root
    let pathname = parsed.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    parsed.pathname = pathname;
    
    return parsed.toString();
  } catch {
    return urlStr;
  }
}

/**
 * Checks if a URL contains low-value paths or binary extensions.
 *
 * @param {string} urlStr - URL to evaluate.
 * @returns {boolean} True if URL is low-value/binary and should be skipped.
 */
export function isLowValueUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    const lowerPath = parsed.pathname.toLowerCase();
    
    // Check against standard low-value routes
    if (LOW_VALUE_PATTERNS.some(pattern => lowerPath.includes(pattern))) {
      return true;
    }
    
    // Skip binary extension file links
    const binaryExtensions = /\.(pdf|zip|tar|gz|exe|apk|dmg|iso|png|jpe?g|gif|webp|svg|mp[34]|wav|ogg|aac|flac|docx?|xlsx?|pptx?|csv|rss|atom|xml|feed)$/i;
    if (binaryExtensions.test(lowerPath)) {
      return true;
    }
    
    return false;
  } catch {
    return true;
  }
}

/**
 * Extracts, normalizes, and deduplicates internal links from raw HTML.
 * Uses Cheerio for DOM selector extraction instead of fragile regex patterns.
 *
 * @param {string} html       - Raw HTML document string.
 * @param {string} currentUrl - Absolute URL of the page being parsed.
 * @param {object} [stats]    - Optional statistics collector object.
 * @returns {string[]} Unique normalized internal URLs.
 */
export function extractLinks(html, currentUrl, stats = {}) {
  const links = [];
  try {
    const $ = cheerio.load(html);
    const base = new URL(currentUrl);
    const domain = base.host;

    $('a[href]').each((_, element) => {
      let rawHref = $(element).attr('href');
      if (!rawHref) return;
      rawHref = rawHref.trim();

      // Skip hashes, fragment navigation, and non-HTTP protocols
      if (!rawHref || rawHref.startsWith('#')) return;
      if (/^(mailto|tel|javascript|sms|file|data|ftp):/i.test(rawHref)) return;

      try {
        const resolvedUrl = new URL(rawHref, currentUrl);
        
        // Skip external links
        if (resolvedUrl.host !== domain) {
          if (stats) stats.externalUrlsSkipped = (stats.externalUrlsSkipped || 0) + 1;
          return;
        }

        const normalized = normalizeUrl(resolvedUrl.toString(), currentUrl);
        
        // Skip low-value or media content
        if (isLowValueUrl(normalized)) {
          return;
        }

        links.push(normalized);
      } catch {
        // Skip malformed links
      }
    });
  } catch {
    // Cheerio parse error fallback
  }
  return [...new Set(links)];
}
