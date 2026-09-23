import { AuthScreen } from "@/components/auth-screen";
import { AuthFooter, AuthHeader, FormStatusMessage } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/auth";
import { useAuthErrorHandler } from "@/lib/hooks/use-auth-error-handler";
import { verifyEmailSchema, type VerifyEmailValues } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as React from "react";
import { useForm } from "react-hook-form";
import { type TextInput, type TextStyle, View } from "react-native";

const RESEND_CODE_INTERVAL_SECONDS = 30;
const TABULAR_NUMBERS_STYLE: TextStyle = { fontVariant: ["tabular-nums"] };

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { resendVerification, verifyEmail } = useAuth();
  const { countdown, restartCountdown } = useCountdown(
    RESEND_CODE_INTERVAL_SECONDS,
  );
  const codeInputRef = React.useRef<TextInput>(null);
  const { error, setError, message, setMessage, runAction } =
    useAuthErrorHandler();
  const [isResending, setIsResending] = React.useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = useForm<VerifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: params.email ?? "",
      code: "",
    },
  });

  async function onSubmit(data: VerifyEmailValues) {
    const result = await runAction(
      () =>
        verifyEmail({
          email: data.email.trim().toLowerCase(),
          code: data.code.trim(),
        }),
      "Unable to verify email.",
    );

    if (result.ok) {
      router.replace("/");
    }
  }

  async function onResend() {
    const currentEmail = getValues("email");
    if (!currentEmail.trim()) {
      setError("Enter your email address first.");
      return;
    }

    setIsResending(true);
    const result = await runAction(
      () => resendVerification(currentEmail.trim().toLowerCase()),
      "Unable to resend code.",
    );
    setIsResending(false);

    if (result.ok) {
      setMessage(result.data);
      restartCountdown();
    }
  }

  return (
    <AuthScreen>
      <AuthHeader
        title="Verify your"
        highlightTitle="email address"
        subtitle="Enter the verification code sent to your email to activate your account."
      />

      <View className="gap-3.5 w-full">
        <FormInput
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

        <View className="gap-1.5">
          <FormInput
            ref={codeInputRef}
            control={control}
            name="code"
            label="Verification code"
            autoCapitalize="none"
            returnKeyType="send"
            keyboardType="numeric"
            autoComplete="sms-otp"
            textContentType="oneTimeCode"
            onSubmitEditing={handleSubmit(onSubmit)}
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

        <FormStatusMessage error={error} message={message} />
      </View>

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
