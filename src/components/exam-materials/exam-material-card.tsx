import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { formatShortDate } from "@/lib/utils/formatters";
import type { ExamMaterial, ExamMaterialCategory } from "@/services/exam-materials-service";
import * as React from "react";
import { Pressable, View } from "react-native";

export interface ExamMaterialCardProps {
  material: ExamMaterial;
  onDelete: (material: ExamMaterial) => void;
  onPress?: (material: ExamMaterial) => void;
  isDeleting?: boolean;
}

const CATEGORY_CONFIG: Record<
  ExamMaterialCategory,
  { label: string; color: string; bgClass: string; icon: string }
> = {
  ALL: { label: "Exam Material", color: APP_COLORS.primary, bgClass: "bg-indigo-50 dark:bg-indigo-950/40", icon: "award" },
  PYQ: { label: "PYQ Paper", color: "#8B5CF6", bgClass: "bg-purple-50 dark:bg-purple-950/40", icon: "file-check" },
  MOCK_TEST: { label: "Mock Test", color: "#3B82F6", bgClass: "bg-blue-50 dark:bg-blue-950/40", icon: "file-text" },
  MODEL_PAPER: { label: "Model Paper", color: "#10B981", bgClass: "bg-emerald-50 dark:bg-emerald-950/40", icon: "book-open" },
  REVISION_SHEET: { label: "Revision Sheet", color: "#F59E0B", bgClass: "bg-amber-50 dark:bg-amber-950/40", icon: "layers" },
  SYLLABUS: { label: "Syllabus Guide", color: "#EC4899", bgClass: "bg-pink-50 dark:bg-pink-950/40", icon: "list" },
};

export const ExamMaterialCard = React.memo(function ExamMaterialCard({
  material,
  onDelete,
  onPress,
  isDeleting = false,
}: ExamMaterialCardProps) {
  const subjectName = material.subject?.name ?? "General";
  const categoryConfig = CATEGORY_CONFIG[material.examCategory] || CATEGORY_CONFIG.PYQ;

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
    <Card className="p-3.5 gap-2.5 border-l-4 border-l-primary">
      <Pressable
        onPress={handlePress}
        className="flex-row items-center justify-between gap-3 active:opacity-80"
      >
        <View className={`w-11 h-11 rounded-xl items-center justify-center ${categoryConfig.bgClass}`}>
          <Icon name={categoryConfig.icon as any} size={20} color={categoryConfig.color} />
        </View>

        <View className="flex-1 pr-1 justify-center">
          <View className="flex-row items-center flex-wrap gap-1.5 mb-1">
            <Badge label={categoryConfig.label} variant="outline" className="py-0.5 px-2" />
            <Badge label={subjectName} variant="default" className="py-0.5 px-2" />
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
