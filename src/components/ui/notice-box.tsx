import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import * as React from "react";
import { View } from "react-native";

export interface NoticeBoxProps {
  title?: string;
  message: string;
  variant?: "info" | "success" | "warning" | "error";
  icon?: string;
  className?: string;
}

export const NoticeBox = React.memo(function NoticeBox({
  title,
  message,
  variant = "info",
  icon,
  className,
}: NoticeBoxProps) {
  const defaultIcon =
    icon ||
    (variant === "success"
      ? "check-circle"
      : variant === "warning"
        ? "alert-triangle"
        : variant === "error"
          ? "alert-circle"
          : "info");

  const containerStyles = {
    info: "bg-purple-50/70 dark:bg-purple-950/30 border-purple-200/80 dark:border-purple-900/40",
    success: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    warning: "bg-warning-bg border-warning-border",
    error: "bg-error-bg border-error-border",
  }[variant];

  const iconBgStyles = {
    info: "bg-purple-600",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
  }[variant];

  const textColorStyles = {
    info: "text-purple-950 dark:text-purple-200",
    success: "text-emerald-950 dark:text-emerald-200",
    warning: "text-warning-text",
    error: "text-error-text",
  }[variant];

  return (
    <View
      className={cn(
        "border rounded-2xl p-3.5 flex-row items-center gap-3",
        containerStyles,
        className
      )}
    >
      <View
        className={cn(
          "w-8 h-8 rounded-full items-center justify-center",
          iconBgStyles
        )}
      >
        <Icon name={defaultIcon} size="sm" color="white" />
      </View>
      <View className="flex-1">
        {title ? (
          <Text className={cn("text-xs font-bold mb-0.5", textColorStyles)}>
            {title}
          </Text>
        ) : null}
        <Text className={cn("text-xs leading-4 font-medium", textColorStyles)}>
          {message}
        </Text>
      </View>
    </View>
  );
});
