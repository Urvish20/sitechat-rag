import Queue from './queue.js';
import { canCrawl } from './robots.js';
import { extractLinks } from './extractLinks.js';
import { initBrowser, crawlPage } from './crawlPage.js';
import { sessionStore } from '../session/session.store.js';
import { delay } from '../../utils/helpers.js';
import { logger } from '../../utils/logger.js';
import { SESSION_STATUS } from '../../utils/constants.js';
import { cleanHtml } from '../parser/cleanHtml.js';
import { extractContent } from '../parser/extractContent.js';

/**
 * 
 * @param {string} sessionId - Associated crawl session uuid.
 * @param {string} startUrl - Initial seed URL.
 * @returns {Promise<Array<{url: string, title: string, html: string}>>} List of crawled pages.
 */
export async function crawlWebsite(sessionId, startUrl) {
  logger.info(`Starting crawl for session: ${sessionId} starting at ${startUrl}`);

  const visited = new Set();
  const queue = new Queue();
  const crawledPages = [];

  const startUrlObj = new URL(startUrl);
  const domain = startUrlObj.host;

  queue.enqueue({ url: startUrl, depth: 0 });

  const browser = await initBrowser();
  const context = await browser.newContext({
    userAgent: 'SiteChatBot/1.0',
    viewport: { width: 1280, height: 800 }
  });

  try {
    while (!queue.isEmpty() && crawledPages.length < 50) {
      const currentItem = queue.dequeue();
      const { url, depth } = currentItem;

      if (visited.has(url)) continue;
      visited.add(url);

      const allowed = await canCrawl(url);
      if (!allowed) {
        logger.info(`Skipping robots.txt blocked page: ${url}`);
        continue;
      }

      if (depth > 3) continue;

      const session = await sessionStore.get(sessionId);
      if (session) {
        session.currentPage = url;
        session.progress = Math.min(99, Math.floor((crawledPages.length / 50) * 100));
        await sessionStore.set(sessionId, session);
      }

      logger.info(`Crawling page: ${url} (${crawledPages.length + 1} / 50)`);

      try {
        const pageData = await crawlPage(context, url);

        console.log(`Cleaning\n${url}`);
        const cleanedHtml = cleanHtml(pageData.html);
        console.log('Skipped\nFooter\nNavigation\nCookie Banner');

        const extracted = extractContent({
          url: pageData.url,
          title: pageData.title,
          html: cleanedHtml,
        });

        if (!extracted) {
          logger.warn(`Skipping page with insufficient content (<100 chars): ${url}`);
          if (depth < 3) {
            const links = extractLinks(pageData.html, url);
            logger.info(`Found ${links.length} internal links on skipped page: ${url}`);
            for (const link of links) {
              if (!visited.has(link)) {
                queue.enqueue({ url: link, depth: depth + 1 });
              }
            }
          }
          await delay(500);
          continue;
        }

        console.log(`Extracted\n${extracted.content.length} characters`);

        const parsedPage = {
          url: pageData.url,
          title: pageData.title,
          content: extracted.content,
        };

        crawledPages.push(parsedPage);

        const currentSession = await sessionStore.get(sessionId);
        if (currentSession) {
          if (!currentSession.pages) currentSession.pages = [];
          currentSession.pages.push({ url: parsedPage.url, title: parsedPage.title });
          currentSession.pagesVisited = crawledPages.length;
          await sessionStore.set(sessionId, currentSession);
        }

        await delay(500);

        if (depth < 3) {
          const links = extractLinks(pageData.html, url);
          logger.info(`Found ${links.length} internal links on page: ${url}`);

          for (const link of links) {
            if (!visited.has(link)) {
              queue.enqueue({ url: link, depth: depth + 1 });
            }
          }
        }
      } catch (pageError) {
        logger.warn(`Skipping failed URL "${url}": ${pageError.message}`);
      }
    }

    logger.info(`Finished crawling for session ${sessionId}. Total: ${crawledPages.length} pages.`);

    const finalSession = await sessionStore.get(sessionId);
    if (finalSession) {
      finalSession.status = SESSION_STATUS.COMPLETED;
      finalSession.progress = 100;
      finalSession.currentPage = 'Completed';
      finalSession.totalPages = crawledPages.length;
      await sessionStore.set(sessionId, finalSession);
    }
  } catch (error) {
    logger.error(`Critical error crawling session ${sessionId}:`, error);
    const errorSession = await sessionStore.get(sessionId);
    if (errorSession) {
      errorSession.status = SESSION_STATUS.FAILED;
      await sessionStore.set(sessionId, errorSession);
    }
  } finally {
    await context.close();
  }

  return crawledPages;
}
