import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { cn } from "@/lib/utils";
import * as React from "react";
import { Pressable, View } from "react-native";

export interface FeatureCardProps {
  title: string;
  countText?: string;
  description: string;
  iconName: string;
  iconBgClass?: string;
  iconColor?: string;
  badgeLabel?: string;
  badgeIconName?: string;
  badgeBgClass?: string;
  badgeTextColor?: string;
  onPress: () => void;
  className?: string;
}

/**
 * Reusable FeatureCard component for AI study tools & dashboard action cards.
 */
export const FeatureCard = React.memo(function FeatureCard({
  title,
  countText,
  description,
  iconName,
  iconBgClass = "bg-blue-50 dark:bg-blue-950/40",
  iconColor = APP_COLORS.quizBlue,
  badgeLabel,
  badgeIconName,
  badgeBgClass = "bg-amber-100 dark:bg-amber-900/50",
  badgeTextColor = "text-amber-800 dark:text-amber-300",
  onPress,
  className,
}: FeatureCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-1 bg-white dark:bg-stone-900 rounded-3xl p-4 border border-stone-200 dark:border-stone-800 shadow-sm justify-between active:opacity-80",
        className,
      )}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View
          className={cn(
            "w-9 h-9 rounded-xl items-center justify-center",
            iconBgClass,
          )}
        >
          <Icon name={iconName} size={18} color={iconColor} />
        </View>

        {badgeLabel ? (
          <View
            className={cn(
              "px-2 py-0.5 rounded-full flex-row items-center gap-1",
              badgeBgClass,
            )}
          >
            {badgeIconName ? (
              <Icon name={badgeIconName} size={10} color={APP_COLORS.warningDark} />
            ) : null}
            <Text
              variant="caption"
              className={cn("font-black uppercase", badgeTextColor)}
            >
              {badgeLabel}
            </Text>
          </View>
        ) : null}
      </View>

      <View>
        <Text variant="h4">{title}</Text>
        {countText ? (
          <Text variant="primary" className="text-xs mt-0.5">
            {countText}
          </Text>
        ) : null}
        <Text variant="muted" className="mt-1" numberOfLines={2}>
          {description}
        </Text>
      </View>

      <View className="items-end mt-2">
        <Icon name="chevron-right" size={16} color={APP_COLORS.stone400} />
      </View>
    </Pressable>
  );
});
