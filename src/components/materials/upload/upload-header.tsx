import { AppLogo } from "@/components/ui/app-logo";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { View } from "react-native";

export interface UploadHeaderProps {
  currentStep?: number;
}

export const UploadHeader = React.memo(function UploadHeader({
  currentStep,
}: UploadHeaderProps) {
  return (
    <View className="bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 pt-2 pb-3 px-4">
      {/* Main Brand Header Row */}
      <View className="flex-row items-center justify-between">
        {/* Logo & Tagline */}
        <View className="flex-row items-center gap-2.5">
          <AppLogo size={42} />
          <View>
            <Text className="text-lg font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              StudyCircle<Text className="text-amber-500 font-black">AI</Text>
            </Text>
            <Text className="text-[11px] text-stone-400 font-medium -mt-0.5">
              Learn faster. Go further.
            </Text>
          </View>
        </View>

        <View className="items-end gap-1">
          {/* Bell Icon with Orange Notification Dot */}
          <View className="relative p-1">
            <Icon name="bell" size="lg" color="dark" />
            <View className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white dark:border-stone-900" />
          </View>
        </View>
      </View>
    </View>
  );
});
