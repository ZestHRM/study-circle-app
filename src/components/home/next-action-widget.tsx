import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useStudyMaterialsInfinite } from "@/hooks/queries/use-study-materials";
import { router } from "expo-router";
import * as React from "react";
import { View } from "react-native";

export interface NextActionWidgetProps {
  subjectName?: string;
  actionTitle?: string;
  actionDescription?: string;
  durationMinutes?: number;
  onStartAction?: () => void;
  materialId?: string;
}

export const NextActionWidget = React.memo(function NextActionWidget({
  subjectName,
  actionTitle,
  actionDescription,
  durationMinutes = 12,
  onStartAction,
  materialId,
}: NextActionWidgetProps) {
  const { materials } = useStudyMaterialsInfinite({ limit: 1 });
  const latestMaterial = materials[0];

  const hasData = Boolean(latestMaterial || actionTitle || subjectName);

  if (!hasData) {
    return null;
  }

  const finalSubjectName =
    subjectName ??
    latestMaterial?.subject?.name?.toUpperCase() ??
    latestMaterial?.title?.toUpperCase() ??
    "STUDY MATERIAL";

  const finalActionTitle =
    actionTitle ?? `Review ${latestMaterial?.title ?? "material"}`;

  const finalActionDescription =
    actionDescription ??
    "Strengthen your understanding with a quick review from your notes.";

  const targetMaterialId = materialId ?? latestMaterial?.id;

  const handlePress = React.useCallback(() => {
    if (onStartAction) {
      onStartAction();
    } else if (targetMaterialId) {
      router.push({
        pathname: "/materials/[id]",
        params: { id: targetMaterialId },
      } as any);
    } else {
      router.push("/(tabs)/materials" as any);
    }
  }, [onStartAction, targetMaterialId]);

  return (
    <Card className="border-border rounded-3xl p-4 gap-3">
      {/* Header Row: Title & Badge */}
      <View className="flex-row items-center justify-between gap-2 flex-wrap">
        <Text variant="h3" className="text-base font-bold flex-shrink">
          Next best action
        </Text>
        <View className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20 shrink-0">
          <Text variant="primary" className="text-[11px] font-semibold">
            Based on your recent notes
          </Text>
        </View>
      </View>

      {/* Main Details Section */}
      <View className="flex-row items-start gap-3.5 pt-0.5">
        {/* Laptop Icon Box */}
        <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center border border-primary/20 mt-0.5 shrink-0">
          <Icon name="tv" size={22} color="primary" />
        </View>

        {/* Text Body */}
        <View className="flex-1">
          <Text
            variant="primary"
            className="text-[10px] font-extrabold tracking-wider uppercase"
          >
            {finalSubjectName}
          </Text>
          <Text
            variant="h3"
            className="text-base font-extrabold leading-snug mt-0.5"
          >
            {finalActionTitle}
          </Text>
          <Text variant="muted" className="mt-0.5 leading-snug">
            {finalActionDescription}
          </Text>
        </View>
      </View>

      {/* Footer Row: Meta & Blue Action Button */}
      <View className="flex-row items-center justify-between gap-2.5 pt-2 border-t border-border mt-1 flex-wrap">
        {/* Left Meta Information */}
        <View className="flex-row items-center gap-2 flex-wrap flex-1 min-w-[140px]">
          <View className="flex-row items-center gap-1">
            <Icon name="clock" size={13} color="muted" />
            <Text variant="subhead">{durationMinutes} min</Text>
          </View>

          <View className="w-1 h-1 rounded-full bg-muted-foreground/40" />

          <View className="flex-row items-center gap-1">
            <Icon name="file-text" size={13} color="muted" />
            <Text variant="muted">From your recent notes</Text>
          </View>
        </View>

        {/* Right Primary Button component */}
        <Button
          title="Start review"
          icon="arrow-right"
          iconPosition="right"
          variant="default"
          size="sm"
          className="rounded-2xl h-9 shrink-0"
          onPress={handlePress}
        />
      </View>
    </Card>
  );
});
