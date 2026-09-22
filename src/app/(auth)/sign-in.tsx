import { AuthScreen } from "@/components/auth-screen";
import {
  AuthFooter,
  AuthHeader,
  FormInput,
  FormStatusMessage,
} from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/auth";
import { useAuthErrorHandler } from "@/lib/hooks/use-auth-error-handler";
import { signInSchema, type SignInValues } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import * as React from "react";
import { useForm } from "react-hook-form";
import { Pressable, type TextInput, View } from "react-native";

export default function SignInScreen() {
  const router = useRouter();
  const auth = useAuth();
  const passwordInputRef = React.useRef<TextInput>(null);
  const { error, message, runAction } = useAuthErrorHandler();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SignInValues) {
    const formattedEmail = data.email.trim().toLowerCase();

    const result = await runAction(
      () =>
        auth.signIn({
          email: formattedEmail,
          password: data.password,
        }),
      "Unable to sign in right now.",
      {
        onError: (errMsg) => {
          if (errMsg.toLowerCase().includes("verify your email")) {
            router.push({
              pathname: "/verify-email",
              params: { email: formattedEmail },
            });
          }
        },
      },
    );

    if (result.ok) {
      router.replace("/");
    }
  }

  return (
    <AuthScreen>
      <AuthHeader
        title="Welcome back to"
        highlightTitle="your study space"
        subtitle="Log in to access your subjects, materials, notes and quizzes."
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
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          returnKeyType="next"
          submitBehavior="submit"
        />

        <View className="gap-1">
          <FormInput
            ref={passwordInputRef}
            control={control}
            name="password"
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            returnKeyType="send"
            onSubmitEditing={handleSubmit(onSubmit)}
          />
          <View className="items-end pt-0.5">
            <Pressable onPress={() => router.push("/forgot-password")}>
              <Text
                variant="caption"
                className="text-blue-600 dark:text-blue-400 font-semibold"
              >
                Forgot password?
              </Text>
            </Pressable>
          </View>
        </View>

        <FormStatusMessage error={error} message={message} />
      </View>

      <View className="gap-3.5">
        <Button
          variant="quiz"
          size="lg"
          title={isSubmitting ? "Signing in..." : "Log in"}
          icon="arrow-right"
          iconPosition="right"
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          className="w-full"
        />

        <AuthFooter
          promptText="Don't have an account?"
          actionText="Sign up"
          onActionPress={() => router.push("/sign-up")}
        />
      </View>
    </AuthScreen>
  );
}
