import { APP_COLORS } from "@/constants/colors";

export interface SubjectTheme {
  iconName: string;
  colorHex: string;
  bgHex: string;
  name: string;
}

export const SUBJECT_PRESET_THEMES: SubjectTheme[] = [
  {
    iconName: "tv",
    colorHex: APP_COLORS.primary,
    bgHex: APP_COLORS.quizBlueLight,
    name: "Computer Science & Tech",
  },
  {
    iconName: "grid",
    colorHex: APP_COLORS.success,
    bgHex: APP_COLORS.successLight,
    name: "Mathematics",
  },
  {
    iconName: "droplet",
    colorHex: APP_COLORS.purpleAccent,
    bgHex: "#EDE9FE",
    name: "Physics & Chemistry",
  },
  {
    iconName: "book-open",
    colorHex: APP_COLORS.orangeAccent,
    bgHex: APP_COLORS.warningLight,
    name: "Literature & English",
  },
  {
    iconName: "cpu",
    colorHex: "#EC4899",
    bgHex: "#FCE7F3",
    name: "Engineering & IT",
  },
  {
    iconName: "layers",
    colorHex: "#0D9488",
    bgHex: "#CCFBF1",
    name: "General Studies",
  },
];

/**
 * Single source of truth for subject icons and themes across the entire app.
 * Returns consistent iconName, colorHex, and bgHex based on subject name or index.
 */
export function getSubjectTheme(
  subjectName?: string | null,
  index = 0,
): SubjectTheme {
  if (!subjectName) {
    return SUBJECT_PRESET_THEMES[Math.abs(index) % SUBJECT_PRESET_THEMES.length];
  }

  const nameLower = subjectName.toLowerCase().trim();

  if (
    nameLower.includes("cs") ||
    nameLower.includes("comp") ||
    nameLower.includes("computer") ||
    nameLower.includes("code") ||
    nameLower.includes("programming") ||
    nameLower.includes("dbms") ||
    nameLower.includes("software") ||
    nameLower.includes("tech")
  ) {
    return {
      iconName: "tv",
      colorHex: APP_COLORS.primary,
      bgHex: APP_COLORS.quizBlueLight,
      name: "Computer Science",
    };
  }

  if (
    nameLower.includes("math") ||
    nameLower.includes("stat") ||
    nameLower.includes("calc") ||
    nameLower.includes("algebra") ||
    nameLower.includes("geo")
  ) {
    return {
      iconName: "grid",
      colorHex: APP_COLORS.success,
      bgHex: APP_COLORS.successLight,
      name: "Mathematics",
    };
  }

  if (
    nameLower.includes("phy") ||
    nameLower.includes("chem") ||
    nameLower.includes("sci") ||
    nameLower.includes("atom")
  ) {
    return {
      iconName: "droplet",
      colorHex: APP_COLORS.purpleAccent,
      bgHex: "#EDE9FE",
      name: "Physics & Chemistry",
    };
  }

  if (
    nameLower.includes("bio") ||
    nameLower.includes("botany") ||
    nameLower.includes("zoo") ||
    nameLower.includes("life")
  ) {
    return {
      iconName: "cpu",
      colorHex: "#EC4899",
      bgHex: "#FCE7F3",
      name: "Biology",
    };
  }

  if (
    nameLower.includes("eng") ||
    nameLower.includes("lit") ||
    nameLower.includes("hist") ||
    nameLower.includes("read") ||
    nameLower.includes("book")
  ) {
    return {
      iconName: "book-open",
      colorHex: APP_COLORS.orangeAccent,
      bgHex: APP_COLORS.warningLight,
      name: "Literature & Humanities",
    };
  }

  // Fallback to deterministic index selection
  return SUBJECT_PRESET_THEMES[Math.abs(index) % SUBJECT_PRESET_THEMES.length];
}
