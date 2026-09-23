import { AuthScreen } from "@/components/auth-screen";
import { AuthFooter, AuthHeader, FormStatusMessage } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { useAuth } from "@/lib/auth";
import { useAuthErrorHandler } from "@/lib/hooks/use-auth-error-handler";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { View } from "react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword } = useAuth();
  const { error, message, setMessage, runAction } = useAuthErrorHandler();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordValues) {
    const formattedEmail = data.email.trim().toLowerCase();

    const result = await runAction(
      () => forgotPassword(formattedEmail),
      "Unable to send reset code.",
    );

    if (result.ok) {
      setMessage(result.data);
      router.push({
        pathname: "/reset-password",
        params: { email: formattedEmail },
      });
    }
  }

  return (
    <AuthScreen>
      <AuthHeader
        title="Reset your"
        highlightTitle="account password"
        subtitle="Enter your email address and we'll send a verification code to recover your account."
      />
      <View className="gap-4 w-full">
        <FormInput
          control={control}
          name="email"
          label="Email address"
          placeholder="name@example.com"
          keyboardType="email-address"
          autoComplete="email"
          autoCapitalize="none"
          returnKeyType="send"
          onSubmitEditing={handleSubmit(onSubmit)}
        />

        <FormStatusMessage error={error} message={message} />
      </View>

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
