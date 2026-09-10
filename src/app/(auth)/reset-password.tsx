import { AuthScreen } from "@/components/auth-screen";
import { AuthFooter, AuthHeader } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { resetPasswordSchema, type ResetPasswordValues } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { type TextInput, View } from "react-native";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { resetPassword } = useAuth();
  const emailInputRef = React.useRef<TextInput>(null);
  const codeInputRef = React.useRef<TextInput>(null);
  const passwordInputRef = React.useRef<TextInput>(null);
  const confirmPasswordInputRef = React.useRef<TextInput>(null);
  const [generalError, setGeneralError] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: params.email ?? "",
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ResetPasswordValues) {
    setGeneralError(null);

    try {
      await resetPassword({
        email: data.email.trim().toLowerCase(),
        code: data.code.trim(),
        password: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      router.replace("/");
    } catch (caughtError) {
      setGeneralError(
        getErrorMessage(caughtError, "Unable to reset password."),
      );
    }
  }

  return (
    <AuthScreen>
      {/* Reusable Auth Header */}
      <AuthHeader
        title="Create your new"
        highlightTitle="account password"
        subtitle="Enter the verification code sent to your email and choose a new password."
      />

      {/* Center Section: Input Fields */}
      <View className="gap-3.5 w-full">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              ref={emailInputRef}
              label="Email address"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => codeInputRef.current?.focus()}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="code"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              ref={codeInputRef}
              label="Verification code"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              returnKeyType="next"
              keyboardType="numeric"
              autoComplete="sms-otp"
              textContentType="oneTimeCode"
              submitBehavior="submit"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              error={errors.code?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              ref={passwordInputRef}
              label="New password"
              placeholder="••••••••"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
              error={errors.newPassword?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              ref={confirmPasswordInputRef}
              label="Confirm password"
              placeholder="••••••••"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              returnKeyType="send"
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

      <View className="gap-3.5">
        <Button
          variant="quiz"
          size="lg"
          title={isSubmitting ? "Resetting..." : "Reset password"}
          icon="arrow-right"
          iconPosition="right"
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          className="w-full"
        />

        <AuthFooter
          promptText="Remember your password?"
          actionText="Log in"
          onActionPress={() => router.push("/sign-in")}
        />
      </View>
    </AuthScreen>
  );
}
