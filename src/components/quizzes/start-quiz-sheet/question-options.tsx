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
        "flex-row items-center gap-3.5 p-3.5 rounded-2xl border active:opacity-90",
        isSelected
          ? "bg-purple-50 dark:bg-purple-950/40 border-purple-500 dark:border-purple-600 shadow-2xs"
          : "bg-white dark:bg-stone-900 border-stone-200/90 dark:border-stone-800"
      )}
    >
      <View
        className={cn(
          "w-7 h-7 rounded-full items-center justify-center border",
          isSelected
            ? "bg-purple-600 border-purple-600"
            : "bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700"
        )}
      >
        {isSelected ? (
          <Feather name="check" size={14} color="#ffffff" />
        ) : (
          <Text className="text-xs font-bold text-stone-500 dark:text-stone-400">
            {isTrueFalse ? "" : optionLetter}
          </Text>
        )}
      </View>

      <Text
        className={cn(
          "flex-1 text-sm font-medium leading-5",
          isSelected
            ? "text-purple-950 dark:text-purple-100 font-semibold"
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
