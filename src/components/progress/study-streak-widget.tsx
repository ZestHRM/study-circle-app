import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import {
  useDashboardRecentActivity,
  useDashboardStreak,
} from "@/hooks/queries/use-dashboard";
import type { DashboardRecentActivityItem, DashboardStreak } from "@/lib/api";
import { formatShortDate } from "@/lib/utils/formatters";
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
        }) || (currentStreak > 0 && i < currentStreak);

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
          label={currentStreak > 0 ? `${currentStreak} Days 🔥` : "Start Streak"}
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
            {/* Metric Cards Row */}
            <View className="flex-row items-center gap-3">
              {/* Current Streak Box */}
              <View className="flex-1 p-3.5 rounded-2xl bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/60 justify-between min-h-[84px]">
                <View className="flex-row items-center justify-between">
                  <Text variant="caption" className="font-bold text-orange-700 dark:text-orange-300">
                    Current Streak
                  </Text>
                  <Icon name="zap" size={14} color="warning" />
                </View>
                <Text variant="h1" className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">
                  {currentStreak} <Text className="text-xs font-bold text-orange-500">Days</Text>
                </Text>
              </View>

              {/* Best Streak Box */}
              <View className="flex-1 p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 justify-between min-h-[84px]">
                <View className="flex-row items-center justify-between">
                  <Text variant="caption" className="font-bold text-amber-700 dark:text-amber-300">
                    Personal Best
                  </Text>
                  <Icon name="award" size={14} color="warning" />
                </View>
                <Text variant="h1" className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {bestStreak} <Text className="text-xs font-bold text-amber-500">Days</Text>
                </Text>
              </View>
            </View>

            {/* 7-Day Visual Activity Tracker */}
            <View className="p-3 rounded-2xl bg-muted border border-border gap-2">
              <View className="flex-row items-center justify-between px-0.5">
                <Text variant="caption" className="text-xs font-bold text-foreground">
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
                        name={day.hasActivity ? "check" : day.isToday ? "zap" : "clock"}
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

            {/* Progress to Beat Best Streak */}
            {bestStreak > 0 ? (
              <View className="gap-1.5 px-0.5">
                <View className="flex-row items-center justify-between">
                  <Text variant="caption" className="text-xs font-semibold text-muted-foreground">
                    Goal to Beat Record
                  </Text>
                  <Text variant="subhead" className="text-xs font-bold">
                    {currentStreak} / {bestStreak} Days
                  </Text>
                </View>
                <ProgressBar
                  value={progressToBest}
                  variant={currentStreak >= bestStreak ? "success" : "warning"}
                  size="sm"
                />
              </View>
            ) : null}

            {/* Recent Activity List */}
            {recentActivity.length > 0 ? (
              <View className="gap-2 pt-1 border-t border-border">
                <Text variant="caption" className="text-xs font-bold text-foreground">
                  Recent Check-ins
                </Text>
                <View className="gap-1.5">
                  {recentActivity.slice(0, 3).map((act) => (
                    <View
                      key={act.id}
                      className="flex-row items-center justify-between px-3 py-2 rounded-xl bg-muted"
                    >
                      <View className="flex-row items-center gap-2">
                        <Icon name="check-circle" size={13} color="success" />
                        <Text variant="subhead" className="text-xs font-semibold">
                          {formatShortDate(act.date)}
                        </Text>
                      </View>
                      <Text variant="muted" className="text-[11px] capitalize">
                        {act.mood?.toLowerCase() ?? "Checked in"}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Motivational Banner */}
            <View className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <Text className="text-xs font-medium text-orange-700 dark:text-orange-300 text-center">
                {currentStreak >= bestStreak && bestStreak > 0
                  ? "🎉 Amazing! You've matched or broken your personal best streak!"
                  : currentStreak === 0
                  ? "💪 Complete a study session or quiz today to kickstart your new streak!"
                  : `🔥 Keep it up! Only ${bestStreak - currentStreak} more day${
                      bestStreak - currentStreak === 1 ? "" : "s"
                    } to beat your personal record!`}
              </Text>
            </View>
          </>
        )}
      </CardContent>
    </Card>
  );
});
