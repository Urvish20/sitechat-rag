

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const sanitizeUrl = (url) => {
  if (!url) return '';
  let sanitized = url.trim().toLowerCase();
  if (!/^https?:\/\//i.test(sanitized)) {
    sanitized = `https://${sanitized}`;
  }
  return sanitized;
};
