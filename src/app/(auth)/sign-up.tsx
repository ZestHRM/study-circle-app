import { AuthScreen } from "@/components/auth-screen";
import {
  AIAssistantBubble,
  AIAvatar,
  AuthFooter,
  FormInput,
  Icon,
} from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import {
  EDUCATION_LEVEL_ITEMS,
  PREPARATION_SUGGESTIONS,
  getStepPrompt,
} from "@/constants/onboarding";
import { useAIVoice } from "@/hooks/use-ai-voice";
import { getErrorMessage, type EducationLevel } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { signUpSchema, type SignUpValues } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import * as React from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { Pressable, View } from "react-native";

export default function SignUpScreen() {
  const router = useRouter();
  const auth = useAuth();

  // Wizard state: Steps 1 through 5
  const [step, setStep] = React.useState<1 | 2 | 3 | 4 | 5>(1);
  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [otpCode, setOtpCode] = React.useState("");
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = React.useState(false);
  const [isResendingOtp, setIsResendingOtp] = React.useState(false);
  const [resendSuccessMsg, setResendSuccessMsg] = React.useState<string | null>(
    null,
  );

  // Centralized AI Voice Hook
  const { speak, stop, isSpeaking, isMuted, toggleMute } = useAIVoice();
  const hasSpokenIntroRef = React.useRef(false);

  // Form handling via react-hook-form & zod
  const { control, handleSubmit, setValue, watch, trigger, getValues } =
    useForm<SignUpValues>({
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
  const selectedClass = watch("classOrStandard");
  const userEmail = watch("email");

  const currentStepPrompt = getStepPrompt(step, selectedLevel, userEmail);

  // Trigger speech on Mount (Intro) and on Step change
  React.useEffect(() => {
    if (!hasSpokenIntroRef.current) {
      hasSpokenIntroRef.current = true;
      speak(
        "Welcome to StudyCircle AI! I'm your AI Study Companion. Let's begin!",
        () => {
          speak(currentStepPrompt.prompt);
        },
      );
    } else {
      speak(currentStepPrompt.prompt);
    }
  }, [step, speak, currentStepPrompt.prompt]);

  // Handlers for step transitions & voice narration
  function handleSelectLevel(level: EducationLevel) {
    setValue("level", level);
    setValue("classOrStandard", "");
    setGeneralError(null);
    setStep(2);
  }

  function handleSelectPreparation(prepLabel: string) {
    setValue("classOrStandard", prepLabel);
    setGeneralError(null);
    setStep(3);
  }

  async function handleStep2Next() {
    setGeneralError(null);
    const isValid = await trigger("classOrStandard");
    if (isValid) {
      setStep(3);
    } else {
      const errMsg = getValues("classOrStandard")?.trim()
        ? "Please enter a valid class or standard."
        : "Please select or type what you are preparing for.";
      speak(errMsg);
    }
  }

  async function handleStep3Next() {
    setGeneralError(null);
    const isValid = await trigger(["name", "email", "phone", "institute"]);
    if (isValid) {
      setStep(4);
    } else {
      const nameErr = !getValues("name")?.trim()
        ? "Please enter your full name."
        : null;
      const emailErr = !getValues("email")?.trim()
        ? "Please enter your email address."
        : null;
      const phoneErr = !getValues("phone")?.trim()
        ? "Please enter your phone number."
        : null;
      const instErr = !getValues("institute")?.trim()
        ? "Please enter your school or institute name."
        : null;
      const firstError =
        nameErr ||
        emailErr ||
        phoneErr ||
        instErr ||
        "Please fill in all required personal details.";
      speak(firstError);
    }
  }

  function onFormError(formErrors: FieldErrors<SignUpValues>) {
    const firstMsg =
      formErrors.password?.message ||
      formErrors.confirmPassword?.message ||
      formErrors.name?.message ||
      formErrors.email?.message ||
      "Please check your form entries and try again.";
    speak(firstMsg);
  }

  async function onSubmitSignUp(data: SignUpValues) {
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
      setStep(5);
    } catch (caughtError) {
      const errorMsg = getErrorMessage(
        caughtError,
        "Unable to create account.",
      );
      setGeneralError(errorMsg);
      speak(errorMsg);
    }
  }

  async function handleVerifyOtp() {
    setOtpError(null);
    const code = otpCode.trim();
    if (!code) {
      const emptyMsg = "Please enter the 6-digit verification code.";
      setOtpError(emptyMsg);
      speak(emptyMsg);
      return;
    }
    setIsVerifyingOtp(true);
    try {
      await auth.verifyEmail({
        email: getValues("email").trim().toLowerCase(),
        code,
      });
      stop();
      router.replace("/(tabs)");
    } catch (caughtError) {
      const errorMsg = getErrorMessage(
        caughtError,
        "Invalid verification code. Please try again.",
      );
      setOtpError(errorMsg);
      speak(errorMsg);
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  async function handleResendCode() {
    setOtpError(null);
    setResendSuccessMsg(null);
    setIsResendingOtp(true);
    try {
      const msg = await auth.resendVerification(
        getValues("email").trim().toLowerCase(),
      );
      const successMsg = msg || "Verification code sent to your email!";
      setResendSuccessMsg(successMsg);
      speak("I've sent a new verification code to your email address!");
    } catch (caughtError) {
      const errorMsg = getErrorMessage(
        caughtError,
        "Failed to resend verification code.",
      );
      setOtpError(errorMsg);
      speak(errorMsg);
    } finally {
      setIsResendingOtp(false);
    }
  }

  return (
    <AuthScreen>
      {/* Top AI Avatar & Audio Mute Control */}
      <View className="flex-row items-center justify-between w-full mb-3 px-0.5">
        <View className="flex-row items-center gap-3">
          <AIAvatar isSpeaking={isSpeaking} size={52} />
          <View>
            <Text className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              StudyCircle Companion
            </Text>
            <Text className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {isSpeaking
                ? "Speaking prompt... 🎙️"
                : isMuted
                  ? "Audio Muted 🔇"
                  : "AI Ready 🤖"}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={toggleMute}
          className={cn(
            "p-2.5 rounded-full border transition-all active:scale-95",
            isMuted
              ? "bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800"
              : "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800",
          )}
        >
          <Icon
            name={isMuted ? "volume-x" : "volume-2"}
            size={18}
            color={isMuted ? "error" : "primary"}
          />
        </Pressable>
      </View>

      {/* AI Speech Bubble */}
      <AIAssistantBubble
        currentStep={step}
        totalSteps={5}
        title={currentStepPrompt.title}
        prompt={currentStepPrompt.prompt}
        onBack={
          step > 1 ? () => setStep((prev) => (prev - 1) as any) : undefined
        }
      />

      {/* Wizard Steps Container */}
      <View className="w-full py-2">
        {/* STEP 1: Education Level */}
        {step === 1 && (
          <View className="gap-3">
            <View className="flex-row flex-wrap gap-2.5">
              {EDUCATION_LEVEL_ITEMS.map((item) => {
                const isSelected = selectedLevel === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => handleSelectLevel(item.id)}
                    className={cn(
                      "w-[48%] p-3 rounded-2xl border transition-all justify-between min-h-[90px]",
                      isSelected
                        ? "bg-blue-50/90 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 shadow-sm"
                        : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 active:bg-stone-50",
                    )}
                  >
                    <View className="flex-row items-center justify-between">
                      <View
                        className={cn(
                          "w-8 h-8 rounded-xl items-center justify-center border",
                          isSelected
                            ? "bg-blue-100 dark:bg-blue-900/40 border-blue-200"
                            : "bg-stone-100 dark:bg-stone-800 border-stone-200",
                        )}
                      >
                        <Icon
                          name={item.iconName}
                          size={16}
                          color={isSelected ? "primary" : "muted"}
                        />
                      </View>
                      {isSelected && (
                        <View className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      )}
                    </View>
                    <View className="mt-2">
                      <Text
                        className={cn(
                          "text-xs font-bold",
                          isSelected
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-stone-900 dark:text-stone-100",
                        )}
                      >
                        {item.label}
                      </Text>
                      <Text className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                        {item.sublabel}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Text className="text-center text-xs text-stone-400 dark:text-stone-500 mt-1">
              Tap any option to auto-advance ⚡
            </Text>
          </View>
        )}

        {/* STEP 2: Preparation Goal */}
        {step === 2 && (
          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Popular suggestions for {selectedLevel}:
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {PREPARATION_SUGGESTIONS[selectedLevel].map((suggestion) => {
                  const isSelected = selectedClass === suggestion;
                  return (
                    <Pressable
                      key={suggestion}
                      onPress={() => handleSelectPreparation(suggestion)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border flex-row items-center gap-1.5",
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700",
                      )}
                    >
                      <Text
                        className={cn(
                          "text-xs font-semibold",
                          isSelected
                            ? "text-white"
                            : "text-stone-700 dark:text-stone-300",
                        )}
                      >
                        {suggestion}
                      </Text>
                      <Icon
                        name="arrow-right"
                        size={12}
                        color={isSelected ? "white" : "muted"}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="pt-2 border-t border-stone-200 dark:border-stone-800">
              <FormInput
                control={control}
                name="classOrStandard"
                label="Or type custom class/exam"
                placeholder="e.g. 10th CBSE, B.Tech, UPSC..."
                returnKeyType="next"
                onSubmitEditing={handleStep2Next}
              />
            </View>
            <Button
              variant="quiz"
              size="lg"
              title="Continue to Personal Info"
              icon="arrow-right"
              iconPosition="right"
              onPress={handleStep2Next}
              className="w-full mt-1"
            />
          </View>
        )}

        {/* STEP 3: Personal Details */}
        {step === 3 && (
          <View className="gap-3">
            <FormInput
              control={control}
              name="name"
              label="Full name"
              placeholder="e.g. Alex Johnson"
              autoComplete="name"
              returnKeyType="next"
            />
            <FormInput
              control={control}
              name="email"
              label="Email address"
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />
            <FormInput
              control={control}
              name="phone"
              label="Phone number"
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              returnKeyType="next"
            />
            <FormInput
              control={control}
              name="institute"
              label="School or institute"
              placeholder="School, college, or institute name"
              returnKeyType="next"
              onSubmitEditing={handleStep3Next}
            />
            <Button
              variant="quiz"
              size="lg"
              title="Continue to Set Password"
              icon="arrow-right"
              iconPosition="right"
              onPress={handleStep3Next}
              className="w-full mt-2"
            />
          </View>
        )}

        {/* STEP 4: Password Creation */}
        {step === 4 && (
          <View className="gap-3">
            <FormInput
              control={control}
              name="password"
              label="Create password"
              placeholder="At least 6 characters"
              secureTextEntry
              returnKeyType="next"
            />
            <FormInput
              control={control}
              name="confirmPassword"
              label="Confirm password"
              placeholder="Re-enter your password"
              secureTextEntry
              returnKeyType="send"
              onSubmitEditing={handleSubmit(onSubmitSignUp, onFormError)}
            />
            {generalError ? (
              <Text variant="error" className="text-sm">
                {generalError}
              </Text>
            ) : null}
            <Button
              variant="quiz"
              size="lg"
              title="Create Account & Get OTP"
              icon="arrow-right"
              iconPosition="right"
              onPress={handleSubmit(onSubmitSignUp, onFormError)}
              className="w-full mt-2"
            />
          </View>
        )}

        {/* STEP 5: Confirm OTP */}
        {step === 5 && (
          <View className="gap-4">
            <Input
              label="6-Digit OTP Code"
              placeholder="e.g. 123456"
              value={otpCode}
              onChangeText={(txt) => {
                setOtpCode(txt);
                if (otpError) setOtpError(null);
              }}
              keyboardType="number-pad"
              maxLength={6}
              returnKeyType="done"
              onSubmitEditing={handleVerifyOtp}
              error={otpError || undefined}
            />
            {resendSuccessMsg ? (
              <View className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200">
                <Text className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  {resendSuccessMsg}
                </Text>
              </View>
            ) : null}
            <View className="gap-2.5">
              <Button
                variant="quiz"
                size="lg"
                title={
                  isVerifyingOtp
                    ? "Verifying..."
                    : "Verify Code & Start Learning"
                }
                icon="check-circle"
                iconPosition="right"
                disabled={isVerifyingOtp}
                loading={isVerifyingOtp}
                onPress={handleVerifyOtp}
                className="w-full"
              />
              <Pressable
                onPress={handleResendCode}
                disabled={isResendingOtp}
                className="py-2 items-center justify-center"
              >
                <Text className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {isResendingOtp
                    ? "Sending new code..."
                    : "Didn't get a code? Tap to Resend"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Auth Footer */}
      <View className="mt-4">
        <AuthFooter
          promptText="Already have an account?"
          actionText="Log in"
          onActionPress={() => router.push("/sign-in")}
        />
      </View>
    </AuthScreen>
  );
}
