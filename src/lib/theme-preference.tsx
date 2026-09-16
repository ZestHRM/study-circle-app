import * as SecureStore from "expo-secure-store";
import * as React from "react";
import { Platform, useColorScheme } from "react-native";
import { Uniwind, useUniwind } from "uniwind";

export type ThemePreference = "system" | "light" | "dark";

const THEME_PREFERENCE_KEY = "studycircle.theme_preference";

type ThemePreferenceContextValue = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => Promise<void>;
  isDark: boolean;
};

const ThemePreferenceContext = React.createContext<ThemePreferenceContextValue | null>(null);

async function readPreference(): Promise<ThemePreference> {
  const value = Platform.OS === "web" && typeof localStorage !== "undefined"
    ? localStorage.getItem(THEME_PREFERENCE_KEY)
    : await SecureStore.getItemAsync(THEME_PREFERENCE_KEY);
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

async function persistPreference(preference: ThemePreference) {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    localStorage.setItem(THEME_PREFERENCE_KEY, preference);
    return;
  }
  await SecureStore.setItemAsync(THEME_PREFERENCE_KEY, preference);
}

export function ThemePreferenceProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const { theme, hasAdaptiveThemes } = useUniwind();
  const [preference, setPreferenceState] = React.useState<ThemePreference>("system");

  React.useEffect(() => {
    void readPreference().then((storedPreference) => {
      setPreferenceState(storedPreference);
      Uniwind.setTheme(storedPreference);
    }).catch(() => Uniwind.setTheme("system"));
  }, []);

  const setPreference = React.useCallback(async (nextPreference: ThemePreference) => {
    Uniwind.setTheme(nextPreference);
    setPreferenceState(nextPreference);
    await persistPreference(nextPreference);
  }, []);

  const isDark = React.useMemo(() => {
    if (preference === "dark") return true;
    if (preference === "light") return false;
    if (!hasAdaptiveThemes && theme) return theme === "dark";
    return systemScheme === "dark";
  }, [preference, theme, hasAdaptiveThemes, systemScheme]);

  return (
    <ThemePreferenceContext.Provider value={{ preference, setPreference, isDark }}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  const value = React.useContext(ThemePreferenceContext);
  if (!value) throw new Error("useThemePreference must be used within ThemePreferenceProvider");
  return value;
}
