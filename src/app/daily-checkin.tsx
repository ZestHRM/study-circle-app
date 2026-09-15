import { DailyCheckinScreen } from "@/components/home/daily-checkin-screen";
import { useAuth } from "@/lib/auth";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, BackHandler, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DailyCheckinRoute() {
  const { isLoading, token } = useAuth();
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(tabs)");
        }
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, [router]),
  );

  if (isLoading) {
    return (
      <SafeAreaView className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!token) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <View style={{ flex: 1 }} className="flex-1 bg-white dark:bg-stone-950">
      <DailyCheckinScreen />
    </View>
  );
}
