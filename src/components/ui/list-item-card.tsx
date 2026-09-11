import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { cn } from "@/lib/utils";
import * as React from "react";
import { Pressable, View } from "react-native";

export interface ListItemCardProps {
  title: string;
  subtitle: string;
  iconName: string;
  iconBgClass?: string;
  iconColor?: string;
  onPress?: () => void;
  className?: string;
}

/**
 * Reusable horizontal row card for materials, quizzes, and list items.
 */
export const ListItemCard = React.memo(function ListItemCard({
  title,
  subtitle,
  iconName,
  iconBgClass = "bg-blue-50 dark:bg-blue-950/40",
  iconColor = APP_COLORS.quizBlue,
  onPress,
  className,
}: ListItemCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "bg-white dark:bg-stone-900 rounded-2xl p-4 flex-row items-center justify-between border border-stone-200 dark:border-stone-800 shadow-sm active:opacity-80",
        className,
      )}
    >
      <View className="flex-row items-center gap-3 flex-1 pr-2">
        <View
          className={cn(
            "w-10 h-10 rounded-xl items-center justify-center",
            iconBgClass,
          )}
        >
          <Icon name={iconName} size={18} color={iconColor} />
        </View>

        <View className="flex-1">
          <Text variant="h4" numberOfLines={1}>
            {title}
          </Text>
          <Text variant="muted" className="mt-0.5" numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>

      <Icon name="chevron-right" size={18} color={APP_COLORS.stone400} />
    </Pressable>
  );
});
