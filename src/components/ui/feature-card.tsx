import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { cn } from "@/lib/utils";
import * as React from "react";
import { View } from "react-native";

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
  onPress?: () => void;
  className?: string;
}

/**
 * Reusable FeatureCard component for AI study tools & dashboard action cards using Card primitive.
 */
export const FeatureCard = React.memo(function FeatureCard({
  title,
  countText,
  description,
  iconName,
  iconBgClass = "bg-primary/10 border border-primary/20",
  iconColor = "primary",
  badgeLabel,
  badgeIconName,
  badgeBgClass = "bg-warning/10 border border-warning/20",
  badgeTextColor = "text-amber-800 dark:text-amber-300",
  onPress,
  className,
}: FeatureCardProps) {
  return (
    <Card
      onPress={onPress}
      className={cn("flex-1 justify-between p-4 rounded-3xl", className)}
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
              <Icon name={badgeIconName} size={10} color="warning" />
            ) : null}
            <Text
              variant="caption"
              className={cn("font-black uppercase text-[10px]", badgeTextColor)}
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
        <Text variant="muted" className="mt-1 text-xs" numberOfLines={2}>
          {description}
        </Text>
      </View>

      {onPress ? (
        <View className="items-end mt-2">
          <Icon name="chevron-right" size={16} color="muted" />
        </View>
      ) : null}
    </Card>
  );
});
