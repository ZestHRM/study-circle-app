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
    options.keyId ||
    process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID ||
    "rzp_test_RThSFento4BogD";

  const currency = (options.currency || "INR").toUpperCase();

  // Razorpay SDK validates order_id against Razorpay backend.
  // Only include order_id if it's a real order created via Razorpay API (not local test timestamp order_xxx)
  const isValidRazorpayOrderId =
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
    ...(isValidRazorpayOrderId ? { order_id: options.orderId } : {}),
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
      throw new Error("Payment was cancelled or payment ID was not generated.");
    }

    return {
      paymentId: String(paymentId),
      orderId: rawData?.razorpay_order_id || options.orderId,
      signature: rawData?.razorpay_signature || "",
    };
  } catch (error: any) {
    let errorMsg = "Payment was cancelled or failed.";
    if (typeof error === "string") {
      errorMsg = error;
    } else if (error?.description) {
      try {
        const parsed =
          typeof error.description === "string" &&
          error.description.startsWith("{")
            ? JSON.parse(error.description)
            : null;
        errorMsg = parsed?.error?.description || error.description;
      } catch (e) {
        errorMsg = error.description;
      }
    } else if (error?.reason) {
      errorMsg = error.reason;
    } else if (error?.message) {
      errorMsg = error.message;
    }
    console.warn("[Razorpay SDK] Payment Cancelled or Failed:", errorMsg);
    throw new Error(errorMsg);
  }
};
