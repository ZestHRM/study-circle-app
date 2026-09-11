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
  const [selectedCourse, setSelectedCourse] = React.useState("JEE (Main)");
  const [selectedThemeIndex, setSelectedThemeIndex] = React.useState(0);
  const [examDate, setExamDate] = React.useState("");
  const [showCoursePicker, setShowCoursePicker] = React.useState(false);

  const {
    newSubjectName,
    setNewSubjectName,
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
          placeholderTextColor="#A8A29E"
          className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 h-12 text-sm text-stone-900 dark:text-stone-100 shadow-sm"
          editable={!isCreating}
        />
      </View>

      <View className="mb-4">
        <Text variant="subhead" className="mb-1.5">
          Course / Exam
        </Text>
        <Pressable
          onPress={() => setShowCoursePicker(!showCoursePicker)}
          className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 h-12 flex-row items-center justify-between shadow-sm"
        >
          <Text variant="p">{selectedCourse}</Text>
          <Icon name="chevron-down" size={18} color={APP_COLORS.stone500} />
        </Pressable>

        {showCoursePicker ? (
          <View className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-2 mt-2 shadow-md">
            {PRESET_COURSES.map((course) => (
              <Pressable
                key={course}
                onPress={() => {
                  setSelectedCourse(course);
                  setShowCoursePicker(false);
                }}
                className={`px-4 py-2.5 rounded-xl flex-row items-center justify-between ${
                  selectedCourse === course
                    ? "bg-blue-50 dark:bg-blue-950/40"
                    : "active:bg-stone-100 dark:active:bg-stone-800"
                }`}
              >
                <Text
                  variant={selectedCourse === course ? "h4" : "subhead"}
                  className={
                    selectedCourse === course
                      ? "text-blue-600 dark:text-blue-400"
                      : ""
                  }
                >
                  {course}
                </Text>
                {selectedCourse === course ? (
                  <Icon name="check" size={16} color={APP_COLORS.quizBlue} />
                ) : null}
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <View className="mb-4">
        <Text variant="subhead" className="mb-2">
          Choose a colour & icon
        </Text>
        <View className="flex-row items-center justify-between">
          {PRESET_THEMES.map((theme, idx) => {
            const isSelected = selectedThemeIndex === idx;
            return (
              <Pressable
                key={theme.name}
                onPress={() => setSelectedThemeIndex(idx)}
                style={{ backgroundColor: theme.bgHex }}
                className={`w-12 h-12 rounded-full items-center justify-center border-2 ${
                  isSelected
                    ? "border-blue-600 scale-105 shadow-sm"
                    : "border-transparent opacity-80"
                }`}
              >
                <Icon
                  name={theme.icon}
                  size={22}
                  color={theme.colorHex}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="mb-5">
        <Text variant="subhead" className="mb-1.5">
          Your exam date (optional)
        </Text>
        <View className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 h-12 flex-row items-center gap-3 shadow-sm">
          <Icon name="calendar" size={16} color={APP_COLORS.stone400} />
          <Input
            value={examDate}
            onChangeText={setExamDate}
            placeholder="Select date"
            placeholderTextColor="#A8A29E"
            className="flex-1 h-full text-sm text-stone-900 dark:text-stone-100 border-0 p-0"
          />
        </View>
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
