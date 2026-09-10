import { Icon } from "@/components/ui/icon";
import { SelectionCard } from "@/components/ui/selection-card";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";

import type { Subject } from "@/services";
import { useRouter } from "expo-router";
import * as React from "react";
import { Pressable, View } from "react-native";

interface SubjectPickerProps {
  subjects: Subject[];
  selectedSubjectId: string;
  onSelectSubject: (subjectId: string) => void;
  onCreateSubject?: (name: string) => Promise<void>;
  isLoading?: boolean;
  isCreating?: boolean;
  error?: string | null;
}

export const SubjectPicker = React.memo(function SubjectPicker({
  subjects,
  selectedSubjectId,
  onSelectSubject,
  isLoading = false,
  error,
}: SubjectPickerProps) {
  const router = useRouter();

  return (
    <View className="gap-3">
      {isLoading ? (
        <Spinner
          variant="primary"
          message="Loading subjects..."
          containerStyle={{ paddingVertical: 24 }}
        />
      ) : null}

      {!isLoading && subjects.length > 0 ? (
        <View className="gap-3">
          {subjects.map((item) => {
            const isSelected = String(item.id) === String(selectedSubjectId);

            return (
              <SelectionCard
                key={String(item.id)}
                selected={isSelected}
                title={item.name}
                icon="book-open"
                onPress={() => {
                  onSelectSubject(String(item.id));
                }}
              />
            );
          })}
        </View>
      ) : null}

      {/* Card Option: Create New Subject */}
      <Pressable
        onPress={() => router.push("/create-subject")}
        className="py-3 px-3.5 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 flex-row items-center justify-between active:opacity-80 shadow-2xs"
      >
        <View className="flex-row items-center gap-3 flex-1 pr-2">
          <View className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 items-center justify-center border border-blue-200 dark:border-blue-800">
            <Icon name="plus" size="sm" color="primary" />
          </View>
          <View className="flex-1">
            <Text variant="h4">
              Create new subject
            </Text>
            <Text variant="caption" className="mt-0.5">
              Add a custom subject for your materials
            </Text>
          </View>
        </View>
        <Icon name="chevron-right" size="sm" color="muted" />
      </Pressable>

      {error ? (
        <Text variant="error" className="text-center">
          {error}
        </Text>
      ) : null}
    </View>
  );
});


