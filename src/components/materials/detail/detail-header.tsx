import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import * as React from "react";
import { Pressable, View } from "react-native";

interface DetailHeaderProps {
  title: string;
  onBack: () => void;
}

export const DetailHeader = React.memo(function DetailHeader({
  title,
  onBack,
}: DetailHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-stone-950">
      <Pressable
        onPress={onBack}
        hitSlop={12}
        className="w-10 h-10 rounded-full items-center justify-center active:opacity-60"
      >
        <Icon name="chevron-left" size={26} color={APP_COLORS.stone800} />
      </Pressable>
      <Text
        variant="h3"
        className="flex-1 text-center mx-1"
        numberOfLines={1}
      >
        {title}
      </Text>
      <Pressable
        hitSlop={12}
        className="w-10 h-10 rounded-full items-center justify-center active:opacity-60"
      >
        <Icon name="more-vertical" size={20} color={APP_COLORS.stone600} />
      </Pressable>
    </View>
  );
});
