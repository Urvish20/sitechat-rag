/**
 * Extracts and normalizes internal absolute links from raw HTML content.
 * 
 * @param {string} html - Raw HTML document string.
 * @param {string} currentUrl - Absolute URL of the page containing the html.
 * @returns {Array<string>} List of unique internal absolute URLs.
 */
export function extractLinks(html, currentUrl) {
  const links = [];
  const urlObj = new URL(currentUrl);
  const domain = urlObj.host;

  const hrefRegex = /href\s*=\s*(?:["']([^"']*)["']|([^>\s]*))/gi;
  let match;

  while ((match = hrefRegex.exec(html)) !== null) {
    let link = match[1] || match[2];
    if (!link) continue;

    link = link.trim();

    if (link.startsWith('#')) continue;

    if (/^(mailto|tel|javascript|sms|file):/i.test(link)) continue;

    if (/\.(pdf|zip|tar|gz|exe|apk|png|jpe?g|gif|webp|svg|mp[34]|wav|ogg|docx?|xlsx?|pptx?)$/i.test(link)) {
      continue;
    }

    try {
      const absoluteUrl = new URL(link, currentUrl);

      if (absoluteUrl.host !== domain) continue;

      let normalized = absoluteUrl.origin + absoluteUrl.pathname;
      if (normalized.endsWith('/') && normalized.length > absoluteUrl.origin.length + 1) {
        normalized = normalized.slice(0, -1);
      }

      links.push(normalized);
    } catch (e) {
      // Ignore
    }
  }

  return [...new Set(links)];
}
