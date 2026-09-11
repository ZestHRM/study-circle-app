import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { View } from "react-native";

export interface QuizProgressHeaderProps {
  progressPercent: number;
  isPending: boolean;
  isSaved?: boolean;
  hasAnswer?: boolean;
}

export const QuizProgressHeader = React.memo(function QuizProgressHeader({
  progressPercent,
  isPending,
  isSaved,
  hasAnswer,
}: QuizProgressHeaderProps) {
  return (
    <View className="gap-2 pb-2">
      <View className="flex-row items-center justify-between">
        <Text variant="muted" className="text-xs font-semibold">
          Progress ({progressPercent}%)
        </Text>

        {isPending ? (
          <Badge icon="loader" label="Saving..." variant="amber" />
        ) : isSaved ? (
          <Badge icon="check-circle" label="Saved" variant="emerald" />
        ) : hasAnswer ? (
          <Badge icon="clock" label="Unsaved" variant="amber" />
        ) : (
          <Badge label="Pending" variant="outline" />
        )}
      </View>

      <ProgressBar value={progressPercent} variant="quiz" />
    </View>
  );
});
