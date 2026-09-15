import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { countWords, formatShortDate, toPlainText } from "@/lib/utils/formatters";
import { type Note } from "@/services";
import * as React from "react";
import { Pressable, View } from "react-native";

export interface NoteCardProps {
  note: Note;
  onOpenDetails: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  isSubmitting?: boolean;
  isDeleting?: boolean;
}

export const NoteCard = React.memo(function NoteCard({
  note,
  onOpenDetails,
  onEdit,
  onDelete,
  isSubmitting = false,
  isDeleting = false,
}: NoteCardProps) {
  const plainText = React.useMemo(
    () => toPlainText(note.content),
    [note.content],
  );
  const words = React.useMemo(() => countWords(note.content), [note.content]);
  const readingTimeMinutes = React.useMemo(
    () => Math.max(1, Math.ceil(words / 150)),
    [words],
  );
  const isAiGenerated = note.type === "GENERATED";

  const handleOpenDetails = React.useCallback(() => {
    onOpenDetails(note);
  }, [onOpenDetails, note]);

  const handleEdit = React.useCallback(() => {
    onEdit(note);
  }, [onEdit, note]);

  const handleDelete = React.useCallback(() => {
    onDelete(note);
  }, [onDelete, note]);

  return (
    <Pressable
      onPress={handleOpenDetails}
      className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-3xl p-4.5 gap-3.5 shadow-xs active:opacity-95"
    >
      {/* Top Header: Accent Pill + Subject & Note Type Badge */}
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-2.5 flex-1 pr-1">
          <View
            className={`w-2.5 h-8 rounded-full ${
              isAiGenerated ? "bg-purple-600" : "bg-blue-600"
            }`}
          />
          <View className="flex-1">
            <Text
              className="text-base font-bold text-stone-900 dark:text-stone-100"
              numberOfLines={1}
            >
              {note.subject?.name ?? "General Subject"}
            </Text>
            <Text className="text-xs text-stone-400 dark:text-stone-500 font-medium mt-0.5">
              {formatShortDate(note.createdAt)} • {readingTimeMinutes} min read
            </Text>
          </View>
        </View>

        <Badge
          icon={isAiGenerated ? "sparkles" : "edit-3"}
          label={isAiGenerated ? "✨ AI Summary" : "Custom"}
          variant={isAiGenerated ? "purple" : "blue"}
        />
      </View>

      {/* Snippet Content */}
      <Text
        className="text-sm text-stone-600 dark:text-stone-300 leading-6 font-normal"
        numberOfLines={3}
      >
        {plainText || "No preview available."}
      </Text>

      {/* Footer Info & Quick Action Buttons */}
      <View className="flex-row items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800/80">
        <View className="flex-row items-center gap-2">
          <Badge label={`${words} words`} variant="outline" />
          <Badge label="Auto-saved" variant="emerald" icon="check" />
        </View>

        <View className="flex-row items-center gap-1">
          {/* Quick Read Button */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-xl bg-stone-100 dark:bg-stone-800"
            onPress={handleOpenDetails}
          >
            <Icon name="eye" size={14} color={APP_COLORS.stone700} />
          </Button>

          {/* Edit Button */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-xl bg-stone-100 dark:bg-stone-800"
            onPress={handleEdit}
            disabled={isSubmitting || isDeleting}
          >
            <Icon name="edit-2" size={14} color={APP_COLORS.quizBlue} />
          </Button>

          {/* Delete Button */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-xl bg-stone-100 dark:bg-stone-800"
            onPress={handleDelete}
            disabled={isSubmitting || isDeleting}
          >
            <Icon name="trash-2" size={14} color={APP_COLORS.error} />
          </Button>
        </View>
      </View>
    </Pressable>
  );
});
