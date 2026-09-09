import { APP_COLORS } from "@/constants/colors";
import * as React from "react";
import {
  ActivityIndicator,
  ActivityIndicatorProps,
  View,
  ViewStyle,
} from "react-native";
import { Text } from "./text";

export type SpinnerVariant =
  | "primary"
  | "terracotta"
  | "white"
  | "quiz"
  | "muted";

export interface SpinnerProps extends Omit<ActivityIndicatorProps, "color"> {
  /** Variant preset for spinner color (defaults to 'primary') */
  variant?: SpinnerVariant;
  /** Explicit hex color string override */
  color?: string;
  /** Optional loading text displayed under spinner */
  message?: string;
  /** Center inside flex container */
  center?: boolean;
  /** Occupy full screen with subtle overlay/background */
  fullScreen?: boolean;
  /** Additional container styling */
  containerStyle?: ViewStyle;
}

const VARIANT_COLOR_MAP: Record<SpinnerVariant, string> = {
  primary: APP_COLORS.primary,
  terracotta: APP_COLORS.terracotta,
  white: APP_COLORS.white,
  quiz: APP_COLORS.quizBlue,
  muted: APP_COLORS.grayMuted,
};

export const Spinner = React.memo(function Spinner({
  variant = "primary",
  size = "small",
  color,
  message,
  center = false,
  fullScreen = false,
  containerStyle,
  style,
  ...props
}: SpinnerProps) {
  const resolvedColor = color ?? VARIANT_COLOR_MAP[variant];

  const content = (
    <View
      className={`items-center justify-center gap-2 ${
        center ? "flex-1 justify-center items-center" : ""
      }`}
      style={containerStyle}
    >
      <ActivityIndicator
        size={size}
        color={resolvedColor}
        style={style}
        {...props}
      />
      {message ? (
        <Text variant="muted" className="text-xs text-stone-500 dark:text-stone-400 font-medium">
          {message}
        </Text>
      ) : null}
    </View>
  );

  if (fullScreen) {
    return (
      <View className="flex-1 justify-center items-center bg-white/80 dark:bg-stone-900/80 p-4">
        {content}
      </View>
    );
  }

  return content;
});
