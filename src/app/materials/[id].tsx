import { MaterialDetailScreen } from "@/components/materials";
import { useLocalSearchParams } from "expo-router";
import * as React from "react";

export default function MaterialDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <MaterialDetailScreen materialId={id} />;
}
