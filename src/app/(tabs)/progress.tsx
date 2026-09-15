import { StudyStreakWidget } from "@/components/progress/study-streak-widget";
import { TasksChartWidget } from "@/components/progress/tasks-chart-widget";
import { AppHeaderBar } from "@/components/ui/app-header-bar";
import { AppScreen } from "@/components/ui/app-screen";
import { Card } from "@/components/ui/card";
import { HeroBanner } from "@/components/ui/hero-banner";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { useDashboardStreak } from "@/hooks/queries/use-dashboard";
import { useQuizzesInfiniteQuery } from "@/hooks/queries/use-quizzes";
import { useStudyMaterialsInfinite } from "@/hooks/queries/use-study-materials";
import * as React from "react";
import { RefreshControl, View } from "react-native";

export default function ProgressScreen() {
  const { materials, refetch: refetchMaterials } = useStudyMaterialsInfinite({
    limit: 200,
  });
  const { quizzes, refetch: refetchQuizzes } = useQuizzesInfiniteQuery({
    limit: 200,
  });
  const { data: streak, refetch: refetchStreak } = useDashboardStreak();

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([refetchMaterials(), refetchQuizzes(), refetchStreak()]);
    setIsRefreshing(false);
  }, [refetchMaterials, refetchQuizzes, refetchStreak]);

  const currentStreak = streak?.currentStreak ?? 0;

  const overallAccuracy = React.useMemo(() => {
    const totalMaterials = materials.length;
    const totalQuizzes = quizzes.length;
    if (totalMaterials === 0 && totalQuizzes === 0) return 0;
    return Math.min(
      96,
      Math.max(
        40,
        Math.round(
          ((totalQuizzes + 1) / (totalMaterials + totalQuizzes + 1)) * 100,
        ),
      ),
    );
  }, [materials.length, quizzes.length]);

  const refreshControlElement = React.useMemo(
    () => (
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        tintColor={APP_COLORS.quizBlue}
      />
    ),
    [isRefreshing, handleRefresh],
  );

  return (
    <AppScreen
      header={<AppHeaderBar logoPosition="left" />}
      scrollable={true}
      refreshControl={refreshControlElement}
      contentContainerStyle={{
        paddingHorizontal: 18,
        paddingTop: 6,
        paddingBottom: 48,
      }}
    >
      <View className="mx-auto w-full max-w-md gap-4">
        <HeroBanner
          title="Study Analytics &\n"
          titleHighlight="Learning Progress 📈"
          subtitle="Track your daily study habits, quiz scores & course completion in real-time."
        />

        <View className="flex-row items-center gap-2.5">
          <Card className="flex-1 p-3.5 gap-2 border border-primary/20 bg-primary/10">
            <View className="flex-row items-center justify-between">
              <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                <Icon name="trending-up" size={16} color="primary" />
              </View>
              <Text
                variant="h1"
                className="text-xl font-extrabold text-blue-600 dark:text-blue-400"
              >
                {overallAccuracy}%
              </Text>
            </View>
            <Text
              variant="caption"
              className="text-stone-600 dark:text-stone-300 font-semibold text-xs"
            >
              Completion Rate
            </Text>
          </Card>

          <Card className="flex-1 p-3.5 gap-2 border border-warning/20 bg-warning/10">
            <View className="flex-row items-center justify-between">
              <View className="w-8 h-8 rounded-xl bg-warning/10 items-center justify-center">
                <Icon name="zap" size={16} color="warning" />
              </View>
              <Text
                variant="h1"
                className="text-xl font-extrabold text-orange-600 dark:text-orange-400"
              >
                {currentStreak}d
              </Text>
            </View>
            <Text
              variant="caption"
              className="text-stone-600 dark:text-stone-300 font-semibold text-xs"
            >
              Current Streak
            </Text>
          </Card>
        </View>

        <TasksChartWidget />
        <StudyStreakWidget />
      </View>
    </AppScreen>
  );
}
