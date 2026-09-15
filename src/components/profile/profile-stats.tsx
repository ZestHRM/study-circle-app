import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { User } from "@/services";
import * as React from "react";
import { View } from "react-native";

export interface ProfileStatsProps {
  user: User | null;
}

export const ProfileStats = React.memo(function ProfileStats({
  user,
}: ProfileStatsProps) {
  return (
    <View className="flex-row gap-3">
      {/* Class / Standard Card */}
      <Card className="flex-1 p-3 items-center border-purple-200 dark:border-purple-900 bg-purple-50/60 dark:bg-purple-950/30">
        <View className="w-10 h-10 rounded-2xl bg-purple-500/15 items-center justify-center mb-1.5">
          <Icon name="award" size="md" color="primary" />
        </View>
        <Text variant="caption" className="text-[10px] uppercase font-semibold">
          Class / Standard
        </Text>
        <Text
          variant="subhead"
          className="mt-0.5 text-center"
          numberOfLines={1}
        >
          {user?.classOrStandard || "Not specified"}
        </Text>
      </Card>

      {/* Institute Card */}
      <Card className="flex-1 p-3 items-center border-orange-200 dark:border-orange-900 bg-orange-50/60 dark:bg-orange-950/30">
        <View className="w-10 h-10 rounded-2xl bg-amber-500/15 items-center justify-center mb-1.5">
          <Icon name="shield" size="md" color="terracotta" />
        </View>
        <Text variant="caption" className="text-[10px] uppercase font-semibold">
          Institute
        </Text>
        <Text
          variant="subhead"
          className="mt-0.5 text-center"
          numberOfLines={1}
        >
          {user?.institute || "Study Circle"}
        </Text>
      </Card>

      {/* City / Region Card */}
      <Card className="flex-1 p-3 items-center border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30">
        <View className="w-10 h-10 rounded-2xl bg-emerald-500/15 items-center justify-center mb-1.5">
          <Icon name="map-pin" size="md" color="success" />
        </View>
        <Text variant="caption" className="text-[10px] uppercase font-semibold">
          City / Region
        </Text>
        <Text
          variant="subhead"
          className="mt-0.5 text-center"
          numberOfLines={1}
        >
          {user?.city || "India"}
        </Text>
      </Card>
    </View>
  );
});
