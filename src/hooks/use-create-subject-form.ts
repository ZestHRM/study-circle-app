import { useCreateSubject, useSubjectsQuery } from "@/hooks/queries";
import { createSubjectSchema } from "@/schemas";
import * as React from "react";

export interface UseCreateSubjectFormOptions {
  onSuccess?: (subjectId: string, subjectName: string) => void;
}

/**
 * Custom hook to encapsulate and reuse subject creation logic across dialogs and pickers.
 * Handles Zod schema validation, duplicate subject checking, mutation execution, and state reset.
 */
export function useCreateSubjectForm(options?: UseCreateSubjectFormOptions) {
  const [showInlineCreate, setShowInlineCreate] = React.useState(false);
  const [newSubjectName, setNewSubjectName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const {
    subjects,
    isLoading: isLoadingSubjects,
    refetch: refetchSubjects,
  } = useSubjectsQuery();
  const createSubjectMutation = useCreateSubject();

  const handleCreateSubject = React.useCallback(
    async (overrideName?: string) => {
      const targetName = overrideName ?? newSubjectName;
      const result = createSubjectSchema.safeParse({ name: targetName });

      if (!result.success) {
        const msg =
          result.error.issues[0]?.message ?? "Subject name is required.";
        setError(msg);
        return null;
      }

      const trimmedName = result.data.name;

      // Duplicate check: Auto-select if a subject with the same name already exists
      const existing = subjects.find(
        (s) => s.name.trim().toLowerCase() === trimmedName.toLowerCase(),
      );

      if (existing) {
        const existingId = String(existing.id);
        setNewSubjectName("");
        setError(null);
        setShowInlineCreate(false);
        options?.onSuccess?.(existingId, existing.name);
        return existing;
      }

      try {
        setError(null);
        const created = await createSubjectMutation.mutateAsync({
          name: trimmedName,
        });

        if (created?.id) {
          const createdId = String(created.id);
          setNewSubjectName("");
          setError(null);
          setShowInlineCreate(false);
          await refetchSubjects();
          options?.onSuccess?.(createdId, created.name);
          return created;
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to create subject.";
        setError(msg);
      }
      return null;
    },
    [newSubjectName, subjects, createSubjectMutation, refetchSubjects, options],
  );

  const reset = React.useCallback(() => {
    setShowInlineCreate(false);
    setNewSubjectName("");
    setError(null);
  }, []);

  return {
    showInlineCreate,
    setShowInlineCreate,
    newSubjectName,
    setNewSubjectName,
    error,
    setError,
    isCreating: createSubjectMutation.isPending,
    isLoadingSubjects,
    handleCreateSubject,
    reset,
  };
}
