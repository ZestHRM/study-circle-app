import { AuthScreen } from "@/components/auth-screen";
import { AuthFooter, AuthHeader, FormStatusMessage } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { useAuth } from "@/lib/auth";
import { useAuthErrorHandler } from "@/lib/hooks/use-auth-error-handler";
import { resetPasswordSchema, type ResetPasswordValues } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as React from "react";
import { useForm } from "react-hook-form";
import { type TextInput, View } from "react-native";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { resetPassword } = useAuth();
  const { error, message, runAction } = useAuthErrorHandler();
  const emailInputRef = React.useRef<TextInput>(null);
  const codeInputRef = React.useRef<TextInput>(null);
  const passwordInputRef = React.useRef<TextInput>(null);
  const confirmPasswordInputRef = React.useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
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
    const result = await runAction(
      () =>
        resetPassword({
          email: data.email.trim().toLowerCase(),
          code: data.code.trim(),
          password: data.newPassword,
          confirmPassword: data.confirmPassword,
        }),
      "Unable to reset password.",
    );

    if (result.ok) {
      router.replace("/");
    }
  }

  return (
    <AuthScreen>
      <AuthHeader
        title="Create your new"
        highlightTitle="account password"
        subtitle="Enter the verification code sent to your email and choose a new password."
      />
      <View className="gap-3.5 w-full">
        <FormInput
          ref={emailInputRef}
          control={control}
          name="email"
          label="Email address"
          placeholder="name@example.com"
          keyboardType="email-address"
          autoComplete="email"
          autoCapitalize="none"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => codeInputRef.current?.focus()}
        />

        <FormInput
          ref={codeInputRef}
          control={control}
          name="code"
          label="Verification code"
          autoCapitalize="none"
          returnKeyType="next"
          keyboardType="numeric"
          autoComplete="sms-otp"
          textContentType="oneTimeCode"
          submitBehavior="submit"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
        />

        <FormInput
          ref={passwordInputRef}
          control={control}
          name="newPassword"
          label="New password"
          placeholder="••••••••"
          secureTextEntry
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
        />

        <FormInput
          ref={confirmPasswordInputRef}
          control={control}
          name="confirmPassword"
          label="Confirm password"
          placeholder="••••••••"
          secureTextEntry
          returnKeyType="send"
          onSubmitEditing={handleSubmit(onSubmit)}
        />

        <FormStatusMessage error={error} message={message} />
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
