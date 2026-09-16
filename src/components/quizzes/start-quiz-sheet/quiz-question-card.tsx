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
    <View className="bg-card border border-border rounded-2xl p-4 gap-2.5 shadow-2xs">
      <View className="flex-row items-center justify-between">
        <Badge
          label={`Q${String(questionIndex + 1).padStart(2, "0")}`}
          variant="purple"
        />
        <Badge label={questionTypeLabel} variant="outline" />
      </View>

      <Text className="text-base font-bold text-foreground leading-6">
        {questionText}
      </Text>
    </View>
  );
});
