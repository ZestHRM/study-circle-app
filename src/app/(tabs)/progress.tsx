import { StudyStreakWidget } from "@/components/progress/study-streak-widget";
import { TasksChartWidget } from "@/components/progress/tasks-chart-widget";
import { AppHeaderBar } from "@/components/ui/app-header-bar";
import { Card } from "@/components/ui/card";
import { HeroBanner } from "@/components/ui/hero-banner";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { useDashboardStreak } from "@/hooks/queries/use-dashboard";
import { useQuizzesInfiniteQuery } from "@/hooks/queries/use-quizzes";
import { useStudyMaterialsInfinite } from "@/hooks/queries/use-study-materials";
import { Feather } from "@expo/vector-icons";
import * as React from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  return (
    <SafeAreaView
      className="bg-stone-50 dark:bg-stone-950 flex-1"
      edges={["top"]}
    >
      <AppHeaderBar logoPosition="left" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 6,
          paddingBottom: 48,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={APP_COLORS.quizBlue}
          />
        }
      >
        <View className="mx-auto w-full max-w-md gap-4">
          <HeroBanner
            title="Study Analytics &\n"
            titleHighlight="Learning Progress 📈"
            subtitle="Track your daily study habits, quiz scores & course completion in real-time."
          />

          <View className="flex-row items-center gap-2.5">
            <Card className="flex-1 p-3.5 gap-2 border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20">
              <View className="flex-row items-center justify-between">
                <View className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 items-center justify-center">
                  <Feather name="trending-up" size={16} color="#2563EB" />
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

            <Card className="flex-1 p-3.5 gap-2 border border-orange-200/80 dark:border-orange-900/60 bg-orange-50/50 dark:bg-orange-950/20">
              <View className="flex-row items-center justify-between">
                <View className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/60 items-center justify-center">
                  <Feather name="zap" size={16} color="#EA580C" />
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
      </ScrollView>
    </SafeAreaView>
  );
}
