import { Badge } from "@/components/ui/badge";
import { getMaterialStatusSummary } from "@/lib/utils/material-status";
import type { StudyMaterial } from "@/services";
import * as React from "react";
import { View } from "react-native";

export interface MaterialStatusBadgesProps {
  material: StudyMaterial;
  className?: string;
}

/**
 * Centralized Reusable Status Badges Component for Study Material Cards & Detail views.
 */
export const MaterialStatusBadges = React.memo(function MaterialStatusBadges({
  material,
  className = "",
}: MaterialStatusBadgesProps) {
  const { failed, notesReady, quizReady, isProcessing } =
    getMaterialStatusSummary(material);

  return (
    <View className={`flex-row items-center gap-1.5 flex-wrap ${className}`}>
      {failed ? (
        <Badge label="Failed" icon="alert-circle" variant="destructive" />
      ) : (
        <>
          {notesReady ? (
            <Badge label="AI Notes Ready" icon="check-circle" variant="emerald" />
          ) : null}

          {quizReady ? (
            <Badge label="Quiz Ready" icon="zap" variant="blue" />
          ) : null}

          {isProcessing ? (
            <Badge label="Processing..." icon="clock" variant="amber" />
          ) : null}
        </>
      )}
    </View>
  );
});
