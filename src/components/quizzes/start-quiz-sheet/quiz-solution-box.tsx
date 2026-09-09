import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import * as React from "react";
import { View } from "react-native";

export interface QuizSolutionBoxProps {
  answer?: string | null;
  explanation?: string | null;
}

export const QuizSolutionBox = React.memo(function QuizSolutionBox({
  answer,
  explanation,
}: QuizSolutionBoxProps) {
  return (
    <View className="bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 rounded-2xl p-4 gap-1.5 mt-1">
      <View className="flex-row items-center gap-2">
        <Feather name="check-circle" size={15} color={APP_COLORS.primary} />
        <Text className="text-sm font-bold text-purple-950 dark:text-purple-200">
          Correct Answer: {answer ?? "N/A"}
        </Text>
      </View>

      <Text className="text-xs text-stone-600 dark:text-stone-300 leading-5 pt-0.5">
        <Text className="font-semibold">Explanation: </Text>
        {explanation || "No explanation provided."}
      </Text>
    </View>
  );
});
