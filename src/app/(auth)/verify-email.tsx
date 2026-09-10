import { AuthScreen } from "@/components/auth-screen";
import { AuthFooter, AuthHeader } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { verifyEmailSchema, type VerifyEmailValues } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { type TextInput, type TextStyle, View } from "react-native";

const RESEND_CODE_INTERVAL_SECONDS = 30;
const TABULAR_NUMBERS_STYLE: TextStyle = { fontVariant: ["tabular-nums"] };

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { resendVerification, verifyEmail } = useAuth();
  const { countdown, restartCountdown } = useCountdown(RESEND_CODE_INTERVAL_SECONDS);
  const codeInputRef = React.useRef<TextInput>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [isResending, setIsResending] = React.useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: params.email ?? "",
      code: "",
    },
  });

  async function onSubmit(data: VerifyEmailValues) {
    setGeneralError(null);

    try {
      await verifyEmail({ email: data.email.trim().toLowerCase(), code: data.code.trim() });
      router.replace("/");
    } catch (caughtError) {
      setGeneralError(getErrorMessage(caughtError, "Unable to verify email."));
    }
  }

  async function onResend() {
    const currentEmail = getValues("email");
    if (!currentEmail.trim()) {
      setGeneralError("Enter your email address first.");
      return;
    }

    setGeneralError(null);
    setMessage(null);
    setIsResending(true);

    try {
      const responseMessage = await resendVerification(currentEmail.trim().toLowerCase());
      setMessage(responseMessage);
      restartCountdown();
    } catch (caughtError) {
      setGeneralError(getErrorMessage(caughtError, "Unable to resend code."));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthScreen>
      {/* Reusable Auth Header */}
      <AuthHeader
        title="Verify your"
        highlightTitle="email address"
        subtitle="Enter the verification code sent to your email to activate your account."
      />

      {/* Center Section: Input Fields */}
      <View className="gap-3.5 w-full">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
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

        <View className="gap-1.5">
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
                returnKeyType="send"
                keyboardType="numeric"
                autoComplete="sms-otp"
                textContentType="oneTimeCode"
                onSubmitEditing={handleSubmit(onSubmit)}
                error={errors.code?.message}
              />
            )}
          />
          <Button
            variant="link"
            size="sm"
            disabled={countdown > 0 || isResending}
            onPress={onResend}
            className="self-end pt-1"
          >
            <Text className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
              {isResending ? "Sending..." : "Didn't receive code? Resend"}{" "}
              {countdown > 0 ? (
                <Text className="text-xs" style={TABULAR_NUMBERS_STYLE}>
                  ({countdown})
                </Text>
              ) : null}
            </Text>
          </Button>
        </View>

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
          title={isSubmitting ? "Verifying..." : "Verify email"}
          icon="arrow-right"
          iconPosition="right"
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          className="w-full"
        />

        <AuthFooter
          promptText="Need to start over?"
          actionText="Sign up"
          onActionPress={() => router.push("/sign-up")}
        />
      </View>
    </AuthScreen>
  );
}

function useCountdown(seconds = 30) {
  const [countdown, setCountdown] = React.useState(seconds);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const stopCountdown = React.useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startCountdown = React.useCallback(() => {
    stopCountdown();
    setCountdown(seconds);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          stopCountdown();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  }, [seconds, stopCountdown]);

  React.useEffect(() => {
    startCountdown();

    return stopCountdown;
  }, [startCountdown, stopCountdown]);

  return { countdown, restartCountdown: startCountdown };
}
