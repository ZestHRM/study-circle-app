import { APP_COLORS } from "@/constants/colors";
import { WelcomeScreen } from "@/components/onboarding";
import { useAuth } from "@/lib/auth";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function IndexScreen() {
  const { isLoading, token } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={APP_COLORS.primary} />
      </View>
    );
  }

  if (token) {
    return <Redirect href="/(tabs)" />;
  }

  return <WelcomeScreen />;
}
