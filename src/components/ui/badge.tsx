import { APP_COLORS } from "@/constants/colors";
import * as React from "react";
import { View } from "react-native";
import { Icon, IconProps } from "./icon";
import { Text } from "./text";

export interface BadgeProps {
  label: string;
  icon?: IconProps["name"];
  iconSize?: number;
  variant?:
    | "default"
    | "orange"
    | "blue"
    | "green"
    | "emerald"
    | "amber"
    | "purple"
    | "destructive"
    | "outline";
  className?: string;
}

export const Badge = React.memo(function Badge({
  label,
  icon,
  iconSize = 12,
  variant = "default",
  className = "",
}: BadgeProps) {
  const getBadgeStyle = () => {
    switch (variant) {
      case "orange":
        return {
          container: "bg-orange-100 dark:bg-orange-950/60",
          text: "text-orange-700 dark:text-orange-300",
          iconColor: APP_COLORS.warningDark,
        };
      case "blue":
        return {
          container: "bg-blue-100 dark:bg-blue-950/60",
          text: "text-blue-700 dark:text-blue-300",
          iconColor: APP_COLORS.quizBlueHover,
        };
      case "green":
      case "emerald":
        return {
          container: "bg-emerald-100 dark:bg-emerald-950/60",
          text: "text-emerald-700 dark:text-emerald-300",
          iconColor: APP_COLORS.successDark,
        };
      case "amber":
        return {
          container: "bg-warning-bg",
          text: "text-warning-text",
          iconColor: APP_COLORS.warning,
        };
      case "purple":
        return {
          container: "bg-purple-100 dark:bg-purple-950/60",
          text: "text-purple-700 dark:text-purple-300",
          iconColor: APP_COLORS.purpleAccent,
        };
      case "destructive":
        return {
          container: "bg-error-bg",
          text: "text-error-text",
          iconColor: APP_COLORS.error,
        };
      case "outline":
        return {
          container: "border border-border",
          text: "text-muted-foreground",
          iconColor: APP_COLORS.stone500,
        };
      default:
        return {
          container: "bg-muted",
          text: "text-muted-foreground",
          iconColor: APP_COLORS.stone500,
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <View
      className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full ${style.container} ${className}`}
    >
      {icon ? (
        <Icon name={icon} size={iconSize} color={style.iconColor} />
      ) : null}
      <Text className={`text-xs font-medium ${style.text}`}>{label}</Text>
    </View>
  );
});
