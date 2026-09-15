import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import * as React from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

export interface ProgressCircleProps {
  /** Progress percentage (0 to 100) */
  percent: number;
  /** Size in pixels (width and height), defaults to 48 */
  size?: number;
  /** Stroke width of the ring in pixels, defaults to 5 */
  strokeWidth?: number;
  /** Primary ring stroke color, defaults to brand blue "#2563EB" */
  color?: string;
  /** Background track stroke color, defaults to "#E7E5E4" */
  trackColor?: string;
  /** Whether to show percentage text inside circle, defaults to true */
  showPercentage?: boolean;
  /** Custom label inside circle (overrides percentage display if provided) */
  centerText?: string;
  /** Tailwind class for center text */
  textClassName?: string;
  /** Additional container styling class */
  className?: string;
}

export const ProgressCircle = React.memo(function ProgressCircle({
  percent,
  size = 48,
  strokeWidth = 5,
  color = "#2563EB",
  trackColor = "#E7E5E4",
  showPercentage = true,
  centerText,
  textClassName,
  className,
}: ProgressCircleProps) {
  const normalizedPercent = Math.min(Math.max(percent, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (normalizedPercent / 100) * circumference;

  const label = centerText ?? `${Math.round(normalizedPercent)}%`;

  return (
    <View
      style={{ width: size, height: size }}
      className={cn("relative items-center justify-center", className)}
    >
      <Svg width={size} height={size} className="-rotate-90">
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
      {showPercentage || centerText ? (
        <View className="absolute items-center justify-center">
          <Text
            className={cn(
              "text-[11px] font-black text-stone-900 dark:text-stone-100",
              textClassName,
            )}
          >
            {label}
          </Text>
        </View>
      ) : null}
    </View>
  );
});
