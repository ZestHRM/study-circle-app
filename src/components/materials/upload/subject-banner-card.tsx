import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { View } from "react-native";

export interface SubjectBannerCardProps {
  subject: string;
  title: string;
  fileCount?: number;
}

export const SubjectBannerCard = React.memo(function SubjectBannerCard({
  subject,
  title,
  fileCount = 1,
}: SubjectBannerCardProps) {
  return (
    <Card className="rounded-3xl p-4.5 border-purple-200 dark:border-purple-900/60 bg-purple-50/60 dark:bg-purple-950/30 flex-row items-center gap-3.5 shadow-2xs">
      <View className="w-11 h-11 rounded-2xl bg-purple-500/15 items-center justify-center border border-purple-200 dark:border-purple-800">
        <Icon name="cpu" size="md" color="primary" />
      </View>
      <View className="flex-1">
        <Text variant="h3">
          {subject}
        </Text>
        <Text variant="muted" className="mt-0.5">
          {fileCount} {fileCount === 1 ? "file" : "files"} • {title}
        </Text>
      </View>
    </Card>
  );
});
