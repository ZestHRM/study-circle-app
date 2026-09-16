import { AppHeaderBrand } from "@/components/ui/app-logo";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { useThemePreference } from "@/lib/theme-preference";
import * as React from "react";
import { View } from "react-native";

export interface UploadHeaderProps {
  currentStep?: 1 | 2 | 3 | 4;
  onBack?: () => void;
}

export const UploadHeader = React.memo(function UploadHeader({
  currentStep = 1,
  onBack,
}: UploadHeaderProps) {
  const { isDark } = useThemePreference();
  const steps = [1, 2, 3, 4] as const;

  return (
    <View className="bg-card border-b border-border pt-2 pb-3 px-4 gap-3">
      {/* Main Header Navigation Row */}
      <View className="flex-row items-center justify-between">
        {/* Left Back Arrow */}
        <View className="w-10">
          {onBack ? (
            <Button
              variant="ghost"
              icon="chevron-left"
              onPress={onBack}
              className="w-10 h-10 rounded-full items-center justify-center p-0"
              iconColor={isDark ? APP_COLORS.white : APP_COLORS.stone900}
            />
          ) : null}
        </View>

        {/* Center App Brand Logo */}
        <AppHeaderBrand logoSize={36} />

        {/* Right Step Counter */}
        <View className="w-12 items-end">
          <Text variant="caption" className="text-xs font-semibold text-stone-500 dark:text-stone-400">
            {currentStep} of 4
          </Text>
        </View>
      </View>

      {/* 4-Segment Segmented Progress Indicator Bar */}
      <View className="flex-row items-center gap-1.5 px-1">
        {steps.map((s) => {
          const isFilled = s <= currentStep;
          return (
            <View
              key={s}
              style={{
                backgroundColor: isFilled
                  ? APP_COLORS.brandPurple
                  : isDark
                  ? APP_COLORS.stone800
                  : APP_COLORS.stone200,
              }}
              className="flex-1 h-1.5 rounded-full"
            />
          );
        })}
      </View>
    </View>
  );
});
