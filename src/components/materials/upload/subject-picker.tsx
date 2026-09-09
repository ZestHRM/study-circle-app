import { CreateSubjectCard } from "@/components/ui/create-subject-card";
import { Button } from "@/components/ui/button";
import { SubjectSelectDropdown } from "@/components/ui/subject-select-dropdown";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import type { Subject } from "@/lib/api";
import { createSubjectSchema } from "@/schemas";
import { Feather } from "@expo/vector-icons";
import * as React from "react";
import { Spinner } from "@/components/ui/spinner";
import { View } from "react-native";

interface SubjectPickerProps {
  subjects: Subject[];
  selectedSubjectId: string;
  onSelectSubject: (subjectId: string) => void;
  onCreateSubject: (name: string) => Promise<void>;
  isLoading?: boolean;
  isCreating?: boolean;
  error?: string | null;
}

export const SubjectPicker = React.memo(function SubjectPicker({
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
    const result = createSubjectSchema.safeParse({ name: newSubjectName });

    if (!result.success) {
      setLocalError(
        result.error.issues[0]?.message ?? "Subject name is required.",
      );
      return;
    }

    setLocalError(null);
    try {
      await onCreateSubject(result.data.name);
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
        <Text variant="subhead">Select Subject</Text>
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
        <Spinner variant="primary" message="Loading subjects..." containerStyle={{ paddingVertical: 16 }} />
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
        <SubjectSelectDropdown
          value={selectedSubjectId}
          onValueChange={(newVal) => {
            onSelectSubject(newVal);
            if (showInlineCreate) setShowInlineCreate(false);
          }}
          subjects={subjects}
          placeholder="Choose a subject..."
          triggerClassName="mt-1 h-14 px-5 rounded-2xl"
        />
      ) : null}

      {showInlineCreate ? (
        <CreateSubjectCard
          value={newSubjectName}
          onChangeText={(text) => {
            setNewSubjectName(text);
            if (localError) setLocalError(null);
          }}
          onSubmit={handleCreate}
          onClose={() => {
            setShowInlineCreate(false);
            setLocalError(null);
          }}
          isCreating={isCreating}
          error={localError || error}
        />
      ) : null}

      {error && !showInlineCreate ? (
        <Text variant="error">{error}</Text>
      ) : null}
    </View>
  );
});
