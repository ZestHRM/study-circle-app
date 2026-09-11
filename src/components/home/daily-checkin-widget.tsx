import { ActionBannerWidget } from "@/components/ui/action-banner-widget";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useTodayCheckIn } from "@/hooks/queries/use-dashboard";
import { useAuth } from "@/lib/auth";
import { formatDayDate } from "@/lib/utils/formatters";
import { router } from "expo-router";
import * as React from "react";
import { Alert, View } from "react-native";

export interface DailyCheckinWidgetProps {
  onCheckIn?: () => void;
  onViewFeedback?: (checkInId: string) => void;
}

export const DailyCheckinWidget = React.memo(function DailyCheckinWidget({
  onCheckIn,
  onViewFeedback,
}: DailyCheckinWidgetProps) {
  const { user } = useAuth();
  const todayCheckInQuery = useTodayCheckIn();

  const todayCheckIn = todayCheckInQuery.data;
  const hasCheckedIn = Boolean(todayCheckIn);
  const isPaidUser = Boolean(
    user?.subscriptionTier && user.subscriptionTier !== "FREE",
  );
  const todayLabel = React.useMemo(() => formatDayDate(), []);

  const handleCheckIn = React.useCallback(() => {
    if (onCheckIn) {
      onCheckIn();
    } else {
      router.push("/daily-checkin");
    }
  }, [onCheckIn]);

  const handleViewFeedback = React.useCallback(() => {
    if (!todayCheckIn?.id) {
      return;
    }

    if (onViewFeedback) {
      onViewFeedback(todayCheckIn.id);
      return;
    }

    Alert.alert(
      "AI Feedback",
      "AI feedback view will be available in the mobile app soon.",
    );
  }, [todayCheckIn?.id, onViewFeedback]);

  if (todayCheckInQuery.isLoading) {
    return (
      <Card className="gap-3 py-4 border border-blue-100/90 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader className="px-4">
          <View className="flex-row items-center gap-2">
            <Icon name="calendar" size="sm" color="muted" />
            <CardTitle className="text-base">Loading check-in...</CardTitle>
          </View>
          <CardDescription>Checking your daily status</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (hasCheckedIn) {
    return (
      <Card className="gap-3 py-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100/90 dark:border-emerald-900/40 rounded-3xl p-4.5 shadow-2xs">
        <CardHeader className="px-1 p-0">
          <View className="flex-row items-center gap-2">
            <Icon name="check-circle" size="md" color="success" />
            <CardTitle className="text-base font-bold text-emerald-900 dark:text-emerald-300">
              Daily Check-in Complete! 🎉
            </CardTitle>
          </View>
          <CardDescription className="text-stone-600 dark:text-stone-300 mt-1">
            Great job completing your daily check-in for {todayLabel}.
          </CardDescription>
        </CardHeader>

        {isPaidUser ? (
          <CardContent className="px-1 p-0 pt-2">
            <Button
              size="sm"
              variant="quiz"
              icon="cpu"
              title="View AI Feedback"
              className="self-start"
              onPress={handleViewFeedback}
            />
          </CardContent>
        ) : null}
      </Card>
    );
  }

  return (
    <ActionBannerWidget
      icon="☀️"
      badgeText="DAILY CHECK-IN"
      title="How are you feeling today?"
      subtitle="A quick check-in helps us support you better."
      buttonTitle="Start check-in  →"
      onButtonPress={handleCheckIn}
    />
  );
});
