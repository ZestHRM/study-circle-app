import { useAuth } from "@/lib/auth";
import { openOfficialRazorpaySDK } from "@/lib/razorpay-sdk";
import { subscriptionsApi, type SubscriptionPlan } from "@/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { Alert } from "react-native";

export function useSubscriptionPlansQuery() {
  const { token } = useAuth();

  const query = useQuery<SubscriptionPlan[]>({
    queryKey: ["subscription-plans", token],
    queryFn: () => subscriptionsApi.getPlans(token),
    staleTime: 1000 * 60 * 15, // 15 mins cache
  });

  return {
    plans: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export interface SubscribeParams {
  plan: SubscriptionPlan;
  billingCycle: "monthly" | "yearly";
  currency: "inr" | "usd";
}

export type PaymentStepState =
  | "idle"
  | "initiating"
  | "checkout"
  | "verifying"
  | "success"
  | "cancelled"
  | "failed";

export function useSubscribeMutation() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  const [stepState, setStepState] = React.useState<PaymentStepState>("idle");
  const [stepMessage, setStepMessage] = React.useState<string>("");

  const resetState = React.useCallback(() => {
    setStepState("idle");
    setStepMessage("");
  }, []);

  const mutation = useMutation({
    mutationFn: async (params: SubscribeParams) => {
      const { plan, billingCycle, currency } = params;
      const selectedPlanId =
        plan.id?.[billingCycle]?.[currency] || plan.name.toLowerCase();
      const priceVal = plan.price?.[billingCycle]?.[currency] ?? 0;

      // Step 1: Initiating order API
      setStepState("initiating");
      setStepMessage("Initializing subscription plan...");

      const subRes = await subscriptionsApi.subscribe(
        { planId: selectedPlanId },
        token,
      );

      const orderId =
        subRes.orderId ||
        subRes.subscriptionId ||
        subRes.id ||
        subRes.data?.orderId;
      const keyId = subRes.keyId;

      // Step 2: Opening Native Razorpay SDK Overlay
      setStepState("checkout");
      setStepMessage("Connecting to Razorpay gateway...");

      let sdkResult;
      try {
        sdkResult = await openOfficialRazorpaySDK({
          amount: priceVal,
          currency: currency.toUpperCase(),
          orderId: orderId,
          planName: plan.name,
          userName: user?.name || user?.email?.split("@")[0] || "Student",
          userEmail: user?.email || "",
          keyId: keyId,
        });
      } catch (err: any) {
        const errorText = String(err?.message || err || "").toLowerCase();
        if (
          errorText.includes("cancel") ||
          errorText.includes("closed") ||
          errorText.includes("back")
        ) {
          setStepState("cancelled");
          setStepMessage("Payment was cancelled.");
          throw new Error("CANCELLED");
        }
        throw err;
      }

      // Step 3: Verifying Payment on backend
      setStepState("verifying");
      setStepMessage("Verifying secure payment...");

      const verifyRes = await subscriptionsApi.verifyPayment(
        {
          razorpay_payment_id: sdkResult.paymentId,
          razorpay_subscription_id: sdkResult.orderId || orderId || "",
          razorpay_signature: sdkResult.signature || "",
        },
        token,
      );

      return { plan, sdkResult, verifyRes };
    },
    onSuccess: async (data) => {
      setStepState("success");
      setStepMessage("Payment successful!");

      await queryClient.invalidateQueries({ queryKey: ["user"] });
      await queryClient.invalidateQueries({
        queryKey: ["subscription-plans"],
      });

      Alert.alert(
        "🎉 Subscription Activated!",
        `Thank you for subscribing to ${data.plan.name}.\nPayment ID: ${data.sdkResult.paymentId}`,
        [
          {
            text: "OK",
            onPress: () => resetState(),
          },
        ],
      );
    },
    onError: (err: any) => {
      if (err?.message === "CANCELLED") {
        Alert.alert("Payment Cancelled", "You cancelled the payment process.");
        return;
      }

      setStepState("failed");
      setStepMessage(err.message || "Payment processing failed.");

      console.warn("[useSubscribeMutation] Error:", err);
      Alert.alert(
        "Payment Failed",
        err.message || "Payment could not be completed. Please try again.",
      );
    },
  });

  const isProcessing =
    mutation.isPending ||
    stepState === "initiating" ||
    stepState === "checkout" ||
    stepState === "verifying";

  return {
    ...mutation,
    stepState,
    stepMessage,
    isProcessing,
    resetState,
  };
}
