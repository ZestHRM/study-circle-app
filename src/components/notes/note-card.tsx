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
      className="bg-card border border-border rounded-3xl p-4.5 gap-3.5 shadow-xs active:opacity-95"
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
              className="text-base font-bold text-foreground"
              numberOfLines={1}
            >
              {note.subject?.name ?? "General Subject"}
            </Text>
            <Text className="text-xs text-muted-foreground font-medium mt-0.5">
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
        className="text-sm text-muted-foreground leading-6 font-normal"
        numberOfLines={3}
      >
        {plainText || "No preview available."}
      </Text>

      {/* Footer Info & Quick Action Buttons */}
      <View className="flex-row items-center justify-between pt-2 border-t border-border">
        <View className="flex-row items-center gap-2">
          <Badge label={`${words} words`} variant="outline" />
          <Badge label="Auto-saved" variant="emerald" icon="check" />
        </View>

        <View className="flex-row items-center gap-1">
          {/* Quick Read Button */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-xl bg-muted"
            onPress={handleOpenDetails}
          >
            <Icon name="eye" size={14} color="muted" />
          </Button>

          {/* Edit Button */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-xl bg-muted"
            onPress={handleEdit}
            disabled={isSubmitting || isDeleting}
          >
            <Icon name="edit-2" size={14} color="primary" />
          </Button>

          {/* Delete Button */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-xl bg-muted"
            onPress={handleDelete}
            disabled={isSubmitting || isDeleting}
          >
            <Icon name="trash-2" size={14} color="error" />
          </Button>
        </View>
      </View>
    </Pressable>
  );
});
