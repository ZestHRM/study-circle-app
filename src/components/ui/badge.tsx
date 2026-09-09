import * as React from "react";
import { View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Text } from "./text";

export interface BadgeProps {
  label: string;
  icon?: keyof typeof Feather.glyphMap;
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
          iconColor: "#c2410c",
        };
      case "blue":
        return {
          container: "bg-blue-100 dark:bg-blue-950/60",
          text: "text-blue-700 dark:text-blue-300",
          iconColor: "#1d4ed8",
        };
      case "green":
      case "emerald":
        return {
          container: "bg-emerald-100 dark:bg-emerald-950/60",
          text: "text-emerald-700 dark:text-emerald-300",
          iconColor: "#047857",
        };
      case "amber":
        return {
          container: "bg-amber-100 dark:bg-amber-950/60",
          text: "text-amber-700 dark:text-amber-300",
          iconColor: "#b45309",
        };
      case "purple":
        return {
          container: "bg-purple-100 dark:bg-purple-950/60",
          text: "text-purple-700 dark:text-purple-300",
          iconColor: "#6b21a8",
        };
      case "destructive":
        return {
          container: "bg-red-100 dark:bg-red-950/60",
          text: "text-red-700 dark:text-red-300",
          iconColor: "#b91c1c",
        };
      case "outline":
        return {
          container: "border border-stone-200 dark:border-stone-800",
          text: "text-stone-700 dark:text-stone-300",
          iconColor: "#78716c",
        };
      default:
        return {
          container: "bg-stone-100 dark:bg-stone-800",
          text: "text-stone-500 dark:text-stone-400",
          iconColor: "#a8a29e",
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <View
      className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full ${style.container} ${className}`}
    >
      {icon ? (
        <Feather name={icon} size={iconSize} color={style.iconColor} />
      ) : null}
      <Text className={`text-xs font-medium ${style.text}`}>{label}</Text>
    </View>
  );
});
