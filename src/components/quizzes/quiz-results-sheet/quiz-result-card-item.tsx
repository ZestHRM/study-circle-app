import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import type { QuizAnswerCorrectness, QuizAnswerGrading } from "@/lib/api";
import { Feather } from "@expo/vector-icons";
import * as React from "react";
import { View } from "react-native";

const CORRECTNESS_CONFIG: Record<
  QuizAnswerCorrectness,
  {
    label: string;
    variant: "emerald" | "amber" | "destructive" | "outline";
    icon: keyof typeof Feather.glyphMap;
    bgColor: string;
    borderColor: string;
  }
> = {
  CORRECT: {
    label: "Correct",
    variant: "emerald",
    icon: "check-circle",
    bgColor: "bg-emerald-50/60 dark:bg-emerald-950/20",
    borderColor: "border-emerald-200/80 dark:border-emerald-900/40",
  },
  PARTIALLY_CORRECT: {
    label: "Partially Correct",
    variant: "amber",
    icon: "alert-circle",
    bgColor: "bg-amber-50/60 dark:bg-amber-950/20",
    borderColor: "border-amber-200/80 dark:border-amber-900/40",
  },
  INCORRECT: {
    label: "Incorrect",
    variant: "destructive",
    icon: "x-circle",
    bgColor: "bg-red-50/60 dark:bg-red-950/20",
    borderColor: "border-red-200/80 dark:border-red-900/40",
  },
  NONE: {
    label: "Not Answered",
    variant: "outline",
    icon: "help-circle",
    bgColor: "bg-stone-50 dark:bg-stone-900/40",
    borderColor: "border-stone-200 dark:border-stone-800",
  },
};

const GRADER_CONFIG: Record<
  QuizAnswerGrading,
  { label: string; variant: "blue" | "purple" | "emerald" | "outline" }
> = {
  GPT: { label: "AI GPT Graded", variant: "blue" },
  EMBEDDING: { label: "Vector Graded", variant: "purple" },
  MATCH: { label: "Exact Match", variant: "emerald" },
  NONE: { label: "Auto", variant: "outline" },
};

export interface QuizResultCardItemProps {
  index: number;
  result: any;
}

export const QuizResultCardItem = React.memo(function QuizResultCardItem({
  index,
  result,
}: QuizResultCardItemProps) {
  const [showExplanation, setShowExplanation] = React.useState(false);
  const toggleExplanation = React.useCallback(
    () => setShowExplanation((v) => !v),
    []
  );

  const correctnessKey = (result.correctness as QuizAnswerCorrectness) || "NONE";
  const graderKey = (result.gradingMethod as QuizAnswerGrading) || "NONE";

  const correctness = CORRECTNESS_CONFIG[correctnessKey] ?? CORRECTNESS_CONFIG.NONE;
  const grader = GRADER_CONFIG[graderKey] ?? GRADER_CONFIG.NONE;

  const userAnswerText = result.userAnswer?.trim() || "Not answered";

  return (
    <View
      className={`border rounded-2xl p-4 gap-3 bg-white dark:bg-stone-900 ${correctness.borderColor} shadow-2xs`}
    >
      {/* Header: Question Number & Badges */}
      <View className="flex-row items-center justify-between gap-2">
        <Badge
          label={`Q${String(index + 1).padStart(2, "0")}`}
          variant="purple"
        />
        <View className="flex-row items-center gap-1.5">
          <Badge
            icon={correctness.icon}
            label={correctness.label}
            variant={correctness.variant}
          />
          <Badge label={grader.label} variant={grader.variant} />
        </View>
      </View>

      {/* Question Text */}
      <Text className="text-base font-bold text-stone-900 dark:text-stone-100 leading-6">
        {result.question?.question}
      </Text>

      {/* User Answer Card */}
      <View className={`p-3 rounded-xl border ${correctness.bgColor} ${correctness.borderColor} gap-1`}>
        <Text className="text-xs font-semibold text-stone-500 dark:text-stone-400">
          Your Answer:
        </Text>
        <Text className="text-sm font-medium text-stone-900 dark:text-stone-100">
          {userAnswerText}
        </Text>
      </View>

      {/* Explanation Toggle Button */}
      <Button
        size="sm"
        variant="outline"
        icon={showExplanation ? "eye-off" : "eye"}
        title={showExplanation ? "Hide Solution" : "View Solution & Explanation"}
        onPress={toggleExplanation}
        className="self-start h-9 rounded-xl px-3.5 mt-0.5"
      />

      {/* Solution Box */}
      {showExplanation ? (
        <View className="bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 rounded-xl p-3.5 gap-1.5 mt-1">
          <View className="flex-row items-center gap-2">
            <Feather name="check-circle" size={15} color={APP_COLORS.primary} />
            <Text className="text-xs font-bold text-purple-950 dark:text-purple-200">
              Correct Answer: {result.question?.answer ?? "N/A"}
            </Text>
          </View>

          <Text className="text-xs text-stone-600 dark:text-stone-300 leading-5 pt-0.5">
            <Text className="font-semibold">Explanation: </Text>
            {result.question?.explanation || "No explanation available."}
          </Text>
        </View>
      ) : null}
    </View>
  );
});
