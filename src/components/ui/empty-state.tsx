import * as React from "react";
import { View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Text } from "./text";
import { Button } from "./button";

export interface EmptyStateProps {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?:
    | "terracotta"
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
}

export const EmptyState = React.memo(function EmptyState({
  icon = "file-text",
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = "terracotta",
  className = "",
}: EmptyStateProps) {
  return (
    <View
      className={`bg-white dark:bg-stone-900 rounded-2xl p-7 items-center justify-center gap-3 border border-stone-200/80 dark:border-stone-800 shadow-xs my-2 ${className}`}
    >
      <View className="w-14 h-14 rounded-full bg-[#FEEAE3] dark:bg-stone-800 items-center justify-center">
        <Feather name={icon} size={24} color="#D95B38" />
      </View>
      <Text className="text-sm font-bold text-stone-900 dark:text-stone-100 text-center">
        {title}
      </Text>
      <Text className="text-xs text-stone-500 dark:text-stone-400 text-center leading-5 px-2">
        {description}
      </Text>
      {actionLabel && onAction && (
        <Button
          variant={actionVariant}
          icon="plus"
          title={actionLabel}
          onPress={onAction}
          className="mt-2 rounded-xl px-5 py-3"
        />
      )}
    </View>
  );
});
