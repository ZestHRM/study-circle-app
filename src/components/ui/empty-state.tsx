import { APP_COLORS } from "@/constants/colors";
import * as React from "react";
import { View } from "react-native";
import { Button } from "./button";
import { Icon } from "./icon";
import { Text } from "./text";

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?:
    | "terracotta"
    | "default"
    | "quiz"
    | "outline"
    | "secondary"
    | "ghost"
    | "destructive"
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
        <Icon name={icon} size={24} color={APP_COLORS.primary} />
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
