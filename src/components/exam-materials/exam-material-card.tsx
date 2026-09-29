import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { formatShortDate } from "@/lib/utils/formatters";
import type { ExamMaterial } from "@/services/exam-materials-service";
import * as React from "react";
import { Pressable, View } from "react-native";

export type ExamMaterialCardProps = {
  material: ExamMaterial;
  onDelete: (material: ExamMaterial) => void;
  onPress?: (material: ExamMaterial) => void;
  isDeleting?: boolean;
};

export const ExamMaterialCard = React.memo(function ExamMaterialCard({
  material,
  onDelete,
  onPress,
  isDeleting = false,
}: ExamMaterialCardProps) {
  const subjectName = material.subject?.name ?? "General";

  const handlePress = React.useCallback(() => {
    if (onPress) {
      onPress(material);
    }
  }, [onPress, material]);

  const handleDeletePress = React.useCallback(() => {
    onDelete(material);
  }, [onDelete, material]);

  const formattedSize = React.useMemo(() => {
    const file = material.files?.[0];
    if (!file?.size) return "PDF Document";
    const mb = file.size / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${Math.round(file.size / 1024)} KB`;
  }, [material.files]);

  return (
    <Card className="p-3.5 gap-2.5 border-l-4 border-l-primary bg-card border-border">
      <Pressable
        onPress={handlePress}
        className="flex-row items-center justify-between gap-3 active:opacity-80"
      >
        <View className="w-11 h-11 rounded-xl items-center justify-center bg-primary/10">
          <Icon name="file-check" size={20} color={APP_COLORS.primary} />
        </View>

        <View className="flex-1 pr-1 justify-center">
          <View className="flex-row items-center flex-wrap gap-1.5 mb-1">
            <Badge
              label={subjectName}
              variant="outline"
              className="py-0.5 px-2"
            />
            {material.year ? (
              <Text variant="muted" className="text-[11px] font-medium">
                • {material.year}
              </Text>
            ) : null}
          </View>

          <Text
            variant="h4"
            className="text-sm font-bold text-foreground"
            numberOfLines={1}
          >
            {material.title}
          </Text>

          {material.description ? (
            <Text
              variant="muted"
              className="text-xs text-muted-foreground mt-0.5"
              numberOfLines={1}
            >
              {material.description}
            </Text>
          ) : null}
        </View>

        <Icon name="chevron-right" size={18} color={APP_COLORS.stone400} />
      </Pressable>

      <View className="flex-row items-center justify-between pt-2 border-t border-border mt-0.5">
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <Icon name="file" size={13} color={APP_COLORS.stone400} />
            <Text variant="muted" className="text-xs">
              {formattedSize}
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <Icon name="calendar" size={13} color={APP_COLORS.stone400} />
            <Text variant="muted" className="text-xs">
              {formatShortDate(material.createdAt)}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleDeletePress}
          disabled={isDeleting}
          className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/30 items-center justify-center active:opacity-70"
          hitSlop={8}
        >
          <Icon name="trash-2" size={15} color={APP_COLORS.error} />
        </Pressable>
      </View>
    </Card>
  );
});
