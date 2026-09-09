import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import * as React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

export interface CreateSubjectCardProps {
  /** Text input value for the new subject name */
  value: string;
  /** Callback when subject name text changes */
  onChangeText: (text: string) => void;
  /** Callback fired when user submits the new subject */
  onSubmit: () => void;
  /** Callback fired when user closes the subject creation card */
  onClose: () => void;
  /** Loading/creating mutation state */
  isCreating?: boolean;
  /** Optional error message */
  error?: string | null;
}

/**
 * Reusable Create Subject Card component.
 * Provides a standardized inline UI for adding new subjects across dialogs and pickers.
 */
export const CreateSubjectCard = React.memo(function CreateSubjectCard({
  value,
  onChangeText,
  onSubmit,
  onClose,
  isCreating = false,
  error,
}: CreateSubjectCardProps) {
  return (
    <View className="bg-white dark:bg-stone-900 rounded-2xl p-4 gap-3 border border-stone-200 dark:border-stone-700 shadow-sm mt-1">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Feather name="star" size={16} color={APP_COLORS.warning} />
          <Text variant="subhead">Create New Subject</Text>
        </View>
        <Pressable onPress={onClose} className="p-1 active:opacity-70">
          <Feather name="x" size={16} color={APP_COLORS.stone500} />
        </Pressable>
      </View>

      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder="e.g. Physics or Mathematics"
        placeholderTextColor="#A8A29E"
        className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 h-12 text-sm text-stone-900 dark:text-stone-100"
        editable={!isCreating}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />

      {error ? <Text variant="error">{error}</Text> : null}

      <Button
        onPress={onSubmit}
        disabled={isCreating}
        style={{ backgroundColor: APP_COLORS.primary }}
        className="rounded-full h-11 flex-row items-center justify-center gap-1.5 border-0"
      >
        {isCreating ? (
          <ActivityIndicator size="small" color={APP_COLORS.white} />
        ) : (
          <Feather name="plus" size={14} color={APP_COLORS.white} />
        )}
        <Text className="text-xs font-bold text-white">
          Create & Select Subject
        </Text>
      </Button>
    </View>
  );
});
