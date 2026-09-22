import { MessageResponse, RestClient } from "./api-client";

export type CurrencyPrice = {
  inr: number;
  usd: number;
};

export type CurrencyPlanId = {
  inr: string;
  usd: string;
};

export type SubscriptionPlan = {
  id: {
    monthly: CurrencyPlanId;
    yearly: CurrencyPlanId;
  };
  name: string;
  price: {
    monthly: CurrencyPrice;
    yearly: CurrencyPrice;
  };
  features: string[];
};

export interface SubscribePlanRequest {
  planId: string;
}

export interface SubscribePlanResponse {
  success?: boolean;
  orderId?: string;
  id?: string;
  subscriptionId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  message?: string;
  data?: any;
}

export interface VerifyPaymentRequest {
  razorpay_payment_id: string;
  razorpay_subscription_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface VerifyPaymentResponse {
  success?: boolean;
  message?: string;
  subscriptionTier?: string;
  data?: any;
}

export const subscriptionsApi = {
  getPlans(): Promise<SubscriptionPlan[]> {
    return RestClient<SubscriptionPlan[]>(
      "/subscriptions/plans",
      "GET",
    );
  },

  subscribe(
    payload: SubscribePlanRequest,
  ): Promise<SubscribePlanResponse> {
    return RestClient<SubscribePlanResponse>(
      "/subscriptions/subscribe",
      "POST",
      { planId: payload.planId },
    );
  },

  verifyPayment(
    payload: VerifyPaymentRequest,
  ): Promise<VerifyPaymentResponse> {
    return RestClient<VerifyPaymentResponse>(
      "/subscriptions/verify-payment",
      "POST",
      payload,
    );
  },

  cancelSubscription(): Promise<MessageResponse> {
    return RestClient<MessageResponse>(
      "/subscriptions/cancel",
      "POST",
    );
  },
};
