import {
  DailyCheckinWidget,
  HomeGreeting,
  NextExamWidget,
  ViewFeedbackDialog,
  YourSubjectsListWidget,
} from "@/components/home";
import { CreateFirstSubjectOnboarding } from "@/components/onboarding";
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

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background flex-1" edges={["top"]}>
      {isLoadingSubjects && subjects.length === 0 ? (
        <View style={{ flex: 1 }} className="flex-1 justify-center items-center py-12">
          <Spinner
            variant="quiz"
            size="large"
            message="Checking your study profile..."
          />
        </View>
      ) : hasNoSubjects ? (
        /* Onboarding Screen when 0 subjects exist */
        <CreateFirstSubjectOnboarding
          onCreateSubject={handleCreateSubject}
          onCheckInSentiment={openDailyCheckIn}
        />
      ) : (
        /* Clean Home Dashboard */
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={refreshControlElement}
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
