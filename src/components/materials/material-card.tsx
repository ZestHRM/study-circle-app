import { MaterialStatusBadges } from "@/components/materials/material-status-badges";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
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

  const handleDeletePress = React.useCallback(() => {
    onDelete(material);
  }, [onDelete, material]);

  return (
    <Card className="p-3.5 gap-2.5">
      <Pressable
        onPress={handleCardPress}
        className="flex-row items-center justify-between gap-3 active:opacity-80"
      >
        <View className="w-10 h-10 rounded-xl items-center justify-center bg-primary/10">
          <Icon name="file-text" size={18} color="primary" />
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
            className="text-sm font-bold text-foreground"
            numberOfLines={1}
          >
            {material.title}
          </Text>
        </View>

        <Icon name="chevron-right" size={18} color="muted" />
      </Pressable>

      <View className="flex-row items-center justify-between pt-1 border-t border-border mt-0.5">
        <Pressable
          onPress={handleCardPress}
          className="flex-1 pr-2 active:opacity-80"
        >
          <MaterialStatusBadges material={material} />
        </Pressable>

        <Pressable
          onPress={handleDeletePress}
          disabled={isDeleting}
          className="w-8 h-8 rounded-lg bg-destructive/10 items-center justify-center active:opacity-70"
          hitSlop={8}
        >
          <Icon name="trash-2" size={15} color="error" />
        </Pressable>
      </View>
    </Card>
  );
});
