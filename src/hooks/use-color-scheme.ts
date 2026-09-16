import { useThemePreference } from "@/lib/theme-preference";
import { useColorScheme as useRNColorScheme } from "react-native";

export function useColorScheme(): "light" | "dark" {
  try {
    const { isDark } = useThemePreference();
    return isDark ? "dark" : "light";
  } catch {
    const scheme = useRNColorScheme();
    return scheme === "dark" ? "dark" : "light";
  }
}
