import { AuthScreen } from "@/components/auth-screen";
import { AuthFooter, AuthHeader } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword } = useAuth();
  const [message, setMessage] = React.useState<string | null>(null);
  const [generalError, setGeneralError] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordValues) {
    setGeneralError(null);
    setMessage(null);

    try {
      const responseMessage = await forgotPassword(
        data.email.trim().toLowerCase(),
      );
      setMessage(responseMessage);
      router.push({
        pathname: "/reset-password",
        params: { email: data.email.trim().toLowerCase() },
      });
    } catch (caughtError) {
      setGeneralError(
        getErrorMessage(caughtError, "Unable to send reset code."),
      );
    }
  }

  return (
    <AuthScreen>
      {/* Reusable Auth Header */}
      <AuthHeader
        title="Reset your"
        highlightTitle="account password"
        subtitle="Enter your email address and we'll send a verification code to recover your account."
      />

      {/* Center Section: Input Field */}
      <View className="gap-4 w-full">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email address"
              placeholder="name@example.com"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
              returnKeyType="send"
              onSubmitEditing={handleSubmit(onSubmit)}
              error={errors.email?.message}
            />
          )}
        />

        {generalError ? (
          <Text variant="error" className="text-sm">
            {generalError}
          </Text>
        ) : null}

        {message ? (
          <Text className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
            {message}
          </Text>
        ) : null}
      </View>

      {/* Bottom Section: Primary Action & Reusable Auth Footer */}
      <View className="gap-3.5">
        <Button
          variant="quiz"
          size="lg"
          title={isSubmitting ? "Sending code..." : "Send reset code"}
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
