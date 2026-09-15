import { AppScreen } from "@/components/ui/app-screen";
import { Button } from "@/components/ui/button";
import { CommonHeader } from "@/components/ui/common-header";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { useCreateSubjectForm } from "@/hooks/use-create-subject-form";
import { router } from "expo-router";
import * as React from "react";
import { Pressable, View } from "react-native";
import { PlantDoodle } from "./subject-doodles";

export const PRESET_THEMES = [
  {
    icon: "flask-outline",
    colorHex: "#10B981",
    bgHex: "#D1FAE5",
    name: "Science",
  },
  {
    icon: "book-open-variant",
    colorHex: "#2563EB",
    bgHex: "#DBEAFE",
    name: "Math",
  },
  {
    icon: "book-variant",
    colorHex: "#EC4899",
    bgHex: "#FCE7F3",
    name: "Literature",
  },
  { icon: "leaf", colorHex: "#8B5CF6", bgHex: "#EDE9FE", name: "Biology" },
  { icon: "cog-outline", colorHex: "#F97316", bgHex: "#FFEDD5", name: "Tech" },
] as const;

const PRESET_COURSES = [
  "JEE (Main)",
  "NEET",
  "CBSE 10th",
  "CBSE 12th",
  "UPSC",
  "General",
];

export interface CreateSubjectScreenProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

export const CreateSubjectScreen = React.memo(function CreateSubjectScreen({
  onSuccess,
  onBack,
}: CreateSubjectScreenProps) {
  const {
    newSubjectName,
    setNewSubjectName,
    newSubjectDescription,
    setNewSubjectDescription,
    error,
    isCreating,
    handleCreateSubject,
    reset,
  } = useCreateSubjectForm({
    onSuccess: () => {
      reset();
      if (onSuccess) {
        onSuccess();
      } else if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)/subjects");
      }
    },
  });

  const handleSubmit = async () => {
    if (!newSubjectName.trim()) return;
    await handleCreateSubject();
  };

  return (
    <AppScreen
      edges={["top"]}
      header={
        <CommonHeader onBack={onBack} fallbackRoute="/(tabs)/subjects" />
      }
      contentContainerClassName="px-5 pt-4 pb-16"
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-6">
        <Text variant="h2">Create a new subject</Text>
        <Text variant="muted" className="mt-1">
          Set it up in a few simple steps. You can always change this later.
        </Text>
      </View>

      <View className="mb-4">
        <Text variant="subhead" className="mb-1.5">
          Subject name
        </Text>
        <Input
          value={newSubjectName}
          onChangeText={setNewSubjectName}
          placeholder="e.g. Biology or Mathematics"
          placeholderTextColor={APP_COLORS.stone400}
          className="bg-card border border-border rounded-xl px-4 h-12 text-sm text-foreground shadow-sm"
          editable={!isCreating}
        />
      </View>

      <View className="mb-5">
        <Text variant="subhead" className="mb-1.5">
          Description (optional)
        </Text>
        <Input
          value={newSubjectDescription}
          onChangeText={setNewSubjectDescription}
          placeholder="e.g. Topics, syllabus overview or notes summary"
          placeholderTextColor={APP_COLORS.stone400}
          multiline={true}
          numberOfLines={3}
          className="bg-card border border-border rounded-xl px-4 py-3 min-h-[90px] text-sm text-foreground shadow-sm"
          editable={!isCreating}
        />
      </View>

      <PlantDoodle />

      <Button
        title="Create subject"
        icon="arrow-right"
        iconPosition="right"
        isLoading={isCreating}
        disabled={isCreating || !newSubjectName.trim()}
        variant="quiz"
        className="rounded-full h-12 mt-3 bg-blue-600 active:bg-blue-700 shadow-md"
        onPress={handleSubmit}
      />
    </AppScreen>
  );
});
