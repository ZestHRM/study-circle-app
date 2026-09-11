import { cn } from "@/lib/utils";
import * as React from "react";
import { View } from "react-native";

export type ProgressBarVariant = "primary" | "quiz" | "success" | "warning" | "default";

export interface ProgressBarProps {
  value: number; // 0 to 100 (or current step if max is supplied)
  max?: number; // Optional max scale (default 100)
  variant?: ProgressBarVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
  barClassName?: string;
}

const VARIANT_BAR_STYLES: Record<ProgressBarVariant, string> = {
  default: "bg-blue-600 dark:bg-blue-500",
  primary: "bg-blue-600 dark:bg-blue-500",
  quiz: "bg-sky-500 dark:bg-sky-400",
  success: "bg-emerald-500 dark:bg-emerald-400",
  warning: "bg-amber-500 dark:bg-amber-400",
};

const SIZE_CONTAINER_STYLES = {
  sm: "h-1",
  md: "h-1.5",
  lg: "h-2.5",
};

export function ProgressBar({
  value,
  max = 100,
  variant = "primary",
  size = "md",
  className,
  barClassName,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const barStyle = VARIANT_BAR_STYLES[variant] || VARIANT_BAR_STYLES.primary;
  const containerSize = SIZE_CONTAINER_STYLES[size] || SIZE_CONTAINER_STYLES.md;

  return (
    <View
      className={cn(
        "w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden",
        containerSize,
        className
      )}
    >
      <View
        className={cn("h-full rounded-full transition-all duration-300", barStyle, barClassName)}
        style={{ width: `${percentage}%` }}
      />
    </View>
  );
}
