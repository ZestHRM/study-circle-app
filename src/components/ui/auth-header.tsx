import { AppHeaderBrand } from "@/components/ui/app-logo";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import * as React from "react";
import { View } from "react-native";

export interface AuthHeaderProps {
  badgeText?: string;
  title: string;
  highlightTitle: string;
  subtitle?: string;
  className?: string;
  logoSize?: number;
}

export function AuthHeader({
  badgeText = "SUBJECTS TODAY BRIGHTER TOMORROWS",
  title,
  highlightTitle,
  subtitle,
  className,
  logoSize = 44,
}: AuthHeaderProps) {
  return (
    <View className={cn("gap-4", className)}>
      <View className="gap-2 items-start">
        <AppHeaderBrand logoSize={logoSize} />
        {badgeText ? (
          <Text variant="caption" className="tracking-[0.25em] uppercase">
            {badgeText}
          </Text>
        ) : null}
      </View>

      <View className="mt-1">
        <Text variant="h1" className="text-4xl leading-[44px]">
          {title}{"\n"}
          <Text variant="primary" className="text-4xl">
            {highlightTitle}
          </Text>
        </Text>
        {subtitle ? (
          <Text variant="p" className="mt-1">
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
