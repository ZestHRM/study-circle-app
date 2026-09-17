import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { Pressable, View } from "react-native";

interface DetailHeaderProps {
  title: string;
  onBack: () => void;
  onDelete?: () => void;
}

export const DetailHeader = React.memo(function DetailHeader({
  title,
  onBack,
  onDelete,
}: DetailHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-background">
      <Pressable
        onPress={onBack}
        hitSlop={12}
        className="w-10 h-10 rounded-full items-center justify-center active:opacity-60"
      >
        <Icon name="chevron-left" size={26} className="text-foreground" />
      </Pressable>
      <Text
        variant="h3"
        className="flex-1 text-center mx-1"
        numberOfLines={1}
      >
        {title}
      </Text>
      {onDelete ? (
        <Pressable
          onPress={onDelete}
          hitSlop={12}
          className="w-10 h-10 rounded-full items-center justify-center active:opacity-60"
        >
          <Icon name="trash-2" size={20} className="text-red-500" />
        </Pressable>
      ) : (
        <View className="w-10" />
      )}
    </View>
  );
});
