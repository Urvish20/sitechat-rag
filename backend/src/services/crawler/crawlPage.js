import { chromium } from 'playwright';
import { logger } from '../../utils/logger.js';

let browser = null;

/**
 * Initializes the browser singleton instance.
 */
export async function initBrowser() {
  if (!browser) {
    logger.info('Launching Playwright Chromium browser instance...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  return browser;
}

/**
 * Terminate the browser session and clean references.
 */
export async function closeBrowser() {
  if (browser) {
    logger.info('Terminating Playwright Chromium session...');
    await browser.close();
    browser = null;
  }
}

/**
 * Loads a single URL using Playwright.
 * 
 * @param {object} context - Playwright browser context.
 * @param {string} url - Target URL.
 * @returns {Promise<{url: string, title: string, html: string}>}
 */
export async function crawlPage(context, url) {
  const page = await context.newPage();

  try {
    logger.debug(`Navigating to URL: ${url}`);
    const response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    if (!response) {
      throw new Error('Navigation failed: No response received from page.');
    }

    const statusCode = response.status();
    if (statusCode >= 400) {
      throw new Error(`HTTP Error Status received: ${statusCode}`);
    }

    const title = await page.title();
    const html = await page.content();

    await page.close();

    return {
      url,
      title,
      html,
    };
  } catch (error) {
    await page.close();
    logger.error(`Failed to crawl page "${url}": ${error.message}`);
    throw error;
  }
}
