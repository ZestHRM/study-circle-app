import { WatermarkBackground } from "@/components/ui/watermark-background";
import { useAuth } from "@/lib/auth";
import { Redirect } from "expo-router";
import * as React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function AuthScreen({ children }: { children: React.ReactNode }) {
  const { isLoading, token } = useAuth();

  if (isLoading) {
    return (
      <SafeAreaView className="bg-[#FAFAF9] dark:bg-stone-950 flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  if (token) {
    return <Redirect href="/" />;
  }

  const scrollContent = (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 32,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }} className="gap-6 max-w-lg w-full mx-auto">
        {children}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      className="flex-1 bg-[#FAFAF9] dark:bg-stone-950 relative overflow-hidden"
    >
      <WatermarkBackground />

      {Platform.OS === "ios" ? (
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          {scrollContent}
        </KeyboardAvoidingView>
      ) : (
        scrollContent
      )}
    </SafeAreaView>
  );
}
