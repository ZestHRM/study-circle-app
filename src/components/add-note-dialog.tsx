import { AppBottomSheetScrollView } from "@/components/ui/app-bottom-sheet";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubjectSelectDropdown } from "@/components/ui/subject-select-dropdown";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { ApiError, subjectsApi, type Note, type Subject } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as React from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

import { addNoteSchema } from "@/schemas";

type AddNoteFormValue = {
  content: string;
  subjectId: string;
};

type AddNoteFormErrors = Partial<Record<keyof AddNoteFormValue, string>>;

function getInitialValues(editingNote?: Note | null): AddNoteFormValue {
  return {
    content: editingNote?.content ?? "",
    subjectId: editingNote?.subjectId ? String(editingNote.subjectId) : "",
  };
}

function toSelectOptions(
  subjects: Subject[],
): Array<{ value: string; label: string }> {
  return subjects.map((subject) => ({
    value: String(subject.id),
    label: subject.name,
  }));
}

function validateForm(values: AddNoteFormValue): AddNoteFormErrors {
  const parseResult = addNoteSchema.safeParse(values);
  if (parseResult.success) return {};

  const fieldErrors: AddNoteFormErrors = {};
  for (const issue of parseResult.error.issues) {
    const field = issue.path[0] as keyof AddNoteFormValue;
    if (field && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }
  return fieldErrors;
}

export function AddNoteDialog({
  open,
  onOpenChange,
  editingNote,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingNote?: Note | null;
  onSubmit: (payload: {
    content: string;
    subjectId: number;
  }) => Promise<void>;
  submitting: boolean;
}) {
  const router = useRouter();
  const { token } = useAuth();
  const [values, setValues] = React.useState<AddNoteFormValue>(() =>
    getInitialValues(editingNote),
  );
  const [errors, setErrors] = React.useState<AddNoteFormErrors>({});
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const resetForm = React.useCallback(() => {
    setValues(getInitialValues(null));
    setErrors({});
    setSubmitError(null);
  }, []);

  const subjectsQuery = useQuery({
    queryKey: ["subjects", token],
    queryFn: async () =>
      subjectsApi.list(token as string, {
        page: 1,
        limit: 200,
      }),
    enabled: open && Boolean(token),
  });

  const subjectOptions = React.useMemo(
    () => toSelectOptions(subjectsQuery.data?.data ?? []),
    [subjectsQuery.data?.data],
  );

  const onDialogOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        resetForm();
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange, resetForm],
  );

  async function onFormSubmit() {
    const validationErrors = validateForm(values);
    setErrors(validationErrors);
    setSubmitError(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      await onSubmit({
        content: values.content.trim(),
        subjectId: Number(values.subjectId),
      });
      onDialogOpenChange(false);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Unable to submit note right now.";
      setSubmitError(message);
    }
  }

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onDialogOpenChange}>
      <DialogContent>
        {/* Dialog Header */}
        <View className="flex-row items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <View className="flex-1 pr-2">
            <Text variant="h2">
              {editingNote ? "Edit Note" : "Add New Note"}
            </Text>
            <Text variant="muted" className="mt-0.5">
              {editingNote
                ? "Update your custom note details"
                : "Create a custom note for your study subject"}
            </Text>
          </View>
          <Pressable
            onPress={() => onDialogOpenChange(false)}
            disabled={submitting}
            className="p-1.5 rounded-full bg-stone-100 dark:bg-stone-800 active:opacity-70"
          >
            <Feather name="x" size={18} color={APP_COLORS.stone500} />
          </Pressable>
        </View>

        <AppBottomSheetScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled
          contentContainerStyle={{ gap: 16, paddingTop: 12, paddingBottom: 24 }}
        >
          {/* Subject Field & Inline Create */}
          <FormField label="Subject" required error={errors.subjectId}>
            <View className="gap-2 mt-1">
              <SubjectSelectDropdown
                value={values.subjectId}
                onValueChange={(val) => {
                  setValues((current) => ({
                    ...current,
                    subjectId: val,
                  }));
                  if (errors.subjectId) {
                    setErrors((current) => ({
                      ...current,
                      subjectId: undefined,
                    }));
                  }
                }}
                subjects={subjectOptions}
                isLoading={subjectsQuery.isLoading}
                placeholder="Choose a subject..."
                triggerClassName="bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-2xl h-14 px-5 shadow-2xs"
              />

              {subjectsQuery.isError ? (
                <Text variant="error" className="text-xs">
                  Failed to load subjects. Please try again.
                </Text>
              ) : null}

              {/* Add New Subject Action Button */}
              <Button
                variant="ghost"
                onPress={() => {
                  onDialogOpenChange(false);
                  router.push("/create-subject");
                }}
                className="self-start flex-row items-center gap-1.5 bg-[#F3E8FF] px-3.5 py-1.5 h-8.5 rounded-full mt-1"
              >
                <Feather
                  name="plus"
                  size={14}
                  color={APP_COLORS.primaryDark}
                />
                <Text className="text-xs font-semibold text-[#7C3AED]">
                  Create New Subject
                </Text>
              </Button>
            </View>
          </FormField>

          {/* Note Content Field */}
          <FormField label="Note Content" required error={errors.content}>
            <Input
              value={values.content}
              onChangeText={(text) => {
                setValues((current) => ({ ...current, content: text }));
                if (errors.content) {
                  setErrors((current) => ({
                    ...current,
                    content: undefined,
                  }));
                }
              }}
              editable={!submitting}
              placeholder="Write or paste your note content here..."
              placeholderTextColor="#A8A29E"
              multiline
              numberOfLines={6}
              className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl p-4 text-base font-medium text-stone-900 dark:text-stone-100 h-36 mt-1 shadow-2xs"
              textAlignVertical="top"
            />
          </FormField>

          {submitError ? (
            <Text variant="error" className="text-center">
              {submitError}
            </Text>
          ) : null}

          {/* Footer Action Buttons */}
          <View className="flex-row items-center gap-3 pt-2">
            <Button
              variant="outline"
              title="Cancel"
              onPress={() => onDialogOpenChange(false)}
              disabled={submitting}
              className="flex-1 h-12 rounded-xl justify-center items-center"
            />
            <Button
              variant="terracotta"
              title={
                submitting
                  ? "Saving Note..."
                  : editingNote
                    ? "Update Note"
                    : "Save Note"
              }
              loading={submitting}
              onPress={onFormSubmit}
              disabled={submitting || subjectsQuery.isLoading}
              className="flex-1 h-12 rounded-xl justify-center items-center"
            />
          </View>
        </AppBottomSheetScrollView>
      </DialogContent>
    </Dialog>
  );
}
