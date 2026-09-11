import type { NoteSection } from "./types";

export function getSectionMeta(heading: string): {
  icon: string;
  bg: string;
  color: string;
} {
  const l = heading.toLowerCase();
  if (
    l.includes("summar") ||
    l.includes("quick") ||
    l.includes("intro") ||
    l.includes("overview")
  )
    return { icon: "align-left", bg: "#EFF6FF", color: "#3B82F6" };
  if (l.includes("concept") || l.includes("key") || l.includes("type"))
    return { icon: "layers", bg: "#F5F3FF", color: "#7C3AED" };
  if (l.includes("defin"))
    return { icon: "book-open", bg: "#FFF7ED", color: "#EA580C" };
  if (
    l.includes("formula") ||
    l.includes("syntax") ||
    l.includes("sql") ||
    l.includes("command")
  )
    return { icon: "code", bg: "#F0FDF4", color: "#16A34A" };
  if (
    l.includes("remember") ||
    l.includes("tip") ||
    l.includes("revision") ||
    l.includes("quick rev")
  )
    return { icon: "bookmark", bg: "#FFF1F2", color: "#E11D48" };
  if (l.includes("example"))
    return { icon: "edit-3", bg: "#F0F9FF", color: "#0284C7" };
  if (l.includes("import") || l.includes("exam"))
    return { icon: "alert-circle", bg: "#FFFBEB", color: "#D97706" };
  if (l.includes("transaction") || l.includes("acid") || l.includes("concurr"))
    return { icon: "refresh-cw", bg: "#F0FDF4", color: "#059669" };
  if (l.includes("normal") || l.includes("index"))
    return { icon: "sliders", bg: "#FDF4FF", color: "#9333EA" };
  if (l.includes("architecture") || l.includes("model") || l.includes("er "))
    return { icon: "cpu", bg: "#F0F9FF", color: "#0EA5E9" };
  return { icon: "file-text", bg: "#F8FAFC", color: "#64748B" };
}

export function parseNotesIntoSections(content: string): NoteSection[] {
  if (!content?.trim()) return [];

  const clean = (s: string) =>
    s
      .replace(/<[^>]*>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&nbsp;/g, " ")
      .trim();

  const sections: NoteSection[] = [];

  // Strategy 1: <b>Topic: Heading</b> format
  const boldParts = content.split(/<b>/i);
  if (boldParts.length > 1) {
    boldParts.slice(1).forEach((part, idx) => {
      const closeIdx = part.indexOf("</b>");
      if (closeIdx < 0) return;
      const heading = clean(part.slice(0, closeIdx))
        .replace(/^Topic:\s*/i, "")
        .trim();
      const bodyRaw = part
        .slice(closeIdx + 4)
        .replace(/^[\s\n]*Notes:\s*/i, "")
        .trim();
      const bullets = bodyRaw
        .split(/\n{2,}/)
        .map((l) => l.replace(/\n/g, " ").trim())
        .filter((l) => l.length > 3 && !l.startsWith("---"));
      if (heading)
        sections.push({
          id: `b-${idx}`,
          heading,
          bullets: bullets.slice(0, 25),
        });
    });
  }

  // Strategy 2: HTML headings
  if (sections.length === 0) {
    content
      .split(/<h[1-4][^>]*>/i)
      .slice(1)
      .forEach((part, idx) => {
        const ci = part.search(/<\/h[1-4]/i);
        const heading =
          ci >= 0 ? clean(part.slice(0, ci)) : `Section ${idx + 1}`;
        const bodyText = ci >= 0 ? clean(part.slice(ci)) : clean(part);
        const bullets = bodyText
          .split(/\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 3);
        if (heading)
          sections.push({
            id: `h-${idx}`,
            heading,
            bullets: bullets.slice(0, 20),
          });
      });
  }

  // Fallback: double-newline paragraphs
  if (sections.length === 0) {
    const plain = clean(content);
    plain
      .split(/\n{2,}/)
      .filter(Boolean)
      .forEach((p, i) => {
        const lines = p
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.length > 2);
        if (!lines.length) return;
        sections.push({
          id: `p-${i}`,
          heading: lines[0],
          bullets: lines.length > 1 ? lines.slice(1) : lines,
        });
      });
  }

  return sections;
}
