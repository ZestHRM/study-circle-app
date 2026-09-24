import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useTodayCheckIn } from "@/hooks/queries/use-dashboard";
import { useAuth } from "@/lib/auth";
import { formatDayDate } from "@/lib/utils/formatters";
import { showInfoToast } from "@/lib/utils/toast";
import { getUserSubscriptionTier } from "@/services";
import { router } from "expo-router";
import * as React from "react";
import { View } from "react-native";

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
  const isPaidUser = React.useMemo(() => {
    const tier = getUserSubscriptionTier(user);
    return Boolean(
      tier && tier !== "FREE" && tier !== "GUEST" && tier !== "INACTIVE",
    );
  }, [user]);
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

    showInfoToast(
      "AI Feedback",
      "AI feedback view will be available in the mobile app soon.",
    );
  }, [todayCheckIn?.id, onViewFeedback]);

  if (todayCheckInQuery.isLoading) {
    return (
      <View className="bg-[#FFFDF3] dark:bg-amber-950/20 border border-[#FDE68A]/80 dark:border-amber-900/40 rounded-3xl p-4 gap-3">
        <View className="flex-row items-center gap-3">
          <View className="w-11 h-11 rounded-2xl bg-amber-100/80 dark:bg-amber-900/50 items-center justify-center">
            <Icon name="calendar" size={20} color="warning" />
          </View>
          <View className="flex-1">
            <Text variant="h3" className="text-base font-bold">
              Loading check-in...
            </Text>
            <Text variant="muted">Checking your daily status</Text>
          </View>
        </View>
      </View>
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
    <View className="bg-[#FFFDF3] dark:bg-amber-950/20 border border-[#FDE68A]/80 dark:border-amber-900/40 rounded-3xl p-4 shadow-2xs">
      {/* Top Header Row with Icon, Title, Subtitle, and Yellow Button */}
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-row items-start gap-3 flex-1 pr-1">
          {/* Calendar Icon Pill */}
          <View className="w-11 h-11 rounded-2xl bg-[#FEF3C7] dark:bg-amber-900/50 items-center justify-center border border-[#FDE68A] dark:border-amber-800/60 mt-0.5">
            <Icon name="calendar" size={20} color="warning" />
          </View>

          {/* Title & Subtitle */}
          <View className="flex-1 pr-1">
            <Text variant="h3" className="text-base font-bold leading-snug">
              Today&apos;s check-in
            </Text>
            <Text variant="muted" className="mt-0.5 leading-snug">
              Track your progress and get personalized guidance from your AI
              mentor.
            </Text>
          </View>
        </View>

        {/* Yellow Action Button */}
        <Button
          title="Check in"
          icon="arrow-right"
          iconPosition="right"
          size="sm"
          className="bg-[#FBBF24] active:bg-[#F59E0B] px-3.5 py-2.5 rounded-2xl h-10 border-0 shadow-2xs self-start mt-0.5"
          textClassName="text-xs font-bold text-stone-950"
          iconColor="#0C0A09"
          onPress={handleCheckIn}
        />
      </View>

      {/* Bottom Lock Banner Pill */}
      <View className="mt-3.5 flex-row items-center gap-2.5 bg-stone-100/80 dark:bg-stone-800/80 px-3.5 py-2.5 rounded-2xl border border-stone-200/50 dark:border-stone-700/50">
        <View className="w-5 h-5 rounded-md bg-stone-200/80 dark:bg-stone-700/80 items-center justify-center">
          <Icon name="lock" size={11} color="muted" />
        </View>
        <Text variant="subhead" className="font-medium flex-1">
          Complete today&apos;s check-in to receive AI Mentor feedback.
        </Text>
      </View>
    </View>
  );
});
