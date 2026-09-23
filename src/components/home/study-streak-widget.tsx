import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
  useDashboardRecentActivity,
  useDashboardStreak,
} from "@/hooks/queries/use-dashboard";
import type { DashboardRecentActivityItem, DashboardStreak } from "@/lib/api";
import * as React from "react";
import { View } from "react-native";

function getCurrentStreak(streak: DashboardStreak | null) {
  if (!streak || !streak.lastCheckinDate) {
    return 0;
  }

  const today = new Date();
  const lastCheckIn = new Date(streak.lastCheckinDate);
  const dayDifference = Math.floor(
    (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
      Date.UTC(
        lastCheckIn.getFullYear(),
        lastCheckIn.getMonth(),
        lastCheckIn.getDate(),
      )) /
      86400000,
  );

  return dayDifference > 1 ? 0 : streak.currentStreak;
}

export const StudyStreakWidget = React.memo(function StudyStreakWidget() {
  const streakQuery = useDashboardStreak();
  const recentActivityQuery = useDashboardRecentActivity();

  const isLoading = streakQuery.isLoading || recentActivityQuery.isLoading;
  const streak: DashboardStreak | null = streakQuery.data ?? null;
  const currentStreak = getCurrentStreak(streak);
  const bestStreak = streak?.bestStreak ?? 0;
  const recentActivity: DashboardRecentActivityItem[] =
    recentActivityQuery.data ?? [];
  const progressToBest =
    bestStreak > 0 ? Math.min((currentStreak / bestStreak) * 100, 100) : 0;

  // 7-day visual tracker
  const last7Days = React.useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString(undefined, { weekday: "short" });

      const hasActivity =
        recentActivity.some((a) => {
          if (!a.date) return false;
          return new Date(a.date).toISOString().split("T")[0] === dateStr;
        }) ||
        (currentStreak > 0 && i < currentStreak);

      days.push({
        dayLabel: dayLabel.slice(0, 3),
        isToday: i === 0,
        hasActivity,
      });
    }
    return days;
  }, [recentActivity, currentStreak]);

  return (
    <Card className="p-4 gap-4 shadow-2xs">
      {/* Header */}
      <CardHeader className="p-0 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 items-center justify-center">
            <Icon name="zap" size={18} color="warning" />
          </View>
          <CardTitle className="text-lg font-extrabold">Study Streak</CardTitle>
        </View>
        <Badge
          label={
            currentStreak > 0 ? `${currentStreak} Days 🔥` : "Start Streak"
          }
          variant={currentStreak > 0 ? "amber" : "default"}
        />
      </CardHeader>

      <CardContent className="p-0 gap-4">
        {isLoading ? (
          <View className="py-6 items-center">
            <Text variant="muted" className="text-xs">
              Loading streak stats...
            </Text>
          </View>
        ) : (
          <>
            {/* 7-Day Visual Activity Tracker */}
            <View className="p-3 rounded-2xl bg-muted border border-border gap-2">
              <View className="flex-row items-center justify-between px-0.5">
                <Text
                  variant="caption"
                  className="text-xs font-bold text-foreground"
                >
                  Last 7 Days Activity
                </Text>
                <Text variant="muted" className="text-[11px]">
                  {currentStreak > 0 ? "Streak Active" : "No Active Streak"}
                </Text>
              </View>

              <View className="flex-row items-center justify-between pt-1">
                {last7Days.map((day, index) => (
                  <View key={index} className="items-center gap-1.5 flex-1">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${
                        day.hasActivity
                          ? "bg-orange-500 dark:bg-orange-600 shadow-2xs"
                          : day.isToday
                            ? "bg-orange-100 dark:bg-orange-950/80 border-2 border-orange-500"
                            : "bg-muted"
                      }`}
                    >
                      <Icon
                        name={
                          day.hasActivity
                            ? "check"
                            : day.isToday
                              ? "zap"
                              : "clock"
                        }
                        size={14}
                        color={
                          day.hasActivity
                            ? "white"
                            : day.isToday
                              ? "warning"
                              : "muted"
                        }
                      />
                    </View>
                    <Text
                      className={`text-[10px] font-bold ${
                        day.isToday
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {day.dayLabel}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </CardContent>
    </Card>
  );
});
