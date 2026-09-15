import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import * as React from "react";
import { Pressable, View } from "react-native";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Reusable SectionHeader Component.
 * Standardizes section headers across Home, Materials, Subjects, Progress, and Detail screens.
 */
export const SectionHeader = React.memo(function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  className = "mb-3",
}: SectionHeaderProps) {
  return (
    <View className={`flex-row items-center justify-between ${className}`}>
      <View className="flex-1 pr-2">
        <Text variant="h2" className="text-lg font-black tracking-tight text-stone-900 dark:text-stone-100">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="muted" className="text-xs mt-0.5" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {actionLabel && onAction ? (
        <Pressable onPress={onAction} className="flex-row items-center gap-1 active:opacity-70">
          <Text className="text-xs font-bold text-blue-600 dark:text-blue-400">
            {actionLabel}
          </Text>
          <Icon name="chevron-right" size={14} color={APP_COLORS.quizBlue} />
        </Pressable>
      ) : null}
    </View>
  );
});
