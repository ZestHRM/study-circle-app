import { WelcomeScreen } from "@/components/welcome-screen";
import { useAuth } from "@/lib/auth";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function IndexScreen() {
  const { isLoading, token } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-stone-900 items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (token) {
    return <Redirect href="/(tabs)" />;
  }

  return <WelcomeScreen />;
}
