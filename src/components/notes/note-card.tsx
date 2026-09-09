import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { countWords, formatShortDate, toPlainText } from "@/lib/utils/formatters";
import { type Note } from "@/services";
import { Feather } from "@expo/vector-icons";
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
    [note.content]
  );
  const words = React.useMemo(() => countWords(note.content), [note.content]);
  const isAiGenerated = note.type === "GENERATED";

  return (
    <Pressable
      onPress={() => onOpenDetails(note)}
      className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4.5 gap-3.5 shadow-2xs active:opacity-95"
    >
      {/* Top Header: Subject & Note Type */}
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-2 flex-1 pr-1">
          <View
            className={`w-2 h-7 rounded-full ${
              isAiGenerated ? "bg-amber-500" : "bg-blue-500"
            }`}
          />
          <View className="flex-1">
            <Text
              className="text-base font-bold text-stone-900 dark:text-stone-100"
              numberOfLines={1}
            >
              {note.subject?.name ?? "General"}
            </Text>
            <Text className="text-xs text-stone-400 dark:text-stone-500 font-medium">
              {formatShortDate(note.createdAt)}
            </Text>
          </View>
        </View>

        <Badge
          icon={isAiGenerated ? "zap" : "edit-3"}
          label={isAiGenerated ? "AI Summary" : "Custom"}
          variant={isAiGenerated ? "amber" : "blue"}
        />
      </View>

      {/* Snippet Content */}
      <Text
        className="text-sm text-stone-600 dark:text-stone-300 leading-6 font-normal"
        numberOfLines={4}
      >
        {plainText || "No preview available."}
      </Text>

      {/* Footer Info & Quick Action Buttons */}
      <View className="flex-row items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800/80">
        <View className="flex-row items-center gap-2">
          <Badge label={`${words} words`} variant="outline" />
        </View>

        <View className="flex-row items-center gap-1">
          {/* Quick Read Button */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-lg"
            onPress={() => onOpenDetails(note)}
          >
            <Feather name="eye" size={14} color={APP_COLORS.iconLight} />
          </Button>

          {/* Edit Button */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-lg"
            onPress={() => onEdit(note)}
            disabled={isSubmitting || isDeleting}
          >
            <Feather name="edit-2" size={14} color={APP_COLORS.iconLight} />
          </Button>

          {/* Delete Button */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-lg"
            onPress={() => onDelete(note)}
            disabled={isSubmitting || isDeleting}
          >
            <Feather name="trash-2" size={14} color={APP_COLORS.error} />
          </Button>
        </View>
      </View>
    </Pressable>
  );
});
