import { MaterialStatusBadges } from "@/components/materials/material-status-badges";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { formatShortDate } from "@/lib/utils/formatters";
import type { StudyMaterial } from "@/services";
import { useRouter } from "expo-router";
import * as React from "react";
import { Pressable, View } from "react-native";

export interface MaterialCardProps {
  material: StudyMaterial;
  onDelete: (material: StudyMaterial) => void;
  isDeleting?: boolean;
}

export const MaterialCard = React.memo(function MaterialCard({
  material,
  onDelete,
  isDeleting = false,
}: MaterialCardProps) {
  const subjectName = material.subject?.name ?? "General";
  const router = useRouter();

  const handleCardPress = React.useCallback(() => {
    router.push(`/materials/${material.id}` as any);
  }, [router, material.id]);

  const handleDeletePress = React.useCallback(
    (e: any) => {
      e?.stopPropagation?.();
      onDelete(material);
    },
    [onDelete, material],
  );

  return (
    <Card onPress={handleCardPress} className="p-3.5 gap-2.5">
      <View className="flex-row items-center justify-between gap-3">
        <View className="w-10 h-10 rounded-xl items-center justify-center bg-blue-50 dark:bg-blue-950/40">
          <Icon name="file-text" size={18} color={APP_COLORS.quizBlue} />
        </View>

        <View className="flex-1 pr-1 justify-center">
          <View className="flex-row items-center gap-2 mb-0.5">
            <Badge label={subjectName} variant="default" />
            <Text variant="muted" className="text-[11px]">
              {formatShortDate(material.createdAt)}
            </Text>
          </View>

          <Text
            variant="h4"
            className="text-sm font-bold text-stone-900 dark:text-stone-100"
            numberOfLines={1}
          >
            {material.title}
          </Text>
        </View>

        <Icon name="chevron-right" size={18} color={APP_COLORS.stone400} />
      </View>

      <View className="flex-row items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800/60 mt-0.5">
        <MaterialStatusBadges material={material} className="flex-1 pr-2" />

        <Pressable
          onPress={handleDeletePress}
          disabled={isDeleting}
          className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 items-center justify-center active:opacity-70"
          hitSlop={8}
        >
          <Icon name="trash-2" size={13} color={APP_COLORS.error} />
        </Pressable>
      </View>
    </Card>
  );
});
