import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { formatShortDate } from "@/lib/utils/formatters";
import type { StudyMaterial } from "@/services";
import { useRouter } from "expo-router";
import * as React from "react";
import { Pressable, View } from "react-native";

interface MaterialCardProps {
  material: StudyMaterial;
  onReadNotes: (material: StudyMaterial) => void;
  onTakeQuiz: (material: StudyMaterial) => void;
  onDelete: (material: StudyMaterial) => void;
  isDeleting?: boolean;
}

export function isNotesReady(material: StudyMaterial): boolean {
  return Boolean(
    material.notesId ||
    (material.notes && material.notes.length > 0) ||
    material.processedNotes ||
    material.status === "PROCESSED" ||
    material.status === "NOTES_GENERATED" ||
    material.files?.some(
      (f) =>
        f.status === "NOTES_GENERATED" ||
        f.status === "PROCESSED" ||
        Boolean(f.content && f.content.trim().length > 10),
    ),
  );
}

export function isQuizReady(material: StudyMaterial): boolean {
  return Boolean(
    material.quizId ||
    (material.quizzes && material.quizzes.length > 0) ||
    material.quizStatus === "GENERATED" ||
    material.files?.some((f) => f.quizStatus === "GENERATED"),
  );
}

export function isFailed(material: StudyMaterial): boolean {
  return Boolean(
    material.status === "PROCESSING_FAILED" ||
    material.status === "NOTES_GENERATION_FAILED" ||
    material.quizStatus === "GENERATION_FAILED" ||
    material.files?.some(
      (f) =>
        f.status === "PROCESSING_FAILED" ||
        f.status === "NOTES_GENERATION_FAILED" ||
        f.quizStatus === "GENERATION_FAILED",
    ),
  );
}

export function getFailedMessage(material: StudyMaterial): string {
  const failedFile = material.files?.find(
    (f) =>
      f.status === "PROCESSING_FAILED" ||
      f.status === "NOTES_GENERATION_FAILED" ||
      f.quizStatus === "GENERATION_FAILED",
  );
  if (failedFile?.errorMessage) return failedFile.errorMessage;
  if (material.status === "NOTES_GENERATION_FAILED")
    return "AI notes generation failed";
  if (material.status === "PROCESSING_FAILED") return "File processing failed";
  if (material.quizStatus === "GENERATION_FAILED")
    return "Quiz generation failed";
  return "Processing failed";
}

function getFileTypeInfo(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes(".pdf") || lower.includes("pdf")) {
    return {
      bgClass: "bg-red-100 dark:bg-red-950/60",
      textClass: "text-red-600 dark:text-red-400",
      iconColor: "#DC2626",
    };
  }
  if (
    lower.includes(".docx") ||
    lower.includes(".doc") ||
    lower.includes("doc")
  ) {
    return {
      bgClass: "bg-blue-100 dark:bg-blue-950/60",
      textClass: "text-blue-600 dark:text-blue-400",
      iconColor: "#2563EB",
    };
  }
  if (
    lower.includes(".pptx") ||
    lower.includes(".ppt") ||
    lower.includes("ppt") ||
    lower.includes("slides")
  ) {
    return {
      bgClass: "bg-purple-100 dark:bg-purple-950/60",
      textClass: "text-purple-600 dark:text-purple-400",
      iconColor: "#9333EA",
    };
  }
  return {
    bgClass: "bg-amber-100 dark:bg-amber-950/60",
    textClass: "text-amber-600 dark:text-amber-400",
    iconColor: "#B45309",
  };
}

function getSubjectTagStyle(subjectName: string) {
  const lower = subjectName.toLowerCase();
  if (
    lower.includes("math") ||
    lower.includes("calculus") ||
    lower.includes("algebra")
  ) {
    return "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300";
  }
  if (
    lower.includes("computer") ||
    lower.includes("tech") ||
    lower.includes("code") ||
    lower.includes("dbms")
  ) {
    return "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300";
  }
  if (
    lower.includes("physic") ||
    lower.includes("bio") ||
    lower.includes("science")
  ) {
    return "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300";
  }
  return "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300";
}

