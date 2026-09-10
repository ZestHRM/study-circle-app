import { CreateFirstSubjectOnboarding } from "@/components/onboarding";
import { DailyCheckinWidget } from "@/components/home/daily-checkin-widget";
import { HomeGreeting } from "@/components/home/home-greeting";
import { NextExamWidget } from "@/components/home/next-exam-widget";
import { StatsCardsWidget } from "@/components/home/stats-cards-widget";
import { StudyStreakWidget } from "@/components/home/study-streak-widget";
import { TasksChartWidget } from "@/components/home/tasks-chart-widget";
import { ViewFeedbackDialog } from "@/components/home/view-feedback-dialog";
import { YourSubjectsListWidget } from "@/components/home/your-subjects-list-widget";
import { Spinner } from "@/components/ui/spinner";
import { useSubjectsQuery } from "@/hooks/queries/use-subjects";
import { useAuth } from "@/lib/auth";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import * as React from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    subjects,
    isLoading: isLoadingSubjects,
    refetch: refetchSubjects,
  } = useSubjectsQuery();

  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = React.useState(false);
  const [selectedFeedbackCheckInId, setSelectedFeedbackCheckInId] =
    React.useState<string | null>(null);

  // Auto-close dialogs when navigating away from this tab
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setIsFeedbackDialogOpen(false);
        setSelectedFeedbackCheckInId(null);
      };
    }, []),
  );

  const activeDashboardRequests = useIsFetching({ queryKey: ["dashboard"] });
  const isRefreshing = activeDashboardRequests > 0;

  function onRefresh() {
    void Promise.all([
      queryClient.refetchQueries({
        queryKey: ["dashboard"],
        type: "active",
      }),
      refetchSubjects(),
    ]);
  }

  function openDailyCheckIn() {
    router.push("/daily-checkin");
  }

  function openFeedback(checkInId: string) {
    setSelectedFeedbackCheckInId(checkInId);
    setIsFeedbackDialogOpen(true);
  }

  function onFeedbackOpenChange(open: boolean) {
    setIsFeedbackDialogOpen(open);
    if (!open) {
      setSelectedFeedbackCheckInId(null);
    }
  }

  const hasNoSubjects = !isLoadingSubjects && subjects.length === 0;

  return (
    <SafeAreaView className="bg-background flex-1" edges={["top"]}>
      {isLoadingSubjects && subjects.length === 0 ? (
        <View className="flex-1 justify-center items-center py-12">
          <Spinner
            variant="quiz"
            size="large"
            message="Checking your study profile..."
          />
        </View>
      ) : hasNoSubjects ? (
        /* Onboarding Screen when 0 subjects exist */
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <CreateFirstSubjectOnboarding
            onCreateSubject={() => router.push("/create-subject")}
            onCheckInSentiment={() => openDailyCheckIn()}
          />
        </ScrollView>
      ) : (
        /* Regular Home Dashboard Matching User Design Spec */
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 4,
            paddingBottom: 32,
          }}
        >
          <View className="mx-auto w-full max-w-md gap-4 pb-8">
            <HomeGreeting name={user?.name} />

            <NextExamWidget />

            <DailyCheckinWidget
              onCheckIn={openDailyCheckIn}
              onViewFeedback={openFeedback}
            />

            <YourSubjectsListWidget />

            <TasksChartWidget onCheckIn={openDailyCheckIn} />

            <StatsCardsWidget />

            <StudyStreakWidget />
          </View>
        </ScrollView>
      )}

      <ViewFeedbackDialog
        open={isFeedbackDialogOpen}
        onOpenChange={onFeedbackOpenChange}
        checkInId={selectedFeedbackCheckInId}
      />
    </SafeAreaView>
  );
}
