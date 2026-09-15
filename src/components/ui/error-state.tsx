import { APP_COLORS } from "@/constants/colors";
import * as React from "react";
import { View } from "react-native";
import { Button } from "./button";
import { Icon } from "./icon";
import { Text } from "./text";

export interface ErrorStateProps {
  variant?: "destructive" | "warning" | "neutral";
  icon?: string;
  iconColor?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: string;
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
  fullScreen?: boolean;
  className?: string;
}

export const ErrorState = React.memo(function ErrorState({
  variant = "destructive",
  icon = "alert-triangle",
  iconColor,
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  actionVariant = "outline",
  fullScreen = true,
  className = "",
}: ErrorStateProps) {
  const variantStyles = React.useMemo(() => {
    switch (variant) {
      case "warning":
        return {
          iconBg: "bg-warning-bg",
          iconColor: iconColor ?? APP_COLORS.warning,
          titleText: "text-warning-text",
          cardBorder: "border-warning-border",
        };
      case "neutral":
        return {
          iconBg: "bg-muted",
          iconColor: iconColor ?? APP_COLORS.stone500,
          titleText: "text-foreground",
          cardBorder: "border-border",
        };
      case "destructive":
      default:
        return {
          iconBg: "bg-error-bg",
          iconColor: iconColor ?? APP_COLORS.error,
          titleText: "text-error-text",
          cardBorder: "border-error-border",
        };
    }
  }, [variant, iconColor]);

  if (fullScreen) {
    return (
      <View
        className={`flex-1 bg-background items-center justify-center px-8 gap-5 ${className}`}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <View
          className={`w-16 h-16 rounded-2xl items-center justify-center ${variantStyles.iconBg}`}
        >
          <Icon name={icon as any} size={28} color={variantStyles.iconColor} />
        </View>
        <View className="items-center gap-2">
          <Text
            variant="h3"
            className={`text-center font-extrabold ${variantStyles.titleText}`}
          >
            {title}
          </Text>
          {description ? (
            <Text variant="muted" className="text-center leading-6 font-medium">
              {description}
            </Text>
          ) : null}
        </View>
        {actionLabel && onAction ? (
          <Button
            variant={actionVariant}
            icon={actionIcon as any}
            title={actionLabel}
            onPress={onAction}
            className="mt-2 rounded-xl px-6 py-3"
          />
        ) : null}
      </View>
    );
  }

  return (
    <View
      className={`bg-card text-card-foreground rounded-2xl p-6 items-center justify-center gap-3 border ${variantStyles.cardBorder} shadow-xs my-2 ${className}`}
    >
      <View
        className={`w-12 h-12 rounded-xl items-center justify-center ${variantStyles.iconBg}`}
      >
        <Icon name={icon as any} size={24} color={variantStyles.iconColor} />
      </View>
      <Text
        className={`text-sm font-bold text-center ${variantStyles.titleText}`}
      >
        {title}
      </Text>
      {description ? (
        <Text className="text-xs text-muted-foreground text-center leading-5 px-2">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          variant={actionVariant}
          icon={actionIcon as any}
          title={actionLabel}
          onPress={onAction}
          className="mt-1 rounded-xl px-5 py-2.5"
        />
      ) : null}
    </View>
  );
});
