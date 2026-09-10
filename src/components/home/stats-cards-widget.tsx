import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useDashboardCounts } from "@/hooks/queries/use-dashboard";
import * as React from "react";
import { View } from "react-native";

export type StatCardItem = {
  id: string;
  title: string;
  value: number;
  icon: string;
  iconBg: string;
  iconColor: string;
};

export function StatsCardsWidget() {
  const {
    studyMaterialsCount,
    examMaterialsCount,
    quizzesCount,
    studyCirclesCount,
    isLoading,
  } = useDashboardCounts();

  const cards: StatCardItem[] = [
    {
      id: "study-materials",
      title: "Study Materials",
      value: studyMaterialsCount,
      icon: "file-text",
      iconBg: "bg-blue-100 dark:bg-blue-950/60",
      iconColor: "#2563EB",
    },
    {
      id: "exam-materials",
      title: "PYQ Papers",
      value: examMaterialsCount,
      icon: "clipboard",
      iconBg: "bg-amber-100 dark:bg-amber-950/60",
      iconColor: "#D97706",
    },
    {
      id: "quizzes",
      title: "Quizzes",
      value: quizzesCount,
      icon: "award",
      iconBg: "bg-purple-100 dark:bg-purple-950/60",
      iconColor: "#7C3AED",
    },
    {
      id: "study-circles",
      title: "Study Circles",
      value: studyCirclesCount,
      icon: "users",
      iconBg: "bg-emerald-100 dark:bg-emerald-950/60",
      iconColor: "#059669",
    },
  ];

  return (
    <View className="gap-3 pt-2">
      <Text variant="h2" className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
        Overview
      </Text>

      <View className="flex-row flex-wrap -mx-1">
        {cards.map((card) => (
          <View key={card.id} className="w-1/2 p-1">
            <View className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-4 rounded-2xl gap-3 shadow-2xs">
              <View className="flex-row items-center justify-between">
                <View className={`w-9 h-9 rounded-xl items-center justify-center ${card.iconBg}`}>
                  <Icon name={card.icon as any} size="sm" color="dark" />
                </View>
                <Text variant="h1" className="text-2xl font-black">
                  {isLoading ? "-" : card.value}
                </Text>
              </View>

              <Text variant="muted" className="text-xs font-semibold" numberOfLines={1}>
                {card.title}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

