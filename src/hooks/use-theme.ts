import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemePreference } from "@/lib/theme-preference";

export function useTheme() {
  try {
    const { isDark } = useThemePreference();
    return isDark ? Colors.dark : Colors.light;
  } catch {
    const scheme = useColorScheme();
    return Colors[scheme] ?? Colors.light;
  }
}
