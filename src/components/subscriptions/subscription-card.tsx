import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import type { SubscriptionPlan } from "@/services";
import * as React from "react";
import { View } from "react-native";

export interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  billingCycle: "monthly" | "yearly";
  currency: "inr" | "usd";
  isCurrent?: boolean;
  onSubscribe: (plan: SubscriptionPlan) => void;
  className?: string;
}

export const SubscriptionCard = React.memo(function SubscriptionCard({
  plan,
  billingCycle,
  currency,
  isCurrent = false,
  onSubscribe,
  className = "",
}: SubscriptionCardProps) {
  const planNameLower = plan.name.toLowerCase();
  const isGold = planNameLower.includes("gold");
  const isPlatinum = planNameLower.includes("plat");
  const isFree = planNameLower.includes("free");

  const priceAmount =
    plan.price?.[billingCycle]?.[currency] ??
    plan.price?.monthly?.[currency] ??
    0;
  const currencySymbol = currency === "inr" ? "₹" : "$";

  // Dynamic badge from API data
  const badgeLabel = isGold
    ? "MOST POPULAR"
    : isPlatinum
    ? "BEST VALUE"
    : undefined;

  return (
    <Card
      className={`p-5 gap-4 rounded-3xl ${
        isGold
          ? "border-2 border-purple-500/80 bg-purple-50/40 dark:bg-purple-950/20 shadow-md"
          : isPlatinum
          ? "border-2 border-amber-500/80 bg-amber-50/30 dark:bg-amber-950/20 shadow-md"
          : "border border-border"
      } ${className}`}
    >
      {/* Header Row: Title & Badge */}
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center gap-2.5">
          <View
            className={`w-10 h-10 rounded-2xl items-center justify-center ${
              isPlatinum
                ? "bg-amber-100 dark:bg-amber-900/60"
                : isGold
                ? "bg-purple-100 dark:bg-purple-900/60"
                : isFree
                ? "bg-muted"
                : "bg-blue-100 dark:bg-blue-950/60"
            }`}
          >
            <Icon
              name={
                isPlatinum
                  ? "award"
                  : isGold
                  ? "zap"
                  : isFree
                  ? "user"
                  : "star"
              }
              size={20}
              color={
                isPlatinum
                  ? "#D97706"
                  : isGold
                  ? APP_COLORS.brandPurple
                  : APP_COLORS.quizBlue
              }
            />
          </View>

          <View>
            <Text variant="h2" className="text-xl font-black">
              {plan.name}
            </Text>
            <Text variant="muted" className="text-xs">
              {isFree
                ? "Basic Starter"
                : `${billingCycle === "yearly" ? "Billed annually" : "Billed monthly"}`}
            </Text>
          </View>
        </View>

        {isCurrent ? (
          <Badge label="Current Plan" variant="emerald" />
        ) : badgeLabel ? (
          <Badge
            label={badgeLabel}
            variant={isPlatinum ? "amber" : "purple"}
          />
        ) : null}
      </View>

      {/* Price Display */}
      <View className="flex-row items-baseline gap-1 py-1 border-y border-border">
        <Text variant="h1" className="text-3xl font-black text-foreground">
          {priceAmount === 0 ? "Free" : `${currencySymbol}${priceAmount}`}
        </Text>
        {priceAmount > 0 ? (
          <Text variant="muted" className="text-xs font-semibold">
            / {billingCycle === "yearly" ? "year" : "month"}
          </Text>
        ) : null}
      </View>

      {/* Dynamic Features List from API */}
      <View className="gap-2.5">
        {(plan.features ?? []).map((feat) => {
          const featLower = feat.toLowerCase();
          const isNotIncluded = featLower.startsWith("no ");
          const isHighlight =
            featLower.includes("quiz access") ||
            featLower.includes("unlimited") ||
            featLower.includes("premium ai");

          return (
            <View key={feat} className="flex-row items-center gap-2.5">
              <Icon
                name={isNotIncluded ? "x" : "check-circle"}
                size={15}
                color={
                  isNotIncluded
                    ? APP_COLORS.stone400
                    : isHighlight
                    ? APP_COLORS.brandPurple
                    : APP_COLORS.success
                }
              />
              <Text
                className={`text-xs flex-1 ${
                  isNotIncluded
                    ? "text-muted-foreground line-through opacity-60"
                    : isHighlight
                    ? "font-extrabold text-foreground"
                    : "font-medium text-foreground"
                }`}
              >
                {feat}
              </Text>
            </View>
          );
        })}
      </View>

      {/* CTA Button */}
      <Button
        title={
          isCurrent
            ? "Current Active Plan"
            : isFree
            ? "Get Started Free"
            : `Subscribe to ${plan.name} →`
        }
        variant={
          isCurrent
            ? "secondary"
            : isGold || isPlatinum
            ? "quiz"
            : "default"
        }
        disabled={isCurrent}
        className="rounded-2xl mt-1 h-11"
        onPress={() => onSubscribe(plan)}
      />
    </Card>
  );
});
