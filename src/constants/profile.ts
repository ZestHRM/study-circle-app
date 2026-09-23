import type { ThemePreference } from "@/lib/theme-preference";

export const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: string;
}[] = [
  { value: "system", label: "System", icon: "smartphone" },
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
];
