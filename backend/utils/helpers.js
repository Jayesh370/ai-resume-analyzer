/**
 * utils/helpers.js — Shared utility functions
 */

/**
 * Format bytes into a human-readable string (KB / MB).
 * @param {number} bytes
 * @returns {string} e.g. "245 KB" or "1.2 MB"
 */
const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Convert an ATS score (0–100) to a descriptive label.
 */
const scoreLabel = (score) => {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Average";
  return "Needs Improvement";
};

/**
 * Truncate text to a maximum number of words.
 */
const truncateWords = (text, maxWords = 50) => {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "…";
};

/**
 * Wrap an async route handler so errors auto-forward to next().
 * Usage: router.get('/path', asyncWrap(myHandler))
 */
const asyncWrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { formatFileSize, scoreLabel, truncateWords, asyncWrap };
