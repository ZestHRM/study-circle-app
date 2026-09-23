import {
  SubscriptionCard,
  SubscriptionControls,
} from "@/components/subscriptions";
import { AppScreen } from "@/components/ui/app-screen";
import { Button } from "@/components/ui/button";
import { CommonHeader } from "@/components/ui/common-header";
import { HeroBanner } from "@/components/ui/hero-banner";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import {
  useCancelSubscriptionMutation,
  useSubscribeMutation,
  useSubscriptionPlansQuery,
} from "@/hooks/queries/use-subscriptions";
import { useAuth } from "@/lib/auth";
import { showInfoToast } from "@/lib/utils/toast";
import { getFormattedSubscriptionTier, type SubscriptionPlan } from "@/services";
import { getUserCurrency } from "@/utils/get-user-currency";
import { useRouter } from "expo-router";
import * as React from "react";
import { View } from "react-native";

export default function SubscriptionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const confirm = useConfirmDialog();
  const { plans, isLoading, isError, refetch } = useSubscriptionPlansQuery();
  const subscribeMutation = useSubscribeMutation();
  const cancelMutation = useCancelSubscriptionMutation();

  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "yearly">(
    "monthly",
  );

  const currency = React.useMemo(() => getUserCurrency(), []);

  const currentTierName = React.useMemo(() => {
    return getFormattedSubscriptionTier(user);
  }, [user]);

  // Priority sort: current active plan goes to the top!
  const sortedPlans = React.useMemo(() => {
    if (!plans || plans.length === 0) return [];
    return [...plans].sort((a, b) => {
      const aIsCurrent = a.name.toLowerCase() === currentTierName.toLowerCase();
      const bIsCurrent = b.name.toLowerCase() === currentTierName.toLowerCase();
      if (aIsCurrent && !bIsCurrent) return -1;
      if (!aIsCurrent && bIsCurrent) return 1;
      return 0;
    });
  }, [plans, currentTierName]);

  const handleSubscribe = React.useCallback(
    (plan: SubscriptionPlan) => {
      if (subscribeMutation.isProcessing) return;

      if (plan.name.toLowerCase() === currentTierName.toLowerCase()) {
        showInfoToast(
          "Current Active Plan",
          `You are already subscribed to the ${plan.name}.`,
        );
        return;
      }

      subscribeMutation.mutate({
        plan,
        billingCycle,
        currency,
      });
    },
    [billingCycle, currency, currentTierName, subscribeMutation],
  );

  const handleCancel = React.useCallback(async () => {
    const isConfirmed = await confirm({
      title: "Cancel Subscription",
      description:
        "Are you sure you want to cancel your current subscription? You will lose access to premium AI features upon period end.",
      confirmText: "Yes, Cancel Plan",
      cancelText: "Keep My Plan",
    });

    if (isConfirmed) {
      cancelMutation.mutate();
    }
  }, [cancelMutation, confirm]);

  return (
    <AppScreen
      header={
        <CommonHeader
          title="Subscription Plans"
          onBack={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(tabs)");
            }
          }}
        />
      }
      scrollable={true}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 48,
      }}
    >
      <View className="mx-auto w-full max-w-md gap-5">
        {/* Theme-Matched Hero Banner */}
        <HeroBanner
          title="Unlock AI Study Power"
          titleHighlight=" 🚀"
          subtitle="Choose the perfect plan to boost your study speed, generate unlimited AI quizzes & notes."
          imageSource={require("../../assets/images/student-study-hero.png")}
          imageWidth={125}
          imageHeight={105}
        />

        {/* Reusable Toggle Controls */}
        <SubscriptionControls
          billingCycle={billingCycle}
          onBillingCycleChange={setBillingCycle}
        />

        {/* Loading or Error States */}
        {isLoading ? (
          <View className="py-12 items-center">
            <Spinner
              size="large"
              variant="quiz"
              message="Loading subscription plans..."
            />
          </View>
        ) : isError ? (
          <View className="py-8 items-center gap-3">
            <Text variant="error" className="text-sm">
              Failed to load subscription plans.
            </Text>
            <Button
              size="sm"
              variant="outline"
              title="Retry"
              onPress={() => void refetch()}
            />
          </View>
        ) : (
          /* Subscription Plans Cards List (Current Plan displayed at the very top) */
          <View className="gap-4">
            {sortedPlans.map((plan) => {
              const isCurrent =
                plan.name.toLowerCase() === currentTierName.toLowerCase();

              return (
                <SubscriptionCard
                  key={plan.name}
                  plan={plan}
                  billingCycle={billingCycle}
                  currency={currency}
                  isCurrent={isCurrent}
                  onSubscribe={handleSubscribe}
                  onCancel={handleCancel}
                  isCancelling={cancelMutation.isPending}
                />
              );
            })}
          </View>
        )}

        {/* Guarantee & Support Footer */}
        <View className="p-4 rounded-2xl bg-stone-100/70 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800 gap-2 items-center">
          <View className="flex-row items-center gap-1.5">
            <Icon name="shield" size={14} color={APP_COLORS.emerald600} />
            <Text
              variant="caption"
              className="font-bold text-stone-600 dark:text-stone-400"
            >
              Secure SSL Payment • Cancel Anytime
            </Text>
          </View>
          <Text variant="muted" className="text-[11px] text-center">
            Questions about plans? Contact us at support@usestudycircle.ai
          </Text>
        </View>
      </View>

      {/* Payment Processing Overlay Modal */}
      {subscribeMutation.isProcessing && (
        <View className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 items-center justify-center p-6">
          <View className="bg-white dark:bg-stone-900 rounded-3xl p-6 items-center gap-4 shadow-xl border border-stone-200 dark:border-stone-800 w-full max-w-xs">
            <Spinner
              size="large"
              variant="quiz"
              message={
                subscribeMutation.stepMessage || "Processing payment..."
              }
            />
          </View>
        </View>
      )}
    </AppScreen>
  );
}
