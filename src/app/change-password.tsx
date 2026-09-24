import { AppLogo } from "@/components/ui/app-logo";
import { AuthHeader } from "@/components/ui/auth-header";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { FormStatusMessage } from "@/components/ui/form-status-message";
import { Text } from "@/components/ui/text";
import { WatermarkBackground } from "@/components/ui/watermark-background";
import { useAuthErrorHandler } from "@/lib/hooks/use-auth-error-handler";
import { useThemePreference } from "@/lib/theme-preference";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import { changePasswordSchema, type ChangePasswordValues } from "@/schemas";
import { profileApi } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import * as React from "react";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { isDark } = useThemePreference();
  const { error, message, runAction } = useAuthErrorHandler();

  const newPasswordRef = React.useRef<TextInput>(null);
  const confirmPasswordRef = React.useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordValues) => {
    const result = await runAction(
      () =>
        profileApi.changePassword({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }),
      "Failed to update password.",
      {
        onError: (msg) => {
          showErrorToast("Change Password Failed", msg);
        },
      },
    );

    if (result.ok) {
      showSuccessToast(
        "Password Updated",
        "Your account password has been changed successfully.",
      );
      router.back();
    }
  };

  const scrollContent = (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 40,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }} className="gap-6 max-w-lg w-full mx-auto">
        {/* Navigation Bar */}
        <View className="flex-row items-center justify-between">
          <Button
            variant="ghost"
            icon="arrow-left"
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-muted items-center justify-center p-0 active:opacity-80"
            iconColor="foreground"
          />
          <Text variant="subhead" className="font-bold">
            Account Security
          </Text>
          <View className="w-10" />
        </View>

        {/* Auth-style Header */}
        <AuthHeader
          badgeText="SECURITY & PRIVACY"
          title="Update your"
          highlightTitle="account password"
          subtitle="Choose a strong new password to keep your StudyCircle account safe."
        />

        {/* Form Inputs Container */}
        <View className="gap-4 w-full mt-2">
          <FormInput
            control={control}
            name="currentPassword"
            label="Current Password"
            placeholder="Enter current password"
            secureTextEntry
            onSubmitEditing={() => newPasswordRef.current?.focus()}
            returnKeyType="next"
          />

          <FormInput
            ref={newPasswordRef}
            control={control}
            name="newPassword"
            label="New Password"
            placeholder="At least 6 characters"
            secureTextEntry
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            returnKeyType="next"
          />

          <FormInput
            ref={confirmPasswordRef}
            control={control}
            name="confirmPassword"
            label="Confirm New Password"
            placeholder="Re-enter new password"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleSubmit(onSubmit)}
          />

          <FormStatusMessage error={error} message={message} />
        </View>

        {/* Form Submit & Actions */}
        <View className="gap-3.5 mt-auto pt-4">
          <Button
            variant="quiz"
            size="lg"
            title={isSubmitting ? "Updating Password..." : "Update Password"}
            icon="check-circle"
            loading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
            className="w-full h-12 rounded-2xl justify-center items-center shadow-2xs"
          />

          <Button
            variant="outline"
            size="lg"
            title="Cancel"
            onPress={() => router.back()}
            className="w-full h-12 rounded-2xl justify-center items-center"
          />
        </View>

        {/* Footer Branding */}
        <View className="items-center justify-center gap-1.5 pt-4">
          <AppLogo size={32} />
          <Text variant="caption" className="font-medium">
            Study Circle • Password Security
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      className="flex-1 bg-background relative overflow-hidden"
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
