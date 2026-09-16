import {
  DailyCheckinWidget,
  HomeGreeting,
  NextActionWidget,
  RecentMaterialsWidget,
  StatsCardsWidget,
  ViewFeedbackDialog,
  YourSubjectsCarouselWidget,
} from "@/components/home";
import { CreateFirstSubjectOnboarding } from "@/components/onboarding";
import { AppScreen } from "@/components/ui/app-screen";
import { Spinner } from "@/components/ui/spinner";
import { useSubjectsQuery } from "@/hooks/queries/use-subjects";
import { useAuth } from "@/lib/auth";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import * as React from "react";
import { RefreshControl, View } from "react-native";

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

  const onRefresh = React.useCallback(() => {
    void Promise.all([
      queryClient.refetchQueries({
        queryKey: ["dashboard"],
        type: "active",
      }),
      refetchSubjects(),
    ]);
  }, [queryClient, refetchSubjects]);

  const openDailyCheckIn = React.useCallback(() => {
    router.push("/daily-checkin");
  }, []);

  const handleCreateSubject = React.useCallback(() => {
    router.push("/create-subject");
  }, []);

  const openFeedback = React.useCallback((checkInId: string) => {
    setSelectedFeedbackCheckInId(checkInId);
    setIsFeedbackDialogOpen(true);
  }, []);

  const onFeedbackOpenChange = React.useCallback((open: boolean) => {
    setIsFeedbackDialogOpen(open);
    if (!open) {
      setSelectedFeedbackCheckInId(null);
    }
  }, []);

  const hasNoSubjects = !isLoadingSubjects && subjects.length === 0;

  const refreshControlElement = React.useMemo(
    () => <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />,
    [isRefreshing, onRefresh],
  );

  if (isLoadingSubjects && subjects.length === 0) {
    return (
      <AppScreen scrollable={false}>
        <View className="flex-1 justify-center items-center py-12">
          <Spinner
            variant="quiz"
            size="large"
            message="Checking your study profile..."
          />
        </View>
      </AppScreen>
    );
  }

  if (hasNoSubjects) {
    return (
      <AppScreen scrollable={false}>
        <CreateFirstSubjectOnboarding
          onCreateSubject={handleCreateSubject}
          onCheckInSentiment={openDailyCheckIn}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen
      scrollable={true}
      refreshControl={refreshControlElement}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 40,
      }}
    >
      <View className="mx-auto w-full max-w-md gap-4 pb-8">
        <HomeGreeting name={user?.name} />
        <DailyCheckinWidget
          onCheckIn={openDailyCheckIn}
          onViewFeedback={openFeedback}
        />
        <StatsCardsWidget />
        <NextActionWidget />
        <YourSubjectsCarouselWidget />
        <RecentMaterialsWidget />
      </View>

      <ViewFeedbackDialog
        open={isFeedbackDialogOpen}
        onOpenChange={onFeedbackOpenChange}
        checkInId={selectedFeedbackCheckInId}
      />
    </AppScreen>
  );
}
