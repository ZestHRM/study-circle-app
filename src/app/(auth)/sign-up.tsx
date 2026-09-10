import { AuthScreen } from "@/components/auth-screen";
import { AIAssistantBubble, AIAvatar, AuthFooter, Icon } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { getErrorMessage, type EducationLevel } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { signUpSchema, type SignUpValues } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, View, type TextInput } from "react-native";

const EDUCATION_LEVEL_ITEMS: Array<{
  id: EducationLevel;
  label: string;
  sublabel: string;
  iconName: "book-open" | "award" | "users" | "zap";
}> = [
  { id: "School", label: "School", sublabel: "Class 1st to 12th", iconName: "book-open" },
  { id: "College", label: "College", sublabel: "Degree & Uni", iconName: "award" },
  { id: "Coaching", label: "Coaching", sublabel: "Institute / Academy", iconName: "users" },
  { id: "CompetitiveExams", label: "Competitive", sublabel: "UPSC, JEE, NEET, etc.", iconName: "zap" },
];

const PREPARATION_SUGGESTIONS: Record<EducationLevel, string[]> = {
  School: ["10th CBSE", "12th Board", "9th Class", "11th Science", "State Board"],
  College: ["B.Tech / B.E.", "B.Sc / M.Sc", "B.Com / BBA", "MBA / MCA", "Medicine / MBBS"],
  Coaching: ["JEE Mains / Adv", "NEET UG", "CA Foundation", "CUET", "CLAT"],
  CompetitiveExams: ["UPSC Civil Services", "SSC CGL / CHSL", "Banking / IBPS", "GATE / ESE", "State PCS"],
};

