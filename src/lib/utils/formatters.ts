/**
 * Centralized Date & Text Formatting Utilities
 */

export function formatShortDate(dateStr?: string | null): string {
  if (!dateStr) return "Unknown date";
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return "Unknown date";

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeOrShortDate(dateStr?: string | null): string {
  if (!dateStr) return "Recent";
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return "Recent";

  const now = new Date();
  const diffMs = now.getTime() - parsed.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatShortDate(dateStr);
}

export function decodeHtmlEntities(content: string): string {
  return content
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

export function toPlainText(content?: string | null): string {
  if (!content) return "";
  return decodeHtmlEntities(content)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function toMultilineText(content?: string | null): string {
  if (!content) return "";
  return decodeHtmlEntities(content)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h1|h2|h3|h4|h5|h6)>/gi, "\n")
    .replace(/<(p|div|li|h1|h2|h3|h4|h5|h6)(\s+[^>]*)?>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function countWords(content?: string | null): number {
  const normalized = toPlainText(content);
  if (!normalized) return 0;
  return normalized.split(/\s+/).length;
}
