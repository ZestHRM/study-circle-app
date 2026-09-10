import { AuthScreen } from "@/components/auth-screen";
import { AuthFooter, AuthHeader, Icon } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { getErrorMessage, type EducationLevel } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { signUpSchema, type SignUpValues } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, View, type TextInput } from "react-native";

const EDUCATION_LEVEL_ITEMS: Array<{
  id: EducationLevel;
  label: string;
  iconName: "book-open" | "award" | "users" | "zap";
}> = [
  { id: "School", label: "School", iconName: "book-open" },
  { id: "College", label: "College", iconName: "award" },
  { id: "Coaching", label: "Coaching", iconName: "users" },
  { id: "CompetitiveExams", label: "Competitive", iconName: "zap" },
];

export default function SignUpScreen() {
  const router = useRouter();
  const auth = useAuth();
  const emailInputRef = React.useRef<TextInput>(null);
  const passwordInputRef = React.useRef<TextInput>(null);
  const phoneInputRef = React.useRef<TextInput>(null);
  const instituteInputRef = React.useRef<TextInput>(null);
  const classInputRef = React.useRef<TextInput>(null);
  const confirmPasswordInputRef = React.useRef<TextInput>(null);
  const [generalError, setGeneralError] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      institute: "",
      level: "School",
      classOrStandard: "",
      password: "",
      confirmPassword: "",
    },
  });

  const selectedLevel = watch("level");

  async function onSubmit(data: SignUpValues) {
    setGeneralError(null);

    try {
      await auth.signUp({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        institute: data.institute.trim(),
        level: data.level,
        classOrStandard: data.classOrStandard.trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      router.push({
        pathname: "/verify-email",
        params: { email: data.email.trim().toLowerCase() },
      });
    } catch (caughtError) {
      setGeneralError(
        getErrorMessage(caughtError, "Unable to create account."),
      );
    }
  }

  return (
    <AuthScreen>
      {/* Reusable Auth Header */}
      <AuthHeader
        title="Start learning with"
        highlightTitle="StudyCircle AI"
        subtitle="Create your free account to access interactive study plans, quizzes and notes."
      />

      {/* Form Fields Section */}
      <View className="gap-3.5 w-full py-2">
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Full name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Your name"
              autoComplete="name"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => emailInputRef.current?.focus()}
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              ref={emailInputRef}
              label="Email address"
              placeholder="name@example.com"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
              onSubmitEditing={() => phoneInputRef.current?.focus()}
              returnKeyType="next"
              submitBehavior="submit"
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              ref={phoneInputRef}
              label="Phone number"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="phone-pad"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => instituteInputRef.current?.focus()}
              error={errors.phone?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="institute"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              ref={instituteInputRef}
              label="School or institute"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="School, college, or institute"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => classInputRef.current?.focus()}
              error={errors.institute?.message}
            />
          )}
        />

        {/* Premium 2x2 Education Level Grid Selector */}
        <View className="gap-2">
          <Text variant="subhead">Education level</Text>
          <View className="gap-2.5">
            <View className="flex-row gap-2.5">
              {EDUCATION_LEVEL_ITEMS.slice(0, 2).map((item) => {
                const isSelected = selectedLevel === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setValue("level", item.id)}
                    className={cn(
                      "flex-1 flex-row items-center gap-2.5 p-2.5 rounded-xl border transition-all",
                      isSelected
                        ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 shadow-2xs"
                        : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800",
                    )}
                  >
                    <View
                      className={cn(
                        "w-8 h-8 rounded-lg items-center justify-center border",
                        isSelected
                          ? "bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800"
                          : "bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700",
                      )}
                    >
                      <Icon
                        name={item.iconName}
                        size={16}
                        color={isSelected ? "primary" : "muted"}
                      />
                    </View>
                    <Text
                      className={cn(
                        "text-xs font-semibold flex-1",
                        isSelected
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-stone-700 dark:text-stone-300",
                      )}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                    {isSelected ? (
                      <View className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500" />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <View className="flex-row gap-2.5">
              {EDUCATION_LEVEL_ITEMS.slice(2, 4).map((item) => {
                const isSelected = selectedLevel === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setValue("level", item.id)}
                    className={cn(
                      "flex-1 flex-row items-center gap-2.5 p-2.5 rounded-xl border transition-all",
                      isSelected
                        ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 shadow-2xs"
                        : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800",
                    )}
                  >
                    <View
                      className={cn(
                        "w-8 h-8 rounded-lg items-center justify-center border",
                        isSelected
                          ? "bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800"
                          : "bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700",
                      )}
                    >
                      <Icon
                        name={item.iconName}
                        size={16}
                        color={isSelected ? "primary" : "muted"}
                      />
                    </View>
                    <Text
                      className={cn(
                        "text-xs font-semibold flex-1",
                        isSelected
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-stone-700 dark:text-stone-300",
                      )}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                    {isSelected ? (
                      <View className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500" />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
          {errors.level?.message ? (
            <Text variant="error">{errors.level.message}</Text>
          ) : null}
        </View>

        <Controller
          control={control}
          name="classOrStandard"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              ref={classInputRef}
              label="Class or standard"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="10th, B.Tech, UPSC, etc."
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              error={errors.classOrStandard?.message}
            />
          )}
        />

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
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
              error={errors.password?.message}
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

      {/* Bottom Section: Primary Action & Reusable Auth Footer */}
      <View className="gap-3.5 mt-4">
        <Button
          variant="quiz"
          size="lg"
          title={isSubmitting ? "Creating account..." : "Create account"}
          icon="arrow-right"
          iconPosition="right"
          disabled={isSubmitting}
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          className="w-full"
        />

        <AuthFooter
          promptText="Already have an account?"
          actionText="Log in"
          onActionPress={() => router.push("/sign-in")}
        />
      </View>
    </AuthScreen>
  );
}
