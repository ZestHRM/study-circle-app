import { StudyStreakWidget } from "@/components/home/study-streak-widget";
import { TasksChartWidget } from "@/components/home/tasks-chart-widget";
import { AppHeaderBar } from "@/components/ui/app-header-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroBanner } from "@/components/ui/hero-banner";
import { Icon } from "@/components/ui/icon";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import {
  useDashboardCounts,
  useDashboardStreak,
} from "@/hooks/queries/use-dashboard";
import { useNotesInfiniteQuery } from "@/hooks/queries/use-notes";
import { useQuizzesInfiniteQuery } from "@/hooks/queries/use-quizzes";
import { useStudyMaterialsInfinite } from "@/hooks/queries/use-study-materials";
import { useSubjectsQuery } from "@/hooks/queries/use-subjects";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as React from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SUBJECT_PROGRESS_COLORS = [
  { text: "text-blue-600 dark:text-blue-400", bar: "bg-blue-600 dark:bg-blue-500", bg: "bg-blue-100 dark:bg-blue-950/60", defaultPct: 75 },
  { text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-600 dark:bg-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-950/60", defaultPct: 62 },
  { text: "text-purple-600 dark:text-purple-400", bar: "bg-purple-600 dark:bg-purple-500", bg: "bg-purple-100 dark:bg-purple-950/60", defaultPct: 48 },
  { text: "text-amber-600 dark:text-amber-400", bar: "bg-amber-600 dark:bg-amber-500", bg: "bg-amber-100 dark:bg-amber-950/60", defaultPct: 84 },
];

export default function ProgressScreen() {
  const {
    subjects,
    isLoading: isLoadingSubjects,
    refetch: refetchSubjects,
  } = useSubjectsQuery();

  const { materials, refetch: refetchMaterials } = useStudyMaterialsInfinite({ limit: 200 });
  const { notes, refetch: refetchNotes } = useNotesInfiniteQuery({ limit: 200 });
  const { quizzes, refetch: refetchQuizzes } = useQuizzesInfiniteQuery({ limit: 200 });
  const { data: streak, refetch: refetchStreak } = useDashboardStreak();

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchSubjects(),
      refetchMaterials(),
      refetchNotes(),
      refetchQuizzes(),
      refetchStreak(),
    ]);
    setIsRefreshing(false);
  }, [refetchSubjects, refetchMaterials, refetchNotes, refetchQuizzes, refetchStreak]);

  const currentStreak = streak?.currentStreak ?? 0;

  // Calculate subject-wise completion metrics
  const subjectProgressList = React.useMemo(() => {
    if (!subjects || subjects.length === 0) return [];

    return subjects.map((subj, idx) => {
      const sId = String(subj.id);
      const style = SUBJECT_PROGRESS_COLORS[idx % SUBJECT_PROGRESS_COLORS.length];

      const subjMaterials = materials.filter(
        (m) => String(m.subjectId) === sId || String(m.subject?.id) === sId,
      );
      const subjQuizzes = quizzes.filter(
        (q) => String(q.subjectId) === sId || String(q.subject?.id) === sId,
      );
      const subjNotes = notes.filter(
        (n) => String(n.subjectId) === sId || String(n.subject?.id) === sId,
      );

      const totalItems = subjMaterials.length + subjQuizzes.length + subjNotes.length;
      const calculatedPct = totalItems > 0 ? Math.min(100, Math.max(30, totalItems * 18)) : style.defaultPct;

      return {
        id: subj.id,
        name: subj.name,
        materialsCount: subjMaterials.length,
        quizzesCount: subjQuizzes.length,
        notesCount: subjNotes.length,
        progressPercent: calculatedPct,
        style,
      };
    });
  }, [subjects, materials, quizzes, notes]);

  const overallAccuracy = React.useMemo(() => {
    const totalMaterials = materials.length;
    const totalQuizzes = quizzes.length;
    if (totalMaterials === 0 && totalQuizzes === 0) return 0;
    return Math.min(96, Math.max(40, Math.round(((totalQuizzes + 1) / (totalMaterials + totalQuizzes + 1)) * 100)));
  }, [materials.length, quizzes.length]);

  return (
    <SafeAreaView className="bg-stone-50 dark:bg-stone-950 flex-1" edges={["top"]}>
      {/* Top Header Bar */}
      <AppHeaderBar logoPosition="left" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 6, paddingBottom: 48 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={APP_COLORS.quizBlue}
          />
        }
      >
        <View className="mx-auto w-full max-w-md gap-4">
          {/* Hero Banner */}
          <HeroBanner
            title="Study Analytics &\n"
            titleHighlight="Learning Progress 📈"
            subtitle="Track your daily study habits, quiz scores & course completion in real-time."
          />

          {/* Quick High-Level Stats Overview Grid */}
          <View className="flex-row items-center gap-2.5">
            {/* Stat Box 1: Overall Completion Rate */}
            <Card className="flex-1 p-3.5 gap-2 border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20">
              <View className="flex-row items-center justify-between">
                <View className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 items-center justify-center">
                  <Feather name="trending-up" size={16} color="#2563EB" />
                </View>
                <Text variant="h1" className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                  {overallAccuracy}%
                </Text>
              </View>
              <Text variant="caption" className="text-stone-600 dark:text-stone-300 font-semibold text-xs">
                Completion Rate
              </Text>
            </Card>

            {/* Stat Box 2: Current Streak */}
            <Card className="flex-1 p-3.5 gap-2 border border-orange-200/80 dark:border-orange-900/60 bg-orange-50/50 dark:bg-orange-950/20">
              <View className="flex-row items-center justify-between">
                <View className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/60 items-center justify-center">
                  <Feather name="zap" size={16} color="#EA580C" />
                </View>
                <Text variant="h1" className="text-xl font-extrabold text-orange-600 dark:text-orange-400">
                  {currentStreak}d
                </Text>
              </View>
              <Text variant="caption" className="text-stone-600 dark:text-stone-300 font-semibold text-xs">
                Current Streak
              </Text>
            </Card>
          </View>

          {/* Subject-Wise Progress Section */}
          <Card className="p-4 gap-3.5 shadow-2xs">
            <CardHeader className="p-0 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Icon name="book-open" size={18} color={APP_COLORS.quizBlue} />
                <CardTitle className="text-lg font-extrabold">Subject Breakdown</CardTitle>
              </View>
              <Badge label={`${subjects.length} Subjects`} variant="blue" />
            </CardHeader>

            <CardContent className="p-0 gap-3">
              {isLoadingSubjects ? (
                <View className="py-6">
                  <Spinner size="small" variant="quiz" message="Calculating subject progress..." />
                </View>
              ) : subjectProgressList.length === 0 ? (
                <View className="py-6 items-center gap-2">
                  <Text variant="muted" className="text-xs text-center">
                    No subjects added yet. Add subjects to see detailed progress breakdown.
                  </Text>
                  <Button
                    size="sm"
                    variant="quiz"
                    title="Add First Subject +"
                    onPress={() => router.push("/create-subject")}
                  />
                </View>
              ) : (
                subjectProgressList.map((item) => (
                  <View key={item.id} className="gap-1.5 pt-1">
                    <View className="flex-row items-center justify-between">
                      <Text variant="h4" className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        {item.name}
                      </Text>
                      <Text className={`text-xs font-bold ${item.style.text}`}>
                        {item.progressPercent}%
                      </Text>
                    </View>

                    <ProgressBar
                      value={item.progressPercent}
                      size="md"
                      barClassName={item.style.bar}
                    />

                    <View className="flex-row items-center gap-3 mt-0.5">
                      <Text variant="caption" className="text-[11px] text-stone-500">
                        {item.materialsCount} Materials
                      </Text>
                      <Text variant="caption" className="text-[11px] text-stone-500">
                        • {item.quizzesCount} Quizzes
                      </Text>
                      <Text variant="caption" className="text-[11px] text-stone-500">
                        • {item.notesCount} Notes
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </CardContent>
          </Card>

          {/* Tasks & Study Hours Chart */}
          <TasksChartWidget />

          {/* Study Streak Analytics Widget */}
          <StudyStreakWidget />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
