import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { View } from "react-native";

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
    <View className="flex-row items-center justify-between px-4 py-3 bg-background border-b border-border">
      <Button
        variant="ghost"
        size="icon"
        icon="chevron-left"
        iconSize={24}
        onPress={onBack}
        className="w-10 h-10 rounded-full"
      />
      <Text
        variant="h3"
        className="flex-1 text-center mx-1 font-bold"
        numberOfLines={1}
      >
        {title}
      </Text>
      {onDelete ? (
        <Button
          variant="ghost"
          size="icon"
          icon="trash-2"
          iconSize={20}
          iconColor="error"
          onPress={onDelete}
          className="w-10 h-10 rounded-full"
        />
      ) : (
        <View className="w-10" />
      )}
    </View>
  );
});
