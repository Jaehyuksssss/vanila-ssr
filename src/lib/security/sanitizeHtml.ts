/**
 * Minimal HTML sanitizer
 * Default behavior: escape all HTML to prevent XSS.
 * Note: This is intentionally conservative and does not implement a tag whitelist.
 * For rich HTML sanitization, integrate a dedicated sanitizer in your server layer.
 */

export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
}

const escapeMap: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(input: string): string {
  return input.replace(/[&<>"'/]/g, (ch) => escapeMap[ch] || ch);
}

/**
 * Sanitizes an input string by escaping all HTML characters.
 * The options are accepted for API compatibility, but currently ignored.
 */
export function sanitizeHtml(input: string, _options: SanitizeOptions = {}): string {
  if (input == null) return "";
  return escapeHtml(String(input));
}
