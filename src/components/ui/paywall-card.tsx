import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import * as React from "react";
import { Pressable, View } from "react-native";

export interface PaywallFeatureItem {
  icon?: string;
  label: string;
}

export interface PaywallCardProps {
  title: string;
  description: string;
  buttonLabel?: string;
  onUpgradePress?: () => void;
  featuresTitle?: string;
  features?: Array<PaywallFeatureItem | string>;
  iconName?: string;
  className?: string;
  children?: React.ReactNode;
}

export const PaywallCard = React.memo(function PaywallCard({
  title,
  description,
  buttonLabel = "Upgrade to Pro →",
  onUpgradePress,
  featuresTitle = "What you'll get with Pro",
  features = [],
  iconName = "lock",
  className = "",
  children,
}: PaywallCardProps) {
  const router = useRouter();

  const handleUpgrade = React.useCallback(() => {
    if (onUpgradePress) {
      onUpgradePress();
    } else {
      router.push("/subscriptions" as any);
    }
  }, [onUpgradePress, router]);

  return (
    <View
      className={`p-6 gap-5 items-center rounded-3xl border border-primary/20 bg-primary/10 ${className}`}
    >
      {/* Centered Circular Lock Icon */}
      <View className="items-center justify-center my-1">
        <View className="w-20 h-20 rounded-full bg-primary/15 items-center justify-center">
          <Icon name={iconName} size={34} color="primary" />
        </View>
      </View>

      {/* Title & Description */}
      <View className="items-center gap-1.5 text-center px-2">
        <Text
          variant="h2"
          className="text-center font-black text-xl text-foreground"
        >
          {title}
        </Text>
        <Text
          variant="muted"
          className="text-center leading-relaxed text-xs max-w-[290px]"
        >
          {description}
        </Text>
      </View>

      {/* Optional Custom Injected Content */}
      {children ? <View className="w-full">{children}</View> : null}

      {/* Primary Upgrade Button */}
      <Button
        title={buttonLabel}
        icon="award"
        variant="quiz"
        onPress={handleUpgrade}
        className="w-full h-13 rounded-2xl bg-primary justify-center items-center shadow-xs active:opacity-90"
      />

      {/* Features Checklist */}
      {features.length > 0 ? (
        <View className="w-full gap-3 pt-2 mt-1">
          {featuresTitle ? (
            <Text
              variant="caption"
              className="font-extrabold text-xs tracking-wide uppercase text-foreground/80"
            >
              {featuresTitle}
            </Text>
          ) : null}

          <View className="gap-2.5">
            {features.map((item, index) => {
              const label = typeof item === "string" ? item : item.label;
              const icon =
                typeof item === "string" ? "check" : item.icon || "check";

              return (
                <View key={index} className="flex-row items-center gap-2.5">
                  <Icon name={icon} size={16} color="primary" />
                  <Text
                    variant="subhead"
                    className="flex-1 text-xs font-semibold text-foreground"
                  >
                    {label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* Restore Purchase Link */}
      <View className="flex-row items-center justify-center gap-1 pt-1">
        <Text variant="caption">Already a Pro user?</Text>
        <Pressable onPress={handleUpgrade} hitSlop={8}>
          <Text variant="primary" className="text-xs font-bold">
            Restore purchase
          </Text>
        </Pressable>
      </View>
    </View>
  );
});
