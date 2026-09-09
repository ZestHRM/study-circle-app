import * as React from "react";
import { View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Button, ButtonProps } from "./button";
import { Text } from "./text";

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  welcomeText?: string;
  actionLabel?: string;
  actionIcon?: keyof typeof Feather.glyphMap;
  onAction?: () => void;
  actionVariant?: ButtonProps["variant"];
  extra?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const ScreenHeader = React.memo(function ScreenHeader({
  title,
  subtitle,
  welcomeText,
  actionLabel,
  actionIcon = "plus",
  onAction,
  actionVariant = "terracotta",
  extra,
  children,
  className = "",
}: ScreenHeaderProps) {
  return (
    <View className={`gap-3.5 pb-3 ${className}`}>
      {/* Top Header Row */}
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          {welcomeText ? (
            <Text variant="muted" className="text-xs font-medium mb-0.5">
              {welcomeText}
            </Text>
          ) : null}
          <Text variant="h1">{title}</Text>
          {subtitle ? (
            <Text variant="muted" className="text-xs mt-0.5">
              {subtitle}
            </Text>
          ) : null}
        </View>

        {actionLabel && onAction ? (
          <Button
            variant={actionVariant}
            icon={actionIcon}
            title={actionLabel}
            onPress={onAction}
            className="rounded-xl px-4 py-2.5"
          />
        ) : null}
      </View>

      {/* Extra Action / Row if provided */}
      {extra ? (
        <View className="flex-row items-center gap-3">{extra}</View>
      ) : null}

      {/* Children (e.g. Filters / Search bars / Section titles) */}
      {children}
    </View>
  );
});
