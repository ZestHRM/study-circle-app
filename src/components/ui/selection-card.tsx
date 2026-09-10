import { Icon, type IconColorPreset } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import * as React from "react";
import { Pressable, View } from "react-native";

export type SelectionCardVariant = "primary" | "purple" | "blue";

export interface SelectionCardFeature {
  text: string;
  icon?: string;
  iconColor?: IconColorPreset;
}

export interface SelectionCardProps {
  selected: boolean;
  onPress: () => void;
  title: string;
  subtitle?: string;
  icon: string;
  iconColor?: IconColorPreset;
  badge?: React.ReactNode;
  features?: Array<string | SelectionCardFeature>;
  className?: string;
  disabled?: boolean;
  variant?: SelectionCardVariant;
}

const CARD_VARIANT_STYLES = {
  primary: {
    cardSelected: "bg-blue-50/70 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500",
    iconContainerSelected: "bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800",
    radioBorderSelected: "border-blue-600 dark:border-blue-500 bg-blue-100 dark:bg-blue-900/40",
    radioDotSelected: "bg-blue-600 dark:bg-blue-500",
  },
  blue: {
    cardSelected: "bg-blue-50/70 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500",
    iconContainerSelected: "bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800",
    radioBorderSelected: "border-blue-600 dark:border-blue-500 bg-blue-100 dark:bg-blue-900/40",
    radioDotSelected: "bg-blue-600 dark:bg-blue-500",
  },
  purple: {
    cardSelected: "bg-purple-50/70 dark:bg-purple-950/40 border-purple-600 dark:border-purple-500",
    iconContainerSelected: "bg-purple-100 dark:bg-purple-900/40 border-purple-200 dark:border-purple-800",
    radioBorderSelected: "border-purple-600 dark:border-purple-500 bg-purple-100 dark:bg-purple-900/40",
    radioDotSelected: "bg-purple-600 dark:bg-purple-500",
  },
} as const;

export const SelectionCard = React.memo(function SelectionCard({
  selected,
  onPress,
  title,
  subtitle,
  icon,
  iconColor,
  badge,
  features,
  className = "",
  disabled = false,
  variant = "primary",
}: SelectionCardProps) {
  const styles = CARD_VARIANT_STYLES[variant] || CARD_VARIANT_STYLES.primary;
  const resolvedIconColor = iconColor || (selected ? "primary" : "dark");

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(
        "py-3 px-3.5 rounded-2xl border-2 gap-2.5 shadow-2xs active:opacity-90 transition-all",
        selected
          ? styles.cardSelected
          : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800",
        disabled && "opacity-50",
        className,
      )}
    >
      {/* Top Header Row */}
      <View className="flex-row items-center justify-between">
        {/* Left Side Icon + Title/Subtitle */}
        <View className="flex-row items-center gap-3 flex-1 pr-2">
          {/* Icon Badge Container */}
          <View
            className={cn(
              "w-9 h-9 rounded-xl items-center justify-center border",
              selected
                ? styles.iconContainerSelected
                : "bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700",
            )}
          >
            <Icon name={icon as any} size="sm" color={resolvedIconColor} />
          </View>

          {/* Title & Subtitle */}
          <View className="flex-1">
            <Text variant={selected ? "primary" : "h4"}>
              {title}
            </Text>
            {subtitle ? (
              <Text variant="muted" className="mt-0.5" numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Right Side: Optional Badge + Radio Indicator */}
        <View className="flex-row items-center gap-2">
          {badge ? badge : null}

          {/* Radio Indicator Circle */}
          <View
            className={cn(
              "w-5 h-5 rounded-full border-2 items-center justify-center",
              selected
                ? styles.radioBorderSelected
                : "border-stone-300 dark:border-stone-700 bg-transparent",
            )}
          >
            {selected ? (
              <View className={cn("w-2.5 h-2.5 rounded-full", styles.radioDotSelected)} />
            ) : null}
          </View>
        </View>
      </View>

      {/* Bottom Feature Bullet Points (Optional) */}
      {features && features.length > 0 ? (
        <View className="gap-1.5 pt-2 pl-1 border-t border-stone-200 dark:border-stone-800">
          {features.map((item, idx) => {
            const featureObj = typeof item === "string" ? { text: item } : item;
            const bulletIcon = featureObj.icon || "check";
            const bulletColor =
              featureObj.iconColor || (selected ? "primary" : "muted");

            return (
              <View key={idx} className="flex-row items-center gap-2">
                <Icon name={bulletIcon as any} size="xs" color={bulletColor} />
                <Text variant="caption" className="font-medium flex-1">
                  {featureObj.text}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </Pressable>
  );
});


