import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { formatInputDate } from "@/lib/utils/formatters";
import React, { useState } from "react";
import { Platform, Pressable, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  hasError?: boolean;
  placeholder?: string;
  containerClassName?: string;
  clearable?: boolean;
}

export function DatePicker({
  value,
  onChange,
  minimumDate,
  maximumDate,
  hasError = false,
  placeholder,
  containerClassName,
  clearable = false,
}: DatePickerProps) {
  const resolvedPlaceholder = placeholder ?? "Select Date";
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View
      className={cn("flex-row items-center gap-2 w-full", containerClassName)}
    >
      <Pressable
        onPress={() => setIsVisible(true)}
        className={cn(
          "flex-1 border rounded-xl px-4 py-2.5 flex-row items-center justify-between bg-white dark:bg-stone-800 min-h-[44px]",
          hasError
            ? "border-red-500"
            : "border-stone-200 dark:border-stone-700 active:opacity-80",
        )}
      >
        <Text
          className={cn(
            "text-xs font-medium flex-1 pr-2",
            value
              ? "text-stone-900 dark:text-stone-100 font-bold"
              : "text-stone-500 dark:text-stone-400",
          )}
          numberOfLines={1}
        >
          {value ? formatInputDate(value.toISOString()) : resolvedPlaceholder}
        </Text>
        <Icon name="calendar" size={16} color="#9ca3af" />
      </Pressable>

      {clearable && value && (
        <Pressable
          onPress={() => onChange(null)}
          className="h-11 w-11 items-center justify-center border border-stone-200 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-800 active:opacity-70"
        >
          <Icon name="x" size={16} color="#9ca3af" />
        </Pressable>
      )}

      <DateTimePickerModal
        isVisible={isVisible}
        mode="date"
        date={value || new Date()}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        onConfirm={(date) => {
          setIsVisible(false);
          onChange(date);
        }}
        onCancel={() => setIsVisible(false)}
        display={Platform.OS === "ios" ? "inline" : "default"}
      />
    </View>
  );
}
