import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import type { Subject } from "@/lib/api";
import { Feather } from "@expo/vector-icons";
import * as React from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

interface SubjectPickerProps {
  subjects: Subject[];
  selectedSubjectId: string;
  onSelectSubject: (subjectId: string) => void;
  onCreateSubject: (name: string) => Promise<void>;
  isLoading?: boolean;
  isCreating?: boolean;
  error?: string | null;
}

export function SubjectPicker({
  subjects,
  selectedSubjectId,
  onSelectSubject,
  onCreateSubject,
  isLoading = false,
  isCreating = false,
  error,
}: SubjectPickerProps) {
  const [showInlineCreate, setShowInlineCreate] = React.useState(false);
  const [newSubjectName, setNewSubjectName] = React.useState("");
  const [localError, setLocalError] = React.useState<string | null>(null);

  const hasSubjects = subjects.length > 0;

  async function handleCreate() {
    const trimmed = newSubjectName.trim();
    if (!trimmed) {
      setLocalError("Subject name is required.");
      return;
    }
    setLocalError(null);
    try {
      await onCreateSubject(trimmed);
      setNewSubjectName("");
      setShowInlineCreate(false);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to create subject.";
      setLocalError(msg);
    }
  }

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text variant="subhead">
          Select Subject
        </Text>
        {hasSubjects && !showInlineCreate ? (
          <Button
            variant="ghost"
            onPress={() => setShowInlineCreate(true)}
            className="flex-row items-center gap-1.5 bg-[#F3E8FF] px-3 py-1.5 h-8 rounded-full"
          >
            <Feather name="plus" size={14} color={APP_COLORS.primaryDark} />
            <Text className="text-xs font-semibold text-[#7C3AED]">
              Add New Subject
            </Text>
          </Button>
        ) : null}
      </View>

      {isLoading ? (
        <View className="py-4 items-center justify-center">
          <ActivityIndicator size="small" color={APP_COLORS.primary} />
          <Text variant="muted" className="mt-1">
            Loading subjects...
          </Text>
        </View>
      ) : null}

      {!isLoading && !hasSubjects && !showInlineCreate ? (
        <View className="bg-[#F3E8FF]/60 rounded-2xl p-5 items-center justify-center gap-2 border border-[#DDD6FE]">
          <View className="w-10 h-10 rounded-full bg-[#DDD6FE] items-center justify-center">
            <Feather name="star" size={20} color={APP_COLORS.primaryDark} />
          </View>
          <Text variant="h4" className="text-center">
            No subjects available yet
          </Text>
          <Text variant="muted" className="text-center">
            Create your first subject below
          </Text>
          <Button
            onPress={() => setShowInlineCreate(true)}
            style={{ backgroundColor: APP_COLORS.primary }}
            className="mt-2 rounded-full px-5 py-2.5 flex-row items-center gap-1.5 border-0"
          >
            <Feather name="plus" size={14} color="#FFFFFF" />
            <Text className="text-xs font-semibold text-white">
              Add New Subject
            </Text>
          </Button>
        </View>
      ) : null}

      {!isLoading && hasSubjects ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
        >
          {subjects.map((subj, index) => {
            const isSelected = selectedSubjectId === subj.id;
            const styleTheme =
              APP_COLORS.subjectPalette[
                index % APP_COLORS.subjectPalette.length
              ];

            return (
              <Pressable
                key={subj.id}
                onPress={() => {
                  onSelectSubject(subj.id);
                  if (showInlineCreate) setShowInlineCreate(false);
                }}
                className={`px-4 py-2.5 rounded-full border flex-row items-center justify-center ${styleTheme.bg} ${
                  isSelected
                    ? `${styleTheme.border} border-2`
                    : "border-transparent"
                }`}
              >
                <Text className={`text-xs font-bold ${styleTheme.text}`}>
                  {subj.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {showInlineCreate ? (
        <View className="bg-white dark:bg-stone-900 rounded-2xl p-4 gap-3 border border-stone-200 dark:border-stone-700 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <Feather name="star" size={16} color={APP_COLORS.warning} />
              <Text variant="subhead">
                Add New Subject
              </Text>
            </View>
            {hasSubjects ? (
              <Pressable
                onPress={() => {
                  setShowInlineCreate(false);
                  setLocalError(null);
                }}
                className="p-1"
              >
                <Feather name="x" size={16} color="#78716C" />
              </Pressable>
            ) : null}
          </View>

          <Input
            value={newSubjectName}
            onChangeText={(text) => {
              setNewSubjectName(text);
              if (localError) setLocalError(null);
            }}
            placeholder="e.g. Physics"
            placeholderTextColor="#A8A29E"
            className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 h-12 text-sm text-stone-900 dark:text-stone-100"
            editable={!isCreating}
          />

          {localError || error ? (
            <Text variant="error">{localError || error}</Text>
          ) : null}

          <Button
            onPress={handleCreate}
            disabled={isCreating}
            style={{ backgroundColor: APP_COLORS.primary }}
            className="rounded-full h-11 flex-row items-center justify-center gap-1.5 border-0"
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Feather name="plus" size={14} color="#FFFFFF" />
            )}
            <Text className="text-xs font-bold text-white">
              Create & Select Subject
            </Text>
          </Button>
        </View>
      ) : null}

      {error && !showInlineCreate ? (
        <Text variant="error">{error}</Text>
      ) : null}
    </View>
  );
}