export const MaterialCard = React.memo(function MaterialCard({
  material,
  onReadNotes,
  onTakeQuiz,
  onDelete,
  isDeleting = false,
}: MaterialCardProps) {
  const notesReady = isNotesReady(material);
  const quizReady = isQuizReady(material);
  const failed = isFailed(material);
  const fileType = getFileTypeInfo(material.title);
  const subjectName = material.subject?.name ?? "General";
  const subjectTagStyle = getSubjectTagStyle(subjectName);

  const router = useRouter();

  const handleCardPress = React.useCallback(() => {
    // Navigate to material detail page (3-tab screen)
    router.push(`/materials/${material.id}` as any);
  }, [router, material.id]);

  const handleDeletePress = React.useCallback(() => {
    onDelete(material);
  }, [onDelete, material]);

  return (
    <Pressable
      onPress={handleCardPress}
      className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 gap-3 shadow-2xs active:opacity-95"
    >
      {/* Top Header Row: File Type Badge + Subject & Title + Status & Options */}
      <View className="flex-row items-start justify-between gap-3">
        {/* Left: Square File Type Badge Icon */}
        <View
          className={`w-12 h-12 rounded-2xl items-center justify-center ${fileType.bgClass}`}
        >
          <Icon name="file-text" size={20} color={fileType.iconColor} />
        </View>

        {/* Middle: Subject Pill + Title + Date/Size */}
        <View className="flex-1 pr-1 justify-center">
          {/* Subject Pill Tag */}
          <View
            className={`self-start px-2.5 py-0.5 rounded-full mb-1 ${subjectTagStyle}`}
          >
            <Text variant="caption" className="font-bold">{subjectName}</Text>
          </View>

          {/* Document Title */}
          <Text
            variant="h4"
            numberOfLines={1}
          >
            {material.title}
          </Text>

          {/* Meta row: Date • Size */}
          <View className="flex-row items-center gap-1.5 mt-1">
            <Icon name="calendar" size={12} color={APP_COLORS.stone400} />
            <Text variant="muted">
              {formatShortDate(material.createdAt)}
            </Text>
          </View>
        </View>

        {/* Right Side: 3-Dots Menu & Status Badge Pill */}
        <View className="items-end gap-2">
          <Pressable
            onPress={handleDeletePress}
            disabled={isDeleting}
            className="p-1 active:opacity-70"
            hitSlop={8}
          >
            <Icon
              name="more-horizontal"
              size={18}
              color={APP_COLORS.stone400}
            />
          </Pressable>

          {/* Status Badge: Failed / AI Ready / Quiz Ready / Processing */}
          {failed ? (
            <View className="bg-red-100 dark:bg-red-950/60 px-3 py-1 rounded-full flex-row items-center gap-1">
              <Icon name="alert-circle" size={12} color="#DC2626" />
              <Text className="text-xs font-bold text-red-600 dark:text-red-400">
                Failed
              </Text>
            </View>
          ) : notesReady ? (
            <View className="bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full flex-row items-center gap-1">
              <Icon name="check" size={12} color="#047857" />
              <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                AI Ready
              </Text>
            </View>
          ) : (
            <View className="bg-amber-100 dark:bg-amber-950/60 px-3 py-1 rounded-full flex-row items-center gap-1">
              <Icon name="clock" size={12} color="#B45309" />
              <Text className="text-xs font-bold text-amber-700 dark:text-amber-300">
                Processing
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Processing Progress Bar: Only when actively processing (not failed) */}
      {!notesReady && !failed ? (
        <View className="pt-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 h-2 rounded-full bg-amber-100 dark:bg-amber-950/40 overflow-hidden mr-2">
              <View
                style={{ width: "70%" }}
                className="h-full rounded-full bg-amber-500"
              />
            </View>
            <Text className="text-xs font-bold text-amber-600 dark:text-amber-400">
              70%
            </Text>
          </View>
        </View>
      ) : null}
    </Pressable>
  );
});
