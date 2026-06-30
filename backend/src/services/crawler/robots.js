import robotsParser from 'robots-parser';
import { logger } from '../../utils/logger.js';

const robotsCache = new Map();

/**
 * @param {string} domainUrl - Domain base url (e.g. https://example.com)
 */
async function fetchAndCacheRobots(domainUrl) {
  if (robotsCache.has(domainUrl)) {
    return robotsCache.get(domainUrl);
  }

  const robotsUrl = new URL('/robots.txt', domainUrl).toString();

  try {
    logger.info(`Fetching robots.txt policy from: ${robotsUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(robotsUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const txt = await response.text();
      const parser = robotsParser(robotsUrl, txt);
      robotsCache.set(domainUrl, parser);
      return parser;
    }
  } catch (error) {
    logger.warn(`Failed to fetch robots.txt from ${robotsUrl}. Defaulting to allow all. Error: ${error.message}`);
  }

  const fallbackParser = robotsParser(robotsUrl, '');
  robotsCache.set(domainUrl, fallbackParser);
  return fallbackParser;
}

/**
 * 
 * @param {string} url - Target URL to check
 * @param {string} userAgent - User agent string
 * @returns {Promise<boolean>}
 */
export async function canCrawl(url, userAgent = 'SiteChatBot') {
  try {
    const urlObj = new URL(url);
    const domainUrl = `${urlObj.protocol}//${urlObj.host}`;

    const parser = await fetchAndCacheRobots(domainUrl);
    const allowed = parser.isAllowed(url, userAgent);

    return allowed !== undefined ? allowed : true;
  } catch (error) {
    logger.error(`Error parsing robots.txt rules for: ${url}`, error);
    return true;
  }
}
