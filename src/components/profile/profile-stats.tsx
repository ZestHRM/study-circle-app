import { Card } from "@/components/ui/card";
import { Icon, type IconColorPreset } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { User } from "@/services";
import * as React from "react";
import { View } from "react-native";

export interface ProfileStatsProps {
  user: User | null;
}

interface StatItem {
  key: string;
  label: string;
  value: string;
  iconName: string;
  iconColor: IconColorPreset;
  cardBgClass: string;
  iconBgClass: string;
}

export const ProfileStats = React.memo(function ProfileStats({
  user,
}: ProfileStatsProps) {
  const stats = React.useMemo<StatItem[]>(
    () => [
      {
        key: "class",
        label: "Class / Standard",
        value: user?.classOrStandard || "Not specified",
        iconName: "award",
        iconColor: "primary",
        cardBgClass:
          "border-purple-200 dark:border-purple-900 bg-purple-50/60 dark:bg-purple-950/30",
        iconBgClass: "bg-purple-500/15",
      },
      {
        key: "institute",
        label: "Institute",
        value: user?.institute || "Study Circle",
        iconName: "shield",
        iconColor: "terracotta",
        cardBgClass:
          "border-orange-200 dark:border-orange-900 bg-orange-50/60 dark:bg-orange-950/30",
        iconBgClass: "bg-amber-500/15",
      },
      {
        key: "city",
        label: "City / Region",
        value: user?.city || "India",
        iconName: "map-pin",
        iconColor: "success",
        cardBgClass:
          "border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30",
        iconBgClass: "bg-emerald-500/15",
      },
    ],
    [user?.classOrStandard, user?.institute, user?.city],
  );

  return (
    <View className="flex-row gap-3">
      {stats.map((stat) => (
        <Card
          key={stat.key}
          className={`flex-1 p-3 items-center ${stat.cardBgClass}`}
        >
          <View
            className={`w-10 h-10 rounded-2xl items-center justify-center mb-1.5 ${stat.iconBgClass}`}
          >
            <Icon name={stat.iconName} size="md" color={stat.iconColor} />
          </View>
          <Text
            variant="caption"
            className="text-[10px] uppercase font-semibold"
          >
            {stat.label}
          </Text>
          <Text
            variant="subhead"
            className="mt-0.5 text-center"
            numberOfLines={1}
          >
            {stat.value}
          </Text>
        </Card>
      ))}
    </View>
  );
});
