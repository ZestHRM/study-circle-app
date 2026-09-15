import "../global.css";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { ConfirmDialogProvider } from "@/components/confirm-dialog-provider";
import { AuthProvider } from "@/lib/auth";
import { ThemePreferenceProvider, useThemePreference } from "@/lib/theme-preference";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useState } from "react";
import { StatusBar, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import Toast from "react-native-toast-message";
import { Uniwind } from "uniwind";

SplashScreen.preventAutoHideAsync();

const LIGHT_THEME_VARS: Record<string, string> = {
  "--background": "0 0% 100%",
  "--foreground": "0 0% 3.9%",
  "--card": "0 0% 100%",
  "--card-foreground": "0 0% 3.9%",
  "--popover": "0 0% 100%",
  "--popover-foreground": "0 0% 3.9%",
  "--primary": "221 83% 53%",
  "--primary-foreground": "0 0% 100%",
  "--secondary": "0 0% 96.1%",
  "--secondary-foreground": "0 0% 9%",
  "--muted": "0 0% 96.1%",
  "--muted-foreground": "0 0% 45.1%",
  "--accent": "0 0% 96.1%",
  "--accent-foreground": "0 0% 9%",
  "--destructive": "0 84.2% 60.2%",
  "--destructive-foreground": "0 0% 98%",
  "--border": "0 0% 89.8%",
  "--input": "0 0% 89.8%",
  "--ring": "221 83% 53%",
};

const DARK_THEME_VARS: Record<string, string> = {
  "--background": "0 0% 3.9%",
  "--foreground": "0 0% 98%",
  "--card": "0 0% 3.9%",
  "--card-foreground": "0 0% 98%",
  "--popover": "0 0% 3.9%",
  "--popover-foreground": "0 0% 98%",
  "--primary": "217 91% 60%",
  "--primary-foreground": "0 0% 100%",
  "--secondary": "0 0% 14.9%",
  "--secondary-foreground": "0 0% 98%",
  "--muted": "0 0% 14.9%",
  "--muted-foreground": "0 0% 63.9%",
  "--accent": "0 0% 14.9%",
  "--accent-foreground": "0 0% 98%",
  "--destructive": "0 62.8% 30.6%",
  "--destructive-foreground": "0 0% 98%",
  "--border": "0 0% 14.9%",
  "--input": "0 0% 14.9%",
  "--ring": "217 91% 60%",
};

Uniwind.updateCSSVariables("light", LIGHT_THEME_VARS);
Uniwind.updateCSSVariables("dark", DARK_THEME_VARS);

const WhiteDefaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#ffffff",
    card: "#ffffff",
  },
};

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            retry: 1,
          },
        },
      }),
  );

  // Initialize push notification listeners and channels
  usePushNotifications(true);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <ThemePreferenceProvider>
          <ThemeAwareRoot>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <ConfirmDialogProvider>
                <AnimatedSplashOverlay />
                <StatusBar translucent={false} />
                <View style={{ flex: 1 }} className="bg-background flex-1">
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: { backgroundColor: "transparent" },
                    }}
                  >
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen
                      name="profile"
                      options={{ headerShown: true, title: "Profile" }}
                    />
                    <Stack.Screen
                      name="notifications"
                      options={{ headerShown: false, title: "Notifications" }}
                    />

                  </Stack>
                  <PortalHost />
                  <Toast />
                </View>
              </ConfirmDialogProvider>
            </AuthProvider>
          </QueryClientProvider>
          </ThemeAwareRoot>
        </ThemePreferenceProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemeAwareRoot({ children }: { children: React.ReactNode }) {
  const { isDark } = useThemePreference();
  return (
    <ThemeProvider value={isDark ? DarkTheme : WhiteDefaultTheme}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#0c0a09" : "#ffffff"} />
      {children}
    </ThemeProvider>
  );
}
