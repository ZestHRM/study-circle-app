import { ExamMaterialDetailScreen } from "@/components/exam-materials";
import { useLocalSearchParams } from "expo-router";
import * as React from "react";

export default function ExamMaterialDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ExamMaterialDetailScreen materialId={id} />;
}
