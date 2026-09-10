import { AuthScreen } from "@/components/auth-screen";
import { AuthFooter, AuthHeader } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { signInSchema, type SignInValues } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, type TextInput, View } from "react-native";

export default function SignInScreen() {
  const router = useRouter();
  const auth = useAuth();
  const passwordInputRef = React.useRef<TextInput>(null);
  const [generalError, setGeneralError] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SignInValues) {
    setGeneralError(null);

    try {
      await auth.signIn({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });
      router.replace("/");
    } catch (caughtError) {
      const message = getErrorMessage(
        caughtError,
        "Unable to sign in right now.",
      );
      setGeneralError(message);

      if (message.toLowerCase().includes("verify your email")) {
        router.push({
          pathname: "/verify-email",
          params: { email: data.email.trim().toLowerCase() },
        });
      }
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
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              returnKeyType="next"
              submitBehavior="submit"
              error={errors.email?.message}
            />
          )}
        />

        <View className="gap-1">
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                ref={passwordInputRef}
                label="Password"
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                returnKeyType="send"
                onSubmitEditing={handleSubmit(onSubmit)}
                error={errors.password?.message}
              />
            )}
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
