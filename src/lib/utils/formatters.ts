/**
 * Centralized Date & Text Formatting Utilities
 */

export function formatDateTime(
  dateInput?: string | number | Date | null,
  options: { includeYear?: boolean; fallback?: string } = {}
): string {
  const { fallback = "No activity" } = options;
  if (!dateInput) return fallback;

  const parsed =
    typeof dateInput === "object" && dateInput instanceof Date
      ? dateInput
      : new Date(dateInput);

  if (Number.isNaN(parsed.getTime())) return fallback;

  const day = parsed.getDate();
  const month = parsed.toLocaleString("en-US", { month: "short" });
  const year = parsed.getFullYear();

  let hours = parsed.getHours();
  const minutes = parsed.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;

  const timeStr = `${hours}:${minutes} ${ampm}`;
  const showYear = options.includeYear ?? true;

  if (showYear) {
    return `${day} ${month} ${year}, ${timeStr}`;
  }
  return `${day} ${month}, ${timeStr}`;
}

export const formatDateWithTime = formatDateTime;

export function formatDateTimeSplit(
  dateInput?: string | number | Date | null,
  options: { includeYear?: boolean; fallbackDate?: string } = {}
): { time: string | null; date: string } {
  const { fallbackDate = "No activity" } = options;
  if (!dateInput) return { time: null, date: fallbackDate };

  const parsed =
    typeof dateInput === "object" && dateInput instanceof Date
      ? dateInput
      : new Date(dateInput);

  if (Number.isNaN(parsed.getTime()))
    return { time: null, date: fallbackDate };

  const day = parsed.getDate();
  const month = parsed.toLocaleString("en-US", { month: "short" });
  const year = parsed.getFullYear();

  let hours = parsed.getHours();
  const minutes = parsed.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;

  const timeStr = `${hours}:${minutes} ${ampm}`;
  const showYear = options.includeYear ?? true;
  const dateStr = showYear ? `${day} ${month} ${year}` : `${day} ${month}`;

  return { time: timeStr, date: dateStr };
}

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

export function formatDayDate(dateInput?: string | number | Date | null): string {
  const parsed = dateInput ? new Date(dateInput) : new Date();
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
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
