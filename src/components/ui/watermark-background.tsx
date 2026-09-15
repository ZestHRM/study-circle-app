import { cn } from "@/lib/utils";
import { useThemePreference } from "@/lib/theme-preference";
import * as React from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface WatermarkBackgroundProps {
  className?: string;
}

export function WatermarkBackground({ className }: WatermarkBackgroundProps) {
  const { isDark } = useThemePreference();
  return (
    <View
      className={cn(
        "absolute top-0 right-0 w-96 h-96 pointer-events-none z-0 overflow-hidden",
        className
      )}
    >
      <Svg height="100%" width="100%" viewBox="0 0 300 300">
        <Circle cx="200" cy="40" r="110" fill={isDark ? "#172554" : "#E0E7FF"} opacity={isDark ? 0.45 : 0.65} />
        <Circle cx="250" cy="20" r="85" fill={isDark ? "#1E1B4B" : "#EEF2FF"} opacity={isDark ? 0.5 : 0.75} />
        <Circle cx="240" cy="180" r="95" fill={isDark ? "#052E16" : "#E6F4EA"} opacity={isDark ? 0.45 : 0.8} />
      </Svg>
    </View>
  );
}
