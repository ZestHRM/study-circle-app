import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import * as React from "react";
import { View } from "react-native";

export interface UploadActionCardProps {
  title?: string;
  subtitle?: string;
  buttonTitle?: string;
  onPress: () => void;
  className?: string;
}

export const UploadActionCard = React.memo(function UploadActionCard({
  title = "Upload your material",
  subtitle = "Select subject & upload PDFs, notes or slides",
  buttonTitle = "Upload →",
  onPress,
  className,
}: UploadActionCardProps) {
  return (
    <Card
      onPress={onPress}
      className={`p-4 flex-row items-center justify-between rounded-3xl ${
        className ?? ""
      }`}
    >
      <View className="flex-row items-center gap-3.5 flex-1 pr-2">
        <View className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 items-center justify-center">
          <Icon name="upload-cloud" size={22} color={APP_COLORS.quizBlue} />
        </View>

        <View className="flex-1">
          <Text variant="h3" numberOfLines={1}>
            {title}
          </Text>
          <Text variant="muted" className="mt-0.5 text-xs" numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>

      <Button
        variant="quiz"
        size="sm"
        title={buttonTitle}
        icon="plus"
        iconSize={14}
        onPress={onPress}
        className="rounded-2xl"
      />
    </Card>
  );
});