export default function SignUpScreen() {
  const router = useRouter();
  const auth = useAuth();
  
  // Wizard state: Step 1 to 5
  const [step, setStep] = React.useState<1 | 2 | 3 | 4 | 5>(1);
  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [otpCode, setOtpCode] = React.useState("");
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = React.useState(false);
  const [isResendingOtp, setIsResendingOtp] = React.useState(false);
  const [resendSuccessMsg, setResendSuccessMsg] = React.useState<string | null>(null);

  // AI Avatar & Text-to-Speech State
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const hasSpokenIntroRef = React.useRef(false);

  // Input Refs for focus navigation
  const emailInputRef = React.useRef<TextInput>(null);
  const phoneInputRef = React.useRef<TextInput>(null);
  const instituteInputRef = React.useRef<TextInput>(null);
  const classInputRef = React.useRef<TextInput>(null);
  const passwordInputRef = React.useRef<TextInput>(null);
  const confirmPasswordInputRef = React.useRef<TextInput>(null);
  const otpInputRef = React.useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    getValues,
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
  const selectedClass = watch("classOrStandard");
  const userEmail = watch("email");

  // AI Bubble Prompts depending on step
  const STEP_PROMPTS = {
    1: {
      title: "Step 1 of 5 • Education Level",
      prompt: "Hi there! 👋 I'm your AI Study Companion. Let me customize your space! First, what is your education level?",
    },
    2: {
      title: "Step 2 of 5 • Target Goal",
      prompt: `Awesome! What class, degree, or competitive exam are you currently preparing for as a ${selectedLevel} student?`,
    },
    3: {
      title: "Step 3 of 5 • Personal Profile",
      prompt: "Great! How should I address you, and where can I send your study updates and progress reports?",
    },
    4: {
      title: "Step 4 of 5 • Account Password",
      prompt: "Almost done! Choose a secure password to protect your personal AI study workspace.",
    },
    5: {
      title: "Step 5 of 5 • Confirm Verification OTP",
      prompt: `I've sent a 6-digit verification code to ${userEmail || "your email"}. Enter it below to unlock your dashboard!`,
    },
  };

  // Safe Text-To-Speech helper
  const speakPrompt = React.useCallback(
    (textToSpeak: string, onFinish?: () => void) => {
      if (isMuted) {
        setIsSpeaking(false);
        if (onFinish) onFinish();
        return;
      }

      Speech.stop();
      setIsSpeaking(true);

      Speech.speak(textToSpeak, {
        language: "en",
        pitch: 1.0,
        rate: 0.95,
        onStart: () => setIsSpeaking(true),
        onDone: () => {
          setIsSpeaking(false);
          if (onFinish) onFinish();
        },
        onError: () => {
          setIsSpeaking(false);
          if (onFinish) onFinish();
        },
        onStopped: () => {
          setIsSpeaking(false);
        },
      });
    },
    [isMuted]
  );

  // Trigger TTS on Mount (Intro) and on Step change
  React.useEffect(() => {
    if (isMuted) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    if (!hasSpokenIntroRef.current) {
      hasSpokenIntroRef.current = true;
      const introSpeechText =
        "Welcome to StudyCircle AI! I'm your AI Study Companion, here to help you set up your personalized learning space. Let's begin!";
      speakPrompt(introSpeechText, () => {
        speakPrompt(STEP_PROMPTS[step].prompt);
      });
    } else {
      speakPrompt(STEP_PROMPTS[step].prompt);
    }

    return () => {
      Speech.stop();
      setIsSpeaking(false);
    };
  }, [step, isMuted, speakPrompt]);

  // Step 1 -> Select level & auto-advance to Step 2
  function handleSelectLevel(level: EducationLevel) {
    setValue("level", level);
    setValue("classOrStandard", "");
    setGeneralError(null);
    setStep(2);
  }

  // Step 2 -> Select preparation suggestion chip & auto-advance to Step 3
  function handleSelectPreparation(prepLabel: string) {
    setValue("classOrStandard", prepLabel);
    setGeneralError(null);
    setStep(3);
  }

  // Step 2 Manual Submit -> Validate classOrStandard & advance to Step 3
  async function handleStep2Next() {
    setGeneralError(null);
    const isValid = await trigger("classOrStandard");
    if (isValid) {
      setStep(3);
    }
  }

  // Step 3 -> Validate Personal Info & advance to Step 4
  async function handleStep3Next() {
    setGeneralError(null);
    const isValid = await trigger(["name", "email", "phone", "institute"]);
    if (isValid) {
      setStep(4);
    }
  }

  // Step 4 Submit -> Create Account & trigger OTP Email -> Advance to Step 5
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
      // Move to Step 5 (Confirm OTP)
      setStep(5);
    } catch (caughtError) {
      setGeneralError(getErrorMessage(caughtError, "Unable to create account."));
    }
  }

  // Step 5 -> Verify OTP Code & Auto-login user straight to dashboard
  async function handleVerifyOtp() {
    setOtpError(null);
    const trimmedCode = otpCode.trim();
    if (!trimmedCode) {
      setOtpError("Please enter the 6-digit verification code.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await auth.verifyEmail({
        email: getValues("email").trim().toLowerCase(),
        code: trimmedCode,
      });
      // Verification automatically stores auth token & user state -> redirect to dashboard
      Speech.stop();
      router.replace("/(tabs)");
    } catch (caughtError) {
      setOtpError(getErrorMessage(caughtError, "Invalid verification code. Please try again."));
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  // Resend OTP Code
  async function handleResendCode() {
    setOtpError(null);
    setResendSuccessMsg(null);
    setIsResendingOtp(true);
    try {
      const msg = await auth.resendVerification(getValues("email").trim().toLowerCase());
      setResendSuccessMsg(msg || "Verification code sent to your email!");
    } catch (caughtError) {
      setOtpError(getErrorMessage(caughtError, "Failed to resend verification code."));
    } finally {
      setIsResendingOtp(false);
    }
  }

  return (
    <AuthScreen>
      {/* Top AI Avatar & Audio Mute Control Bar */}
      <View className="flex-row items-center justify-between w-full mb-3 px-0.5">
        <View className="flex-row items-center gap-3">
          <AIAvatar isSpeaking={isSpeaking} size={52} />
          <View>
            <Text className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              StudyCircle Companion
            </Text>
            <Text className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {isSpeaking ? "Speaking prompt... 🎙️" : isMuted ? "Audio Muted 🔇" : "AI Ready 🤖"}
            </Text>
          </View>
        </View>

        {/* Audio Mute/Unmute Toggle */}
        <Pressable
          onPress={() => setIsMuted((prev) => !prev)}
          className={cn(
            "p-2.5 rounded-full border transition-all active:scale-95",
            isMuted
              ? "bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800"
              : "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800"
          )}
        >
          <Icon
            name={isMuted ? "volume-x" : "volume-2"}
            size={18}
            color={isMuted ? "error" : "primary"}
          />
        </Pressable>
      </View>

      {/* Conversational AI Header Bubble */}
      <AIAssistantBubble
        currentStep={step}
        totalSteps={5}
        title={STEP_PROMPTS[step].title}
        prompt={STEP_PROMPTS[step].prompt}
        onBack={step > 1 ? () => setStep((prev) => (prev - 1) as any) : undefined}
      />

      {/* Main Interactive Form Card Area */}
      <View className="w-full py-2">
        {/* STEP 1: Education Level (2x2 Cards with Auto-Advance) */}
        {step === 1 && (
          <View className="gap-3 animate-fade-in">
            <View className="gap-2.5">
              <View className="flex-row gap-2.5">
                {EDUCATION_LEVEL_ITEMS.slice(0, 2).map((item) => {
                  const isSelected = selectedLevel === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => handleSelectLevel(item.id)}
                      className={cn(
                        "flex-1 p-3.5 rounded-2xl border transition-all justify-between min-h-[96px]",
                        isSelected
                          ? "bg-blue-50/90 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 shadow-sm"
                          : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 active:bg-stone-50"
                      )}
                    >
                      <View className="flex-row items-center justify-between">
                        <View
                          className={cn(
                            "w-9 h-9 rounded-xl items-center justify-center border",
                            isSelected
                              ? "bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800"
                              : "bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700"
                          )}
                        >
                          <Icon
                            name={item.iconName}
                            size={18}
                            color={isSelected ? "primary" : "muted"}
                          />
                        </View>
                        {isSelected && (
                          <View className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-500" />
                        )}
                      </View>
                      <View className="mt-2">
                        <Text
                          className={cn(
                            "text-sm font-bold",
                            isSelected
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-stone-900 dark:text-stone-100"
                          )}
                        >
                          {item.label}
                        </Text>
                        <Text className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                          {item.sublabel}
                        </Text>
                      </View>
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
                      onPress={() => handleSelectLevel(item.id)}
                      className={cn(
                        "flex-1 p-3.5 rounded-2xl border transition-all justify-between min-h-[96px]",
                        isSelected
                          ? "bg-blue-50/90 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 shadow-sm"
                          : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 active:bg-stone-50"
                      )}
                    >
                      <View className="flex-row items-center justify-between">
                        <View
                          className={cn(
                            "w-9 h-9 rounded-xl items-center justify-center border",
                            isSelected
                              ? "bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800"
                              : "bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700"
                          )}
                        >
                          <Icon
                            name={item.iconName}
                            size={18}
                            color={isSelected ? "primary" : "muted"}
                          />
                        </View>
                        {isSelected && (
                          <View className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-500" />
                        )}
                      </View>
                      <View className="mt-2">
                        <Text
                          className={cn(
                            "text-sm font-bold",
                            isSelected
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-stone-900 dark:text-stone-100"
                          )}
                        >
                          {item.label}
                        </Text>
                        <Text className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                          {item.sublabel}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <Text className="text-center text-xs text-stone-400 dark:text-stone-500 mt-1">
              Tap any option to auto-advance ⚡
            </Text>
          </View>
        )}

        {/* STEP 2: Preparation Goal (Suggestions + Input with Auto-Advance) */}
        {step === 2 && (
          <View className="gap-4 animate-fade-in">
            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
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
                        "px-3.5 py-2 rounded-full border transition-all flex-row items-center gap-1.5",
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white shadow-2xs"
                          : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 active:bg-stone-100"
                      )}
                    >
                      <Text
                        className={cn(
                          "text-xs font-semibold",
                          isSelected ? "text-white" : "text-stone-700 dark:text-stone-300"
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
              <Controller
                control={control}
                name="classOrStandard"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    ref={classInputRef}
                    label="Or type custom class/exam"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="e.g. 10th CBSE, B.Tech, UPSC..."
                    returnKeyType="next"
                    submitBehavior="submit"
                    onSubmitEditing={handleStep2Next}
                    error={errors.classOrStandard?.message}
                  />
                )}
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

        {/* STEP 3: Personal Details (Name, Email, Phone, Institute) */}
        {step === 3 && (
          <View className="gap-3.5 animate-fade-in">
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Full name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="e.g. Alex Johnson"
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
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => phoneInputRef.current?.focus()}
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
                  placeholder="+91 98765 43210"
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
                  placeholder="School, college, or institute name"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={handleStep3Next}
                  error={errors.institute?.message}
                />
              )}
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

        {/* STEP 4: Create Password */}
        {step === 4 && (
          <View className="gap-3.5 animate-fade-in">
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  ref={passwordInputRef}
                  label="Create password"
                  placeholder="At least 6 characters"
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
                  placeholder="Re-enter your password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  returnKeyType="send"
                  onSubmitEditing={handleSubmit(onSubmitSignUp)}
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            {generalError ? (
              <Text variant="error" className="text-sm">
                {generalError}
              </Text>
            ) : null}

            <Button
              variant="quiz"
              size="lg"
              title={isSubmitting ? "Creating account & sending OTP..." : "Create Account & Get OTP"}
              icon="arrow-right"
              iconPosition="right"
              disabled={isSubmitting}
              loading={isSubmitting}
              onPress={handleSubmit(onSubmitSignUp)}
              className="w-full mt-2"
            />
          </View>
        )}

        {/* STEP 5: Confirm Verification OTP */}
        {step === 5 && (
          <View className="gap-4 animate-fade-in">
            <Input
              ref={otpInputRef}
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
              <View className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <Text className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  {resendSuccessMsg}
                </Text>
              </View>
            ) : null}

            <View className="gap-2.5">
              <Button
                variant="quiz"
                size="lg"
                title={isVerifyingOtp ? "Verifying & Logging In..." : "Verify Code & Start Learning"}
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
                  {isResendingOtp ? "Sending new code..." : "Didn't get a code? Tap to Resend"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Auth Footer Prompt */}
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
