import { chromium } from 'playwright';
import { logger } from '../../utils/logger.js';
import { delay } from '../../utils/helpers.js';

let browser = null;

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

/**
 * Initializes the Playwright Chromium browser singleton.
 */
export async function initBrowser() {
  if (!browser) {
    logger.info('Launching Playwright Chromium browser instance...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  }
  return browser;
}

/**
 * Terminates the Playwright browser singleton and clears the reference.
 */
export async function closeBrowser() {
  if (browser) {
    logger.info('Terminating Playwright Chromium session...');
    await browser.close();
    browser = null;
  }
}

/**
 * Loads a single URL using Playwright with automatic retry on transient failures.
 *
 * @param {object} context - Playwright browser context.
 * @param {string} url     - Target URL to crawl.
 * @returns {Promise<{url: string, title: string, html: string}>}
 * @throws {Error} After all retries are exhausted.
 */
export async function crawlPage(context, url) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const page = await context.newPage();

    try {
      logger.debug(`Navigating to URL (attempt ${attempt}/${MAX_RETRIES}): ${url}`);

      const response = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 20000,
      });

      if (!response) {
        throw new Error('Navigation failed: no response received.');
      }

      const statusCode = response.status();
      if (statusCode >= 400) {
        throw new Error(`HTTP ${statusCode} error.`);
      }

      await page.waitForTimeout(300);

      const title = await page.title();
      const html = await page.content();
      await page.close();

      return { url, title, html };
    } catch (error) {
      await page.close();
      lastError = error;

      if (attempt < MAX_RETRIES) {
        logger.warn(`Crawl attempt ${attempt} failed for "${url}": ${error.message}. Retrying...`);
        await delay(RETRY_DELAY_MS * attempt);
      }
    }
  }

  logger.error(`All ${MAX_RETRIES} crawl attempts failed for "${url}": ${lastError.message}`);
  throw lastError;
}
