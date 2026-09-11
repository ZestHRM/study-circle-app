import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { QuizQuestionType } from "@/services";
import { Feather } from "@expo/vector-icons";
import * as React from "react";
import { Pressable, View } from "react-native";

function trueFalseOptions() {
  return [
    { label: "True", value: "true" },
    { label: "False", value: "false" },
  ];
}

export interface OptionItemProps {
  label: string;
  value: string;
  isSelected: boolean;
  optionLetter: string;
  isTrueFalse: boolean;
  onSelect: (val: string) => void;
}

export const OptionItem = React.memo(function OptionItem({
  label,
  value,
  isSelected,
  optionLetter,
  isTrueFalse,
  onSelect,
}: OptionItemProps) {
  const handlePress = React.useCallback(() => {
    onSelect(value);
  }, [onSelect, value]);

  return (
    <Pressable
      onPress={handlePress}
      className={cn(
        "flex-row items-center gap-3.5 px-4 py-3.5 rounded-2xl border active:opacity-90",
        isSelected
          ? "bg-white dark:bg-stone-900 border-[#0066FF] shadow-xs"
          : "bg-white dark:bg-stone-900 border-blue-200/80 dark:border-stone-800"
      )}
    >
      {/* Radio Circle */}
      <View
        className={cn(
          "w-6 h-6 rounded-full items-center justify-center border-2",
          isSelected
            ? "border-[#0066FF] bg-[#0066FF]"
            : "border-slate-300 dark:border-stone-700 bg-white dark:bg-stone-900"
        )}
      >
        {isSelected ? (
          <View className="w-2.5 h-2.5 rounded-full bg-white" />
        ) : null}
      </View>

      {/* Option Letter (A, B, C, D) in bold blue */}
      {!isTrueFalse && (
        <Text variant="subhead" className="font-extrabold text-[#0066FF] w-4">
          {optionLetter}
        </Text>
      )}

      {/* Option Label Text */}
      <Text
        variant="subhead"
        className={cn(
          "flex-1 font-semibold text-base",
          isSelected
            ? "text-stone-900 dark:text-stone-100 font-bold"
            : "text-stone-800 dark:text-stone-200"
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
});

export interface QuestionOptionsProps {
  type: QuizQuestionType;
  options: string[];
  value: string;
  onChange: (next: string) => void;
}

export const QuestionOptions = React.memo(function QuestionOptions({
  type,
  options,
  value,
  onChange,
}: QuestionOptionsProps) {
  if (type === "SHORT_ANSWER") {
    const wordCount = value.trim().length > 0 ? value.trim().split(/\s+/).length : 0;
    return (
      <View className="gap-2">
        <Input
          value={value}
          onChangeText={onChange}
          multiline
          numberOfLines={6}
          className="min-h-[130px] p-3.5 text-sm rounded-2xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800"
          textAlignVertical="top"
          placeholder="Type your answer here in detail..."
        />
        <Text className="text-xs text-stone-400 dark:text-stone-500 self-end font-medium">
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </Text>
      </View>
    );
  }

  const renderedOptions =
    type === "TRUE_FALSE"
      ? trueFalseOptions()
      : options.map((option) => ({ label: option, value: option }));

  return (
    <View className="gap-3">
      {renderedOptions.map((option, idx) => (
        <OptionItem
          key={option.value}
          label={option.label}
          value={option.value}
          isSelected={value === option.value}
          optionLetter={String.fromCharCode(65 + idx)}
          isTrueFalse={type === "TRUE_FALSE"}
          onSelect={onChange}
        />
      ))}
    </View>
  );
});
