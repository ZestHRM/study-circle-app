import { AppLogo } from "@/components/ui/app-logo";
import { AuthHeader } from "@/components/ui/auth-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { WatermarkBackground } from "@/components/ui/watermark-background";
import { getErrorMessage } from "@/lib/api";
import { useThemePreference } from "@/lib/theme-preference";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import { changePasswordSchema, type ChangePasswordValues } from "@/schemas";
import { profileApi } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
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
  const [generalError, setGeneralError] = React.useState<string | null>(null);

  const newPasswordRef = React.useRef<TextInput>(null);
  const confirmPasswordRef = React.useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordValues) => {
    setGeneralError(null);
    try {
      await profileApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      showSuccessToast(
        "Password Updated",
        "Your account password has been changed successfully.",
      );
      router.back();
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to update password.");
      setGeneralError(msg);
      showErrorToast("Change Password Failed", msg);
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
            iconColor={isDark ? "#f5f5f4" : "#1c1917"}
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
          {/* Current Password */}
          <Controller
            control={control}
            name="currentPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Current Password"
                placeholder="Enter current password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                onSubmitEditing={() => newPasswordRef.current?.focus()}
                returnKeyType="next"
                error={errors.currentPassword?.message}
              />
            )}
          />

          {/* New Password */}
          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                ref={newPasswordRef}
                label="New Password"
                placeholder="At least 6 characters"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                returnKeyType="next"
                error={errors.newPassword?.message}
              />
            )}
          />

          {/* Confirm Password */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                ref={confirmPasswordRef}
                label="Confirm New Password"
                placeholder="Re-enter new password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
                error={errors.confirmPassword?.message}
              />
            )}
          />

          {generalError ? (
            <Text variant="error" className="text-sm">
              {generalError}
            </Text>
          ) : null}
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
