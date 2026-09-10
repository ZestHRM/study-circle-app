import { Text } from "@/components/ui/text";
import * as React from "react";
import { View } from "react-native";

export interface ScreenFooterBadgeProps {
  stepNum: number;
  title: string;
  subtitle: string;
}

export const ScreenFooterBadge = React.memo(function ScreenFooterBadge({
  stepNum,
  title,
  subtitle,
}: ScreenFooterBadgeProps) {
  return (
    <View className="flex-row items-center justify-center gap-2.5 pt-3.5 border-t border-stone-200/70 dark:border-stone-800/70 mt-1 w-full">
      <View className="w-6 h-6 rounded-full bg-purple-600 items-center justify-center">
        <Text className="text-white text-xs font-bold">{stepNum}</Text>
      </View>
      <View className="flex-row items-center gap-1.5 flex-wrap justify-center">
        <Text variant="subhead">
          {title}
        </Text>
        <Text variant="caption">
          {subtitle}
        </Text>
      </View>
    </View>
  );
});
