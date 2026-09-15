import { AppHeaderBar } from "@/components/ui/app-header-bar";
import { AppScreen } from "@/components/ui/app-screen";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import * as React from "react";
import { View } from "react-native";

export interface ComingSoonViewProps {
  /** Screen Title (e.g., "Study Circles") */
  title: string;
  /** Subtitle description */
  subtitle?: string;
  /** Badge label text */
  badgeText?: string;
  /** Primary Icon Name */
  iconName?: string;
}

export function ComingSoonView({
  title,
  subtitle = "We're actively working on this feature to bring you an awesome learning experience. Stay tuned!",
  badgeText = "COMING SOON",
  iconName = "sparkles",
}: ComingSoonViewProps) {
  return (
    <AppScreen
      header={<AppHeaderBar logoPosition="left" />}
      scrollable={true}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 48,
        flexGrow: 1,
        justifyContent: "center",
      }}
    >
      <View className="mx-auto w-full max-w-md items-center py-6">
        <Card className="w-full p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xs items-center text-center gap-5">
          {/* Glowing Icon Container */}
          <View className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 items-center justify-center shadow-xs">
            <Icon name={iconName} size={36} color={APP_COLORS.primary} />
          </View>

          {/* Badge */}
          <Badge
            label={badgeText}
            variant="purple"
            icon="clock"
            className="px-3.5 py-1 text-xs"
          />

          {/* Title & Headline */}
          <View className="items-center gap-2 px-2">
            <Text
              variant="h1"
              className="text-center font-black text-2xl text-foreground"
            >
              {title}
            </Text>

            <View className="flex-row items-center gap-2 my-1">
              <View className="w-2 h-2 rounded-full bg-emerald-500" />
              <Text className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                We&apos;re Working On It!
              </Text>
            </View>

            <Text
              variant="muted"
              className="text-center text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs mt-1"
            >
              {subtitle}
            </Text>
          </View>
        </Card>

        {/* Simple Subtle Footer Note */}
        <Text
          variant="muted"
          className="text-[11px] text-center text-muted-foreground mt-6"
        >
          Study Circle • Crafting best-in-class study tools for you
        </Text>
      </View>
    </AppScreen>
  );
}
