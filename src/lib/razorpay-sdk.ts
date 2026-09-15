import { APP_COLORS } from "@/constants/colors";
import RazorpayCheckout from "react-native-razorpay";

export interface OpenRazorpayOptions {
  amount: number; // Amount in standard unit (e.g. INR or USD)
  currency?: string; // "INR" or "USD"
  description?: string;
  orderId?: string;
  planName?: string;
  userName?: string;
  userEmail?: string;
  userContact?: string;
  keyId?: string;
}

export const openOfficialRazorpaySDK = async (
  options: OpenRazorpayOptions,
): Promise<{ paymentId: string; orderId?: string; signature?: string }> => {
  const key =
    options.keyId || process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;

  if (!key) {
    throw new Error(
      "Razorpay Key ID missing. Please ensure backend returns keyId in /subscriptions/subscribe API response.",
    );
  }

  const currency = (options.currency || "INR").toUpperCase();

  const isSubscriptionId =
    options.orderId && options.orderId.startsWith("sub_");
  const isOrderId =
    options.orderId &&
    options.orderId.startsWith("order_") &&
    !options.orderId.includes("TEST") &&
    !/^order_\d+$/.test(options.orderId);

  const razorpayOptions: any = {
    description:
      options.description ||
      `${options.planName || "Subscription"} Plan Payment`,
    image: "https://i.imgur.com/3g7nmjc.png",
    currency: currency,
    key: key,
    amount: Math.round(options.amount * 100), // Amount in paise/cents
    name: "Study Circle",
    ...(isSubscriptionId ? { subscription_id: options.orderId } : {}),
    ...(isOrderId ? { order_id: options.orderId } : {}),
    prefill: {
      email: options.userEmail || "",
      contact: options.userContact || "",
      name: options.userName || "",
    },
    theme: { color: APP_COLORS.primary || "#582BE8" },
  };

  try {
    const data = await RazorpayCheckout.open(razorpayOptions);
    console.log("[Razorpay SDK] Raw checkout response:", data);

    const rawData = data as any;
    const paymentId = rawData?.razorpay_payment_id || rawData?.payment_id;
    if (!paymentId) {
      throw new Error("PAYMENT_CANCELLED");
    }

    return {
      paymentId: String(paymentId),
      orderId:
        rawData?.razorpay_subscription_id ||
        rawData?.razorpay_order_id ||
        options.orderId,
      signature: rawData?.razorpay_signature || "",
    };
  } catch (error: any) {
    console.warn("[Razorpay SDK] Raw error caught:", error);

    let errorMsg = "";
    if (error?.error?.description) {
      errorMsg = error.error.description;
    } else if (error?.description) {
      try {
        const parsed =
          typeof error.description === "string" &&
          error.description.startsWith("{")
            ? JSON.parse(error.description)
            : null;
        errorMsg =
          parsed?.error?.description ||
          parsed?.error?.reason ||
          error.description;
      } catch (e) {
        errorMsg = error.description;
      }
    } else if (error?.reason) {
      errorMsg = error.reason;
    } else if (error?.message) {
      errorMsg = error.message;
    } else if (typeof error === "string") {
      errorMsg = error;
    } else {
      errorMsg = "Razorpay payment checkout failed.";
    }

    const lower = String(errorMsg).toLowerCase();
    const isExplicitCancel =
      (lower.includes("cancel") || lower.includes("closed")) &&
      !lower.includes("failed") &&
      !lower.includes("bad_request");

    if (isExplicitCancel) {
      errorMsg = "PAYMENT_CANCELLED";
    }

    console.warn("[Razorpay SDK] Formatted Error Message:", errorMsg);
    throw new Error(errorMsg);
  }
};
