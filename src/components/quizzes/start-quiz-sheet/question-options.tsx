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
          ? "bg-primary/15 border-primary shadow-xs"
          : "bg-muted/50 border-border"
      )}
    >
      {/* Radio Circle */}
      <View
        className={cn(
          "w-6 h-6 rounded-full items-center justify-center border-2",
          isSelected
            ? "border-primary bg-primary"
            : "border-muted-foreground/40 bg-card"
        )}
      >
        {isSelected ? (
          <View className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />
        ) : null}
      </View>

      {/* Option Letter (A, B, C, D) in bold blue */}
      {!isTrueFalse && (
        <Text variant="subhead" className="font-extrabold text-primary w-4">
          {optionLetter}
        </Text>
      )}

      {/* Option Label Text */}
      <Text
        variant="subhead"
        className={cn(
          "flex-1 text-base",
          isSelected
            ? "text-foreground font-bold"
            : "text-foreground font-medium"
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
          className="min-h-[130px] p-3.5 text-sm rounded-2xl bg-card border-border text-foreground"
          textAlignVertical="top"
          placeholder="Type your answer here in detail..."
        />
        <Text className="text-xs text-muted-foreground self-end font-medium">
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </Text>
      </View>
    );
  }

  const renderedOptions = React.useMemo(() => {
    return type === "TRUE_FALSE"
      ? trueFalseOptions()
      : options.map((option) => ({ label: option, value: option }));
  }, [type, options]);

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
