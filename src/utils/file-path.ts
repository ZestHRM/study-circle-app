/**
 * Helper to resolve absolute public file / avatar URL
 */
export function getFileUrl(uri?: string | null): string | null {
  if (!uri || uri.trim() === "" || uri === "null") {
    return null;
  }

  const clean = uri.trim();
  if (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("data:") ||
    clean.startsWith("file://") ||
    clean.startsWith("blob:")
  ) {
    return clean;
  }

  const baseUrl =
    process.env.EXPO_PUBLIC_API_URL ??
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    "https://api.usestudycircle.ai";

  const root = baseUrl.replace(/\/v1\/?$/, "").replace(/\/$/, "");
  const route = clean.startsWith("/") ? clean : `/${clean}`;
  return `${root}${route}`;
}
