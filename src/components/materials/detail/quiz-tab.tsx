import { ErrorState, Icon, Spinner, Text } from "@/components/ui";
import { APP_COLORS } from "@/constants/colors";
import type { Quiz } from "@/services";
import { useRouter } from "expo-router";
import * as React from "react";
import { Pressable, ScrollView, View } from "react-native";

interface QuizTabProps {
  quiz: Quiz | null;
  isLoading: boolean;
  quizReady: boolean;
  quizFailed?: boolean;
  isPro: boolean;
  isForbidden: boolean;
  onStartQuiz: (quiz: Quiz) => void;
  isStarting: boolean;
  startingQuizId: string | null;
  materialTitle: string;
}

export const QuizTab = React.memo(function QuizTab({
  quiz,
  isLoading,
  quizReady,
  quizFailed = false,
  isPro,
  isForbidden,
  onStartQuiz,
  isStarting,
  startingQuizId,
  materialTitle,
}: QuizTabProps) {
  const router = useRouter();
  const handleOpenBilling = React.useCallback(() => {
    router.push("/subscriptions" as any);
  }, [router]);

  const totalQuestionsCount =
    quiz?._count?.quizQuestions ??
    (quiz as any)?.totalQuestions ??
    (quiz as any)?.quizQuestions?.length ??
    0;

  const paywallFeatures = React.useMemo(() => {
    const questionText =
      totalQuestionsCount > 0
        ? `${totalQuestionsCount} practice questions included`
        : "AI-generated practice questions";

    return [
      { icon: "layers", label: questionText, color: APP_COLORS.brandPurple },
      {
        icon: "message-square",
        label: "Instant feedback",
        color: APP_COLORS.quizBlue,
      },
      {
        icon: "bar-chart-2",
        label: "Detailed performance reports",
        color: APP_COLORS.emerald600,
      },
    ];
  }, [totalQuestionsCount]);

  const sampleQuestions = React.useMemo(() => {
    if (quiz && (quiz as any).quizQuestions?.length > 0) {
      return (quiz as any).quizQuestions
        .slice(0, 3)
        .map((q: any, idx: number) => ({
          id: `Q${idx + 1}`,
          q: q.question ?? q.title ?? `Question ${idx + 1}`,
        }));
    }
    const title = materialTitle?.trim() || "Study Material";
    return [
      { id: "Q1", q: `Key concepts of ${title}` },
      { id: "Q2", q: `Core principles in ${title}` },
      { id: "Q3", q: `Practical applications of ${title}` },
    ];
  }, [quiz, materialTitle]);

  if (isLoading) {
    return (
      <View
        className="flex-1 bg-background items-center justify-center"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Spinner variant="quiz" size="large" message="Loading quiz..." center />
      </View>
    );
  }

  // ── Free User or Forbidden — Exact Paywall UI matching design ──
  if (isForbidden || !isPro) {
    return (
      <ScrollView
        className="flex-1 bg-background"
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Soft Lavender Card Container matching UI image */}
        <View className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 rounded-3xl p-5 gap-4 items-center">
          {/* Top Illustration: Clipboard + Crown Badge */}
          <View className="items-center justify-center my-2 relative">
            <View className="w-20 h-20 rounded-3xl bg-purple-100 dark:bg-purple-900/50 items-center justify-center border border-purple-200 dark:border-purple-800">
              <Icon name="clipboard" size={38} color={APP_COLORS.brandPurple} />
              {/* Crown overlay badge */}
              <View
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full items-center justify-center border-2 border-white shadow-sm"
                style={{
                  backgroundColor: APP_COLORS.quizBlue,
                  borderColor: APP_COLORS.white,
                }}
              >
                <Icon name="award" size={16} color={APP_COLORS.white} />
              </View>
            </View>
          </View>

          {/* Title & Description */}
          <View className="items-center gap-1 text-center">
            <Text variant="h2" className="text-center">
              Your quiz is ready!
            </Text>
            <Text
              variant="muted"
              className="text-center leading-relaxed max-w-[280px]"
            >
              We created a practice set from your material. Test your knowledge
              and boost your score.
            </Text>
          </View>

          {/* Locked Sample Questions Box */}
          <View className="w-full bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
            {sampleQuestions.map((item: { id: string; q: string }) => (
              <View
                key={item.id}
                className="flex-row items-center justify-between px-4 py-3 bg-card"
              >
                <View className="flex-row items-center gap-3 flex-1 pr-2">
                  <Text
                    variant="caption"
                    className="font-black text-blue-600 dark:text-blue-400 w-6"
                  >
                    {item.id}
                  </Text>
                  <Text variant="subhead" className="flex-1" numberOfLines={1}>
                    {item.q}
                  </Text>
                </View>
                <Icon name="lock" size={14} color={APP_COLORS.stone400} />
              </View>
            ))}
          </View>

          {/* Primary Action Button: Unlock AI Quizzes */}
          <Pressable
            onPress={handleOpenBilling}
            className="w-full rounded-2xl flex-row items-center justify-center gap-2 py-3.5 shadow-md active:opacity-90 mt-1"
            style={{ backgroundColor: APP_COLORS.brandPurple }}
          >
            <Icon name="award" size={18} color={APP_COLORS.white} />
            <Text variant="subhead" className="text-white font-bold">
              Unlock AI Quizzes →
            </Text>
          </Pressable>

          {/* Feature Checklist */}
          <View className="w-full gap-2.5 pt-2 px-2">
            {paywallFeatures.map((feature) => (
              <View key={feature.label} className="flex-row items-center gap-3">
                <View
                  className="w-7 h-7 rounded-xl items-center justify-center"
                  style={{ backgroundColor: feature.color + "18" }}
                >
                  <Icon
                    name={feature.icon as any}
                    size={14}
                    color={feature.color}
                  />
                </View>
                <Text variant="subhead">{feature.label}</Text>
              </View>
            ))}
          </View>

          {/* Restore purchase footer link */}
          <View className="flex-row items-center justify-center gap-1 pt-2">
            <Text variant="caption">Already a Pro user?</Text>
            <Pressable onPress={handleOpenBilling}>
              <Text variant="primary" className="text-xs">
                Restore purchase
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  }

  if (quizFailed) {
    return (
      <ErrorState
        icon="alert-triangle"
        title="Quiz Generation Failed"
        description="AI couldn't generate practice questions for this material. Please try re-uploading the document."
      />
    );
  }

  // ── Pro User with Quiz Ready — Start Quiz Screen ──
  if (!quizReady) {
    return (
      <View
        className="flex-1 bg-background items-center justify-center px-8 gap-5"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <View className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-950/40 items-center justify-center">
          <Icon name="cpu" size={28} color={APP_COLORS.purpleAccent} />
        </View>
        <Text variant="h3" className="text-center">
          Quiz is being generated…
        </Text>
        <Text variant="muted" className="text-center leading-6">
          Your AI practice quiz will be ready shortly after notes are processed.
        </Text>
        <View
          className="w-full bg-purple-100 dark:bg-purple-950/40 rounded-full overflow-hidden"
          style={{ height: 8 }}
        >
          <View
            className="h-full bg-purple-500 rounded-full"
            style={{ width: "55%" }}
          />
        </View>
      </View>
    );
  }

  if (!quiz) {
    return (
      <View
        className="flex-1 bg-background items-center justify-center px-8 gap-4"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Icon name="search" size={32} color={APP_COLORS.stone300} />
        <Text variant="h3" className="text-center">
          No quiz found
        </Text>
        <Text variant="muted" className="text-center">
          Quiz for this material is not available yet.
        </Text>
      </View>
    );
  }

  const hasActiveAttempt = Boolean(quiz?.activeAttempt);

  return (
    <ScrollView
      className="flex-1 bg-background"
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View className="bg-card rounded-3xl border border-border px-6 py-8 items-center gap-3">
        <View className="w-20 h-20 rounded-3xl bg-blue-100 dark:bg-blue-950/40 items-center justify-center">
          <Icon name="clipboard" size={38} color={APP_COLORS.quizBlue} />
        </View>

        {hasActiveAttempt ? (
          <View className="bg-orange-500/15 border border-orange-500/30 px-3.5 py-1 rounded-full flex-row items-center gap-1.5">
            <Icon name="clock" size={13} color="#F97316" />
            <Text className="text-xs font-bold text-orange-600 dark:text-orange-400">
              Attempt In Progress
            </Text>
          </View>
        ) : null}

        <Text variant="h2" className="text-center">
          {hasActiveAttempt ? "Resume your practice quiz!" : "Your quiz is ready!"}
        </Text>
        <Text variant="muted" className="text-center leading-6">
          {hasActiveAttempt
            ? "You have an active quiz attempt in progress.\nPick up right where you left off."
            : "We created a practice set from your material.\nTest your knowledge and boost your score."}
        </Text>

        {/* Dynamic Quiz Stats */}
        <View className="flex-row gap-3 mt-1 w-full">
          <View className="flex-1 bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-3 items-center gap-0.5">
            <Text variant="h2" className="text-blue-600 font-black">
              {quiz.totalQuestions ??
                (quiz as any).quizQuestions?.length ??
                "?"}
            </Text>
            <Text variant="caption">Questions</Text>
          </View>

          <View className="flex-1 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-3 items-center gap-0.5 justify-center">
            <Text
              variant="h2"
              className="text-emerald-600 font-black capitalize text-base"
            >
              {quiz.difficultyLevel
                ? quiz.difficultyLevel.toLowerCase()
                : "Medium"}
            </Text>
            <Text variant="caption">Difficulty</Text>
          </View>

          <View className="flex-1 bg-purple-50 dark:bg-purple-950/30 rounded-2xl p-3 items-center gap-0.5">
            <Text variant="h2" className="text-purple-600 font-black">
              {quiz._count?.quizAttempts ?? (quiz as any).attemptsCount ?? 0}
            </Text>
            <Text variant="caption">Attempts</Text>
          </View>
        </View>
      </View>

      {/* Start / Resume Button */}
      <Pressable
        onPress={() => onStartQuiz(quiz)}
        disabled={isStarting && startingQuizId === quiz.id}
        className="bg-primary rounded-2xl flex-row items-center justify-center gap-2 active:opacity-80 py-3.5 shadow-md"
        style={{ height: 52 }}
      >
        <Icon
          name={
            isStarting && startingQuizId === quiz.id
              ? "loader"
              : hasActiveAttempt
              ? "rotate-cw"
              : "zap"
          }
          size={16}
          color={APP_COLORS.white}
        />
        <Text variant="subhead" className="text-white font-bold">
          {isStarting && startingQuizId === quiz.id
            ? "Starting…"
            : hasActiveAttempt
            ? "Resume Quiz →"
            : "Start Quiz →"}
        </Text>
      </Pressable>
    </ScrollView>
  );
});
