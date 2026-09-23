import { getLocales } from "expo-localization";

export type AppCurrency = "inr" | "usd";

/**
 * Auto-detects the user's currency based on device locale/region.
 * - India (IN) → ₹ INR
 * - All other regions → $ USD (default)
 */
export function getUserCurrency(): AppCurrency {
  try {
    const locales = getLocales();
    const regionCode = locales?.[0]?.regionCode?.toUpperCase();

    if (regionCode === "IN") {
      return "inr";
    }

    return "usd";
  } catch {
    // Fallback to INR if locale detection fails (majority users are Indian)
    return "inr";
  }
}

/**
 * Returns the currency symbol for the given currency code.
 */
export function getCurrencySymbol(currency: AppCurrency): string {
  return currency === "inr" ? "₹" : "$";
}
