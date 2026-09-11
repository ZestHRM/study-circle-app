import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { UI_STYLES } from "@/constants/styles";
import { useDashboardChartData } from "@/hooks/queries/use-dashboard";
import { type DashboardCheckInChartPoint } from "@/lib/api";
import { Feather } from "@expo/vector-icons";
import * as React from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

function getDateRange(days: number) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
  };
}

const RANGE_OPTIONS = [
  { value: "7d", label: "7 Days", days: 7 },
  { value: "30d", label: "30 Days", days: 30 },
  { value: "90d", label: "3 Months", days: 90 },
] as const;

export const TasksChartWidget = React.memo(function TasksChartWidget({
  onCheckIn,
}: {
  onCheckIn?: () => void;
}) {
  const [selectedRange, setSelectedRange] = React.useState<"7d" | "30d" | "90d">("7d");

  const selectedDays = React.useMemo(() => {
    switch (selectedRange) {
      case "90d":
        return 90;
      case "30d":
        return 30;
      case "7d":
      default:
        return 7;
    }
  }, [selectedRange]);

  const { startDate, endDate } = React.useMemo(() => getDateRange(selectedDays), [selectedDays]);
  const chartDataQuery = useDashboardChartData({ startDate, endDate });

  const error = chartDataQuery.isError
    ? chartDataQuery.error instanceof Error
      ? chartDataQuery.error.message
      : "Unable to load dashboard right now."
    : null;

  const chartData: DashboardCheckInChartPoint[] = chartDataQuery.data ?? [];
  const isLoading = chartDataQuery.isLoading;

  const { totalTasks, totalHours, daysWithCheckins, hasTrackedValues, checkInRate, avgTasks } =
    React.useMemo(() => {
      const tasks = chartData.reduce((sum, item) => sum + item.tasksCompleted, 0);
      const hours = chartData.reduce((sum, item) => sum + item.hoursStudied, 0);
      const days = chartData.filter((item) => item.hasCheckin).length;
      const tracked = tasks > 0 || hours > 0;
      const totalD = chartData.length;
      const rate = totalD > 0 ? Math.round((days / totalD) * 100) : 0;
      const avgT = days > 0 ? Number((tasks / days).toFixed(1)) : 0;
      return {
        totalTasks: tasks,
        totalHours: hours,
        daysWithCheckins: days,
        hasTrackedValues: tracked,
        checkInRate: rate,
        avgTasks: avgT,
      };
    }, [chartData]);

  const visibleChartData = chartData;

  const { barData, lineData, maxTasks, secondaryMaxValue, chartWidth } = React.useMemo(() => {
    const maxT = Math.max(...visibleChartData.map((item) => item.tasksCompleted), 1);
    const maxH = Math.max(...visibleChartData.map((item) => item.hoursStudied), 1);
    const labelStep = visibleChartData.length <= 10 ? 1 : visibleChartData.length <= 31 ? 5 : 10;

    const bData = visibleChartData.map((item, index) => {
      const labelDate = new Date(item.date);
      const shortLabel =
        selectedDays <= 7
          ? labelDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })
          : labelDate.toLocaleDateString(undefined, { day: "numeric" });
      return {
        value: item.tasksCompleted,
        frontColor: "#2563EB",
        labelWidth: selectedDays <= 7 ? 38 : 24,
        labelTextStyle: { color: "#78716C", fontSize: 10 },
        label: index % labelStep === 0 || index === visibleChartData.length - 1 ? shortLabel : "",
      };
    });

    const lData = visibleChartData.map((item) => ({ value: item.hoursStudied }));
    const secMax = Math.max(maxH, 1);
    const cWidth = Math.max(300, visibleChartData.length * 28 + 48);

    return {
      barData: bData,
      lineData: lData,
      maxTasks: maxT,
      secondaryMaxValue: secMax,
      chartWidth: cWidth,
    };
  }, [visibleChartData, selectedDays]);

  const handleCheckIn = React.useCallback(() => {
    if (onCheckIn) {
      onCheckIn();
    } else {
      Alert.alert("Check-in", "Check-in flow will be available in the mobile app soon.");
    }
  }, [onCheckIn]);

  return (
    <View className={UI_STYLES.cardPadded}>
      {/* Widget Header Row */}
      <View className={UI_STYLES.rowBetween}>
        <View className="flex-row items-center gap-3 flex-1 pr-2">
          <View className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 items-center justify-center border border-blue-200 dark:border-blue-900/60">
            <Feather name="bar-chart-2" size={18} color="#2563EB" />
          </View>
          <View className="flex-1">
            <Text variant="h3" className="text-base font-bold text-stone-900 dark:text-stone-100">
              Tasks vs Study Hours
            </Text>
            <Text variant="caption" className="text-[11px] text-stone-500 font-medium">
              Daily task completion & study time
            </Text>
          </View>
        </View>

        {/* Range Selection Pills */}
        <View className="flex-row items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl gap-0.5">
          {RANGE_OPTIONS.map((opt) => {
            const isActive = selectedRange === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setSelectedRange(opt.value)}
                className={`px-2.5 py-1 rounded-lg ${
                  isActive
                    ? "bg-blue-600 dark:bg-blue-500 shadow-2xs"
                    : "bg-transparent active:opacity-70"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isActive ? "text-white" : "text-stone-600 dark:text-stone-400"
                  }`}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Widget Body Content */}
      {isLoading ? (
        <Text variant="muted" className="py-10 text-center text-xs">
          Loading chart data...
        </Text>
      ) : null}

      {!isLoading && error ? (
        <Text variant="error" className="py-4 text-center text-xs">
          {error}
        </Text>
      ) : null}

      {!isLoading && !error && daysWithCheckins === 0 ? (
        <View className="items-center py-6 gap-3">
          <View className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 items-center justify-center border border-blue-100 dark:border-blue-900/60">
            <Feather name="check-square" size={24} color="#2563EB" />
          </View>
          <View className="items-center gap-1">
            <Text variant="h3" className="text-base font-bold text-center">
              No Study Data Yet
            </Text>
            <Text variant="muted" className="text-xs text-center px-4">
              Complete daily check-ins to track your tasks and study hours over time.
            </Text>
          </View>
          <Button
            size="sm"
            variant="quiz"
            title="Start Daily Check-in"
            icon="plus"
            onPress={handleCheckIn}
            className="mt-1 px-5 h-9 rounded-xl"
          />
        </View>
      ) : null}

      {!isLoading && !error && daysWithCheckins > 0 && !hasTrackedValues ? (
        <View className="items-center py-6 gap-2">
          <Text variant="h3" className="text-sm font-bold text-center">
            No tracked study hours yet
          </Text>
          <Text variant="muted" className="text-xs text-center px-4">
            Check-ins exist, but tasks and study hours were zero. Update your check-ins to plot data.
          </Text>
        </View>
      ) : null}

      {!isLoading && !error && daysWithCheckins > 0 && hasTrackedValues ? (
        <View className="gap-4">
          {/* Key Stats Bar */}
          <View className="flex-row items-center justify-between bg-stone-50 dark:bg-stone-950/60 p-3 rounded-2xl border border-stone-200/60 dark:border-stone-800">
            <View className="items-center flex-1">
              <Text variant="h2" className="text-lg font-black text-blue-600 dark:text-blue-400">
                {totalTasks}
              </Text>
              <Text variant="caption" className="text-[10px] font-semibold text-stone-500 uppercase">
                Tasks
              </Text>
            </View>
            <View className="w-px h-7 bg-stone-200 dark:bg-stone-800" />
            <View className="items-center flex-1">
              <Text variant="h2" className="text-lg font-black text-purple-600 dark:text-purple-400">
                {totalHours.toFixed(1)}h
              </Text>
              <Text variant="caption" className="text-[10px] font-semibold text-stone-500 uppercase">
                Hours
              </Text>
            </View>
            <View className="w-px h-7 bg-stone-200 dark:bg-stone-800" />
            <View className="items-center flex-1">
              <Text variant="h2" className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {avgTasks}
              </Text>
              <Text variant="caption" className="text-[10px] font-semibold text-stone-500 uppercase">
                Avg Tasks
              </Text>
            </View>
            <View className="w-px h-7 bg-stone-200 dark:bg-stone-800" />
            <View className="items-center flex-1">
              <Text variant="h2" className="text-lg font-black text-amber-600 dark:text-amber-400">
                {checkInRate}%
              </Text>
              <Text variant="caption" className="text-[10px] font-semibold text-stone-500 uppercase">
                Rate
              </Text>
            </View>
          </View>

          {/* Legend */}
          <View className="flex-row items-center justify-center gap-6">
            <View className="flex-row items-center gap-1.5">
              <View className="w-3 h-3 rounded bg-blue-600 dark:bg-blue-500" />
              <Text variant="caption" className="text-xs font-semibold">
                Tasks (Bars)
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-3 h-3 rounded-full bg-emerald-500" />
              <Text variant="caption" className="text-xs font-semibold">
                Hours (Line)
              </Text>
            </View>
          </View>

          {/* Chart Scroll Container */}
          <View className="bg-stone-50/50 dark:bg-stone-950/40 border border-stone-200/60 dark:border-stone-800/80 rounded-2xl p-2">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                width={chartWidth}
                data={barData}
                lineData={lineData}
                showLine
                lineConfig={{
                  isSecondary: true,
                  color: "#10B981",
                  thickness: 2.5,
                  curved: true,
                  dataPointsColor: "#10B981",
                  dataPointsRadius: 4,
                  hideDataPoints: false,
                }}
                secondaryYAxis={{
                  maxValue: secondaryMaxValue,
                  noOfSections: 4,
                  yAxisOffset: 0,
                  yAxisLabelWidth: 38,
                  yAxisTextStyle: { color: "#10B981", fontSize: 10, fontWeight: "600" },
                  yAxisColor: "transparent",
                  yAxisThickness: 0,
                  formatYLabel: (label: string) => {
                    const numeric = Number(label);
                    if (!Number.isFinite(numeric)) return "0h";
                    return `${numeric.toFixed(1).replace(/\.0$/, "")}h`;
                  },
                }}
                height={180}
                barWidth={14}
                spacing={16}
                initialSpacing={12}
                endSpacing={24}
                roundedTop
                hideRules={false}
                rulesColor="rgba(214,211,209,0.4)"
                rulesType="dashed"
                yAxisThickness={0}
                yAxisLabelWidth={28}
                xAxisThickness={1}
                xAxisColor="rgba(214,211,209,0.6)"
                yAxisTextStyle={{ color: "#78716C", fontSize: 10 }}
                xAxisLabelTextStyle={{ color: "#78716C", fontSize: 10 }}
                xAxisTextNumberOfLines={1}
                xAxisLabelsHeight={36}
                xAxisLabelsAtBottom
                noOfSections={4}
                maxValue={Math.max(maxTasks, 1)}
                formatYLabel={(label) => {
                  const numeric = Number(label);
                  if (!Number.isFinite(numeric)) return "0";
                  return maxTasks <= 2 ? numeric.toFixed(1).replace(/\.0$/, "") : `${Math.round(numeric)}`;
                }}
              />
            </ScrollView>
          </View>
        </View>
      ) : null}
    </View>
  );
});
