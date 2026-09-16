import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { Pressable, View } from "react-native";

export interface SubscriptionControlsProps {
  billingCycle: "monthly" | "yearly";
  onBillingCycleChange: (cycle: "monthly" | "yearly") => void;
  currency: "inr" | "usd";
  onCurrencyChange: (curr: "inr" | "usd") => void;
  yearlyDiscountLabel?: string;
  className?: string;
}

export const SubscriptionControls = React.memo(
  function SubscriptionControls({
    billingCycle,
    onBillingCycleChange,
    currency,
    onCurrencyChange,
    yearlyDiscountLabel = "Save 15%",
    className = "",
  }: SubscriptionControlsProps) {
    return (
      <View className={`gap-3 ${className}`}>
        {/* Billing Cycle Toggle */}
        <View className="flex-row items-center bg-muted p-1 rounded-2xl">
          <Pressable
            onPress={() => onBillingCycleChange("monthly")}
            className={`flex-1 py-2.5 rounded-xl items-center justify-center ${
              billingCycle === "monthly"
                ? "bg-card shadow-2xs"
                : "bg-transparent"
            }`}
          >
            <Text
              className={`text-xs font-extrabold ${
                billingCycle === "monthly"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Monthly Billing
            </Text>
          </Pressable>

          <Pressable
            onPress={() => onBillingCycleChange("yearly")}
            className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-1.5 ${
              billingCycle === "yearly"
                ? "bg-card shadow-2xs"
                : "bg-transparent"
            }`}
          >
            <Text
              className={`text-xs font-extrabold ${
                billingCycle === "yearly"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Yearly Billing
            </Text>
            {yearlyDiscountLabel ? (
              <Badge label={yearlyDiscountLabel} variant="emerald" />
            ) : null}
          </Pressable>
        </View>

        {/* Currency Switcher */}
        <View className="flex-row items-center justify-between px-1">
          <Text variant="caption" className="text-xs font-bold text-muted-foreground">
            Select Currency:
          </Text>

          <View className="flex-row items-center gap-1 bg-muted p-0.5 rounded-xl">
            <Pressable
              onPress={() => onCurrencyChange("inr")}
              className={`px-3 py-1 rounded-lg ${
                currency === "inr" ? "bg-primary shadow-2xs" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  currency === "inr"
                    ? "text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                ₹ INR
              </Text>
            </Pressable>

            <Pressable
              onPress={() => onCurrencyChange("usd")}
              className={`px-3 py-1 rounded-lg ${
                currency === "usd" ? "bg-primary shadow-2xs" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  currency === "usd"
                    ? "text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                $ USD
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  },
);
