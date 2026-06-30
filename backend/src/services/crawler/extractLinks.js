const BINARY_EXTENSIONS = /\.(pdf|zip|tar|gz|exe|apk|dmg|iso|png|jpe?g|gif|webp|svg|mp[34]|wav|ogg|aac|flac|docx?|xlsx?|pptx?|csv|rss|atom|xml|feed)$/i;
const IGNORED_PROTOCOLS = /^(mailto|tel|javascript|sms|file|data|ftp):/i;

/**
 * Extracts, normalizes, and deduplicates internal links from raw HTML.
 * Query parameters and URL fragments are stripped to prevent crawling
 * duplicate page variants (e.g. ?ref=nav and ?ref=footer of the same page).
 *
 * @param {string} html       - Raw HTML document string.
 * @param {string} currentUrl - Absolute URL of the page being parsed.
 * @returns {string[]} Unique normalized internal URLs.
 */
export function extractLinks(html, currentUrl) {
  const base = new URL(currentUrl);
  const domain = base.host;

  const hrefRegex = /href\s*=\s*(?:["']([^"']*)["']|([^>\s]*))/gi;
  const seen = new Set();
  const links = [];

  let match;
  while ((match = hrefRegex.exec(html)) !== null) {
    let raw = (match[1] ?? match[2] ?? '').trim();

    if (!raw || raw.startsWith('#')) continue;
    if (IGNORED_PROTOCOLS.test(raw)) continue;
    if (BINARY_EXTENSIONS.test(raw)) continue;

    try {
      const parsed = new URL(raw, currentUrl);

      if (parsed.host !== domain) continue;

      // Strip query string and fragment — treat /page?a=1 and /page?a=2 as the same page
      let normalized = parsed.origin + parsed.pathname;

      // Remove trailing slash (except root)
      if (normalized.length > parsed.origin.length + 1 && normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1);
      }

      if (!seen.has(normalized)) {
        seen.add(normalized);
        links.push(normalized);
      }
    } catch {
      // Malformed href — skip silently
    }
  }

  return links;
}
