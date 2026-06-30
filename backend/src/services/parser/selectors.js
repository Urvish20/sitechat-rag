// HTML elements to strip completely during cleaning
export const REMOVE_TAGS = [
  'script',
  'style',
  'noscript',
  'svg',
  'canvas',
  'iframe',
  'footer',
  'header',
  'nav',
  'aside',
  'form',
  'button',
  'input',
  'select',
  'textarea',
  'option',
];

// Content container elements to prioritize for text extraction
export const CONTENT_TAGS = [
  'main',
  'article',
  'section',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'li',
  'pre',
  'code',
  'blockquote',
];

// Selectors commonly used for cookie consent walls and banners
export const COOKIE_SELECTORS = [
  '.cookie-banner',
  '.cookie-consent',
  '#cookie-banner',
  '#cookie-consent',
  '[class*="cookie"]',
  '[id*="cookie"]',
  '.consent-banner',
  '#consent-banner',
];

// Selectors targeting advertising platforms, sidebars, and popups
export const AD_SELECTORS = [
  '.ads',
  '.advertisement',
  '#ads',
  '#ad-container',
  '[class*="advertisement"]',
  '[id*="adv-"]',
  '.sponsor',
  '.newsletter-box',
  '.newsletter-signup',
  '.social-share',
  '.comments-section',
  '#comments',
  '.popup-overlay',
  '.modal',
];
