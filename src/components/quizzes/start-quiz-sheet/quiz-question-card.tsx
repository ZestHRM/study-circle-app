import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { View } from "react-native";

export interface QuizQuestionCardProps {
  questionIndex: number;
  questionTypeLabel: string;
  questionText: string;
}

export const QuizQuestionCard = React.memo(function QuizQuestionCard({
  questionIndex,
  questionTypeLabel,
  questionText,
}: QuizQuestionCardProps) {
  return (
    <View className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 gap-2.5 shadow-2xs">
      <View className="flex-row items-center justify-between">
        <Badge
          label={`Q${String(questionIndex + 1).padStart(2, "0")}`}
          variant="purple"
        />
        <Badge label={questionTypeLabel} variant="outline" />
      </View>

      <Text className="text-base font-bold text-stone-900 dark:text-stone-100 leading-6">
        {questionText}
      </Text>
    </View>
  );
});
