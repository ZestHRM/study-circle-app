import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import type { Quiz, QuizDifficultyLevel } from "@/services";
import { Feather } from "@expo/vector-icons";
import * as React from "react";
import { ActivityIndicator, View } from "react-native";

export interface QuizCardProps {
  quiz: Quiz;
  onStartQuiz: (quiz: Quiz) => void;
  onViewResults: (quiz: Quiz) => void;
  isStarting?: boolean;
}

const DIFFICULTY_CONFIG: Record<
  QuizDifficultyLevel,
  { label: string; variant: "emerald" | "amber" | "destructive"; icon: keyof typeof Feather.glyphMap }
> = {
  EASY: { label: "Easy", variant: "emerald", icon: "check-circle" },
  MEDIUM: { label: "Medium", variant: "amber", icon: "help-circle" },
  HARD: { label: "Hard", variant: "destructive", icon: "alert-circle" },
};

export const QuizCard = React.memo(function QuizCard({
  quiz,
  onStartQuiz,
  onViewResults,
  isStarting = false,
}: QuizCardProps) {
  const difficulty = DIFFICULTY_CONFIG[quiz.difficultyLevel] ?? DIFFICULTY_CONFIG.MEDIUM;
  const attemptsCount = quiz._count?.quizAttempts ?? 0;
  const hasActiveAttempt = Boolean(quiz.activeAttempt);

  const handleStartPress = React.useCallback(() => {
    onStartQuiz(quiz);
  }, [onStartQuiz, quiz]);

  const handleResultsPress = React.useCallback(() => {
    onViewResults(quiz);
  }, [onViewResults, quiz]);

  return (
    <View className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4.5 gap-3.5 shadow-2xs">
      {/* Header Row: Title & Subject Badge */}
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1 pr-1">
          <Text
            className="text-base font-bold text-stone-900 dark:text-stone-100"
            numberOfLines={2}
          >
            {quiz.title}
          </Text>
          <Text className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5" numberOfLines={1}>
            {quiz.subject?.name ?? "General Subject"}
          </Text>
        </View>

        <Badge
          icon={difficulty.icon}
          label={difficulty.label}
          variant={difficulty.variant}
        />
      </View>

      {/* Description Snippet if present */}
      {quiz.description?.trim() ? (
        <Text
          className="text-xs text-stone-600 dark:text-stone-300 leading-5"
          numberOfLines={2}
        >
          {quiz.description.trim()}
        </Text>
      ) : null}

      {/* Meta Chips Row */}
      <View className="flex-row flex-wrap items-center gap-2 pt-0.5">
        <Badge
          icon="help-circle"
          label={`${quiz.totalQuestions} Qs`}
          variant="blue"
        />

        <Badge
          icon="bar-chart-2"
          label={`${attemptsCount} ${attemptsCount === 1 ? 'Attempt' : 'Attempts'}`}
          variant="outline"
        />

        {hasActiveAttempt ? (
          <Badge
            icon="clock"
            label="In Progress"
            variant="orange"
          />
        ) : null}
      </View>

      {/* Action Buttons Row */}
      <View className="flex-row items-center gap-2.5 pt-1 border-t border-stone-100 dark:border-stone-800/80">
        <Button
          variant="quiz"
          icon={hasActiveAttempt ? "rotate-cw" : "play"}
          iconSize={14}
          onPress={handleStartPress}
          disabled={isStarting || quiz.totalQuestions <= 0}
          className="flex-1 h-10 rounded-xl justify-center items-center"
        >
          {isStarting ? (
            <ActivityIndicator size="small" color={APP_COLORS.white} />
          ) : hasActiveAttempt ? (
            "Resume Quiz"
          ) : (
            "Start Quiz"
          )}
        </Button>

        <Button
          variant="outline"
          icon="eye"
          iconSize={14}
          onPress={handleResultsPress}
          disabled={attemptsCount <= 0}
          className="h-10 rounded-xl px-4 justify-center items-center"
        >
          Results
        </Button>
      </View>
    </View>
  );
});
