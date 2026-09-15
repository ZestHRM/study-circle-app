import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import {
  useDashboardChartData,
  useDashboardStreak,
} from "@/hooks/queries/use-dashboard";
import { formatHours } from "@/lib/utils/formatters";
import * as React from "react";
import { View } from "react-native";

function getPast7DaysRange() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 7);

  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
  };
}

export const StatsCardsWidget = React.memo(function StatsCardsWidget() {
  const { startDate, endDate } = React.useMemo(() => getPast7DaysRange(), []);
  const streakQuery = useDashboardStreak();
  const chartQuery = useDashboardChartData({ startDate, endDate });

  const streakDays =
    (streakQuery.data as any)?.currentStreak ??
    (streakQuery.data as any)?.streakDays ??
    0;

  const { formattedHours, totalTasks } = React.useMemo(() => {
    const points = chartQuery.data ?? [];
    let sumHours = 0;
    let sumTasks = 0;

    for (const pt of points) {
      sumHours += pt.hoursStudied ?? 0;
      sumTasks += pt.tasksCompleted ?? 0;
    }

    return {
      formattedHours: formatHours(sumHours),
      totalTasks: sumTasks,
    };
  }, [chartQuery.data]);

  return (
    <Card className="rounded-3xl p-4">
      <Text variant="h3" className="text-base font-bold mb-3.5">
        This week
      </Text>

      <View className="flex-row items-center justify-between">
        {/* Col 1: Hours Studied */}
        <View className="flex-row items-center gap-2 flex-1 min-w-0 pr-1">
          <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center border border-primary/20 shrink-0">
            <Icon name="clock" size={16} color="primary" />
          </View>
          <View className="flex-1 min-w-0">
            <Text variant="h2" className="text-sm font-black leading-tight" numberOfLines={1}>
              {formattedHours}
            </Text>
            <Text variant="muted" className="text-[10px] font-medium leading-tight text-muted-foreground" numberOfLines={1}>
              studied
            </Text>
          </View>
        </View>

        {/* Divider 1 */}
        <View className="w-px h-8 bg-border mx-1 shrink-0" />

        {/* Col 2: Tasks Completed */}
        <View className="flex-row items-center gap-2 flex-1 min-w-0 px-0.5">
          <View className="w-9 h-9 rounded-full bg-emerald-500 items-center justify-center shadow-2xs shrink-0">
            <Icon name="check" size={16} color="white" />
          </View>
          <View className="flex-1 min-w-0">
            <Text variant="h2" className="text-sm font-black leading-tight" numberOfLines={1}>
              {totalTasks}
            </Text>
            <Text variant="muted" className="text-[10px] font-medium leading-tight text-muted-foreground" numberOfLines={2}>
              tasks done
            </Text>
          </View>
        </View>

        {/* Divider 2 */}
        <View className="w-px h-8 bg-border mx-1 shrink-0" />

        {/* Col 3: Streak */}
        <View className="flex-row items-center gap-2 flex-1 min-w-0 pl-1">
          <View className="w-9 h-9 rounded-full bg-warning/10 items-center justify-center border border-warning/20 shrink-0">
            <Icon name="zap" size={16} color="warning" />
          </View>
          <View className="flex-1 min-w-0">
            <Text variant="h2" className="text-sm font-black leading-tight" numberOfLines={1}>
              {streakDays} {streakDays === 1 ? "day" : "days"}
            </Text>
            <Text variant="muted" className="text-[10px] font-medium leading-tight text-muted-foreground" numberOfLines={1}>
              streak
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
});
