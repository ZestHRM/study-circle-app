import { Button } from "@/components/ui/button";
import * as React from "react";
import { View } from "react-native";

export interface QuizAttemptControlsProps {
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  isShowingSolution: boolean;
  isSavePending: boolean;
  hasAnswer: boolean;
  onPrevious: () => void;
  onToggleSolution: () => void;
  onNext: () => void;
}

export const QuizAttemptControls = React.memo(function QuizAttemptControls({
  isFirstQuestion,
  isLastQuestion,
  isShowingSolution,
  isSavePending,
  hasAnswer,
  onPrevious,
  onToggleSolution,
  onNext,
}: QuizAttemptControlsProps) {
  return (
    <View className="gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
      <View className="flex-row items-center gap-2">
        <Button
          variant="outline"
          icon="chevron-left"
          title="Previous"
          onPress={onPrevious}
          disabled={isFirstQuestion || isSavePending}
          className="flex-1 h-11 rounded-xl justify-center items-center"
        />

        <Button
          variant="outline"
          icon={isShowingSolution ? "eye-off" : "eye"}
          title={isShowingSolution ? "Hide Answer" : "Show Answer"}
          onPress={onToggleSolution}
          className="flex-1 h-11 rounded-xl justify-center items-center"
        />
      </View>

      <Button
        variant="quiz"
        icon={isLastQuestion ? "check" : "chevron-right"}
        iconSize={16}
        title={isLastQuestion ? "Submit Quiz" : "Next Question"}
        loading={isSavePending}
        onPress={onNext}
        disabled={!hasAnswer || isSavePending}
        className="w-full h-12 rounded-xl justify-center items-center"
      />
    </View>
  );
});
