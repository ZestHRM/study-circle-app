import { cn } from "@/lib/utils";
import * as React from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface WatermarkBackgroundProps {
  className?: string;
}

export function WatermarkBackground({ className }: WatermarkBackgroundProps) {
  return (
    <View
      className={cn(
        "absolute top-0 right-0 w-96 h-96 pointer-events-none z-0 overflow-hidden",
        className
      )}
    >
      <Svg height="100%" width="100%" viewBox="0 0 300 300">
        <Circle cx="200" cy="40" r="110" fill="#E0E7FF" opacity="0.65" />
        <Circle cx="250" cy="20" r="85" fill="#EEF2FF" opacity="0.75" />
        <Circle cx="240" cy="180" r="95" fill="#E6F4EA" opacity="0.8" />
      </Svg>
    </View>
  );
}
