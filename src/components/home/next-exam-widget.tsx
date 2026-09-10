import { ActionBannerWidget } from "@/components/ui/action-banner-widget";
import { Text } from "@/components/ui/text";
import { Feather } from "@expo/vector-icons";
import * as React from "react";
import { View } from "react-native";

export interface NextExamWidgetProps {
  examName?: string;
  examDate?: string;
  daysLeft?: number;
  className?: string;
}

export const NextExamWidget = React.memo(function NextExamWidget({
  examName = "JEE (Main)",
  examDate = "24 April 2026",
  daysLeft = 85,
  className = "",
}: NextExamWidgetProps) {
  return (
    <ActionBannerWidget
      icon={<Feather name="calendar" size={18} color="#2563EB" />}
      badgeText="NEXT EXAM"
      title={examName}
      subtitle={examDate}
      className={className}
      rightContent={
        <View className="items-center px-1">
          <Text className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
            {daysLeft}
          </Text>
          <Text
            variant="caption"
            className="text-stone-500 dark:text-stone-400 font-medium"
          >
            days left
          </Text>
        </View>
      }
    />
  );
});
