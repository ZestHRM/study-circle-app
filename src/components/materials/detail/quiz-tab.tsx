import { Badge, ErrorState, Icon, Spinner, Text } from "@/components/ui";
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

function QuizStatCard({
  value,
  label,
  variant = "primary",
}: {
  value: React.ReactNode;
  label: string;
  variant?: "primary" | "emerald";
}) {
  const isEmerald = variant === "emerald";
  return (
    <View
      className={`flex-1 rounded-2xl p-3 items-center justify-center gap-0.5 ${
        isEmerald
          ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40"
          : "bg-primary/10"
      }`}
    >
      <Text
        variant="h2"
        className={`font-black capitalize text-base ${
          isEmerald ? "text-emerald-600 dark:text-emerald-400" : "text-primary"
        }`}
      >
        {value}
      </Text>
      <Text variant="caption">{label}</Text>
    </View>
  );
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
      { icon: "layers", label: questionText, color: "primary" },
      {
        icon: "message-square",
        label: "Instant feedback",
        color: "primary",
      },
      {
        icon: "bar-chart-2",
        label: "Detailed performance reports",
        color: "emerald",
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
        <View className="bg-card border border-border rounded-3xl p-5 gap-4 items-center">
          {/* Top Illustration: Clipboard + Crown Badge */}
          <View className="items-center justify-center my-2 relative">
            <View className="w-20 h-20 rounded-3xl bg-primary/10 items-center justify-center border border-primary/20">
              <Icon name="clipboard" size={38} color="primary" />
              {/* Crown overlay badge */}
              <View className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary items-center justify-center border-2 border-background shadow-xs">
                <Icon name="award" size={16} color="white" />
              </View>
            </View>
          </View>

          {/* Title & Description */}
          <View className="items-center gap-1 text-center">
            <Text variant="h2" className="text-center font-bold">
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
                    className="font-black text-primary w-6"
                  >
                    {item.id}
                  </Text>
                  <Text variant="subhead" className="flex-1" numberOfLines={1}>
                    {item.q}
                  </Text>
                </View>
                <Icon name="lock" size={14} color="muted" />
              </View>
            ))}
          </View>

          {/* Primary Action Button: Unlock AI Quizzes */}
          <Pressable
            onPress={handleOpenBilling}
            className="w-full bg-primary rounded-2xl flex-row items-center justify-center gap-2 py-3.5 shadow-xs active:opacity-90 mt-1"
          >
            <Icon name="award" size={18} color="white" />
            <Text variant="subhead" className="text-white font-bold">
              Unlock AI Quizzes →
            </Text>
          </Pressable>

          {/* Feature Checklist */}
          <View className="w-full gap-2.5 pt-2 px-2">
            {paywallFeatures.map((feature) => (
              <View key={feature.label} className="flex-row items-center gap-3">
                <View className="w-7 h-7 rounded-xl bg-primary/10 items-center justify-center">
                  <Icon
                    name={feature.icon as any}
                    size={14}
                    color={feature.color as any}
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
              <Text variant="primary" className="text-xs font-bold">
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
        <View className="w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center">
          <Icon name="cpu" size={28} color="primary" />
        </View>
        <Text variant="h3" className="text-center font-bold">
          Quiz is being generated…
        </Text>
        <Text variant="muted" className="text-center leading-6">
          Your AI practice quiz will be ready shortly after notes are processed.
        </Text>
        <View
          className="w-full bg-muted rounded-full overflow-hidden"
          style={{ height: 8 }}
        >
          <View
            className="h-full bg-primary rounded-full"
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
        <Icon name="search" size={32} color="muted" />
        <Text variant="h3" className="text-center font-bold">
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
      <View className="bg-card rounded-3xl border border-border px-6 py-8 items-center gap-3 shadow-2xs">
        <View className="w-20 h-20 rounded-3xl bg-primary/10 items-center justify-center">
          <Icon name="clipboard" size={38} color="primary" />
        </View>

        {hasActiveAttempt ? (
          <Badge label="Attempt In Progress" variant="amber" icon="clock" />
        ) : null}

        <Text variant="h2" className="text-center font-bold">
          {hasActiveAttempt
            ? "Resume your practice quiz!"
            : "Your quiz is ready!"}
        </Text>
        <Text variant="muted" className="text-center leading-6">
          {hasActiveAttempt
            ? "You have an active quiz attempt in progress.\nPick up right where you left off."
            : "We created a practice set from your material.\nTest your knowledge and boost your score."}
        </Text>

        {/* Dynamic Quiz Stats */}
        <View className="flex-row gap-3 mt-1 w-full">
          <QuizStatCard
            value={
              quiz.totalQuestions ?? (quiz as any).quizQuestions?.length ?? "?"
            }
            label="Questions"
          />

          <QuizStatCard
            value={
              quiz.difficultyLevel
                ? quiz.difficultyLevel.toLowerCase()
                : "Medium"
            }
            label="Difficulty"
            variant="emerald"
          />

          <QuizStatCard
            value={
              quiz._count?.quizAttempts ?? (quiz as any).attemptsCount ?? 0
            }
            label="Attempts"
          />
        </View>
      </View>

      {/* Start / Resume Button */}
      <Pressable
        onPress={() => onStartQuiz(quiz)}
        disabled={isStarting && startingQuizId === quiz.id}
        className="bg-primary rounded-2xl flex-row items-center justify-center gap-2 active:opacity-80 py-3.5 shadow-2xs"
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
          color="white"
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
