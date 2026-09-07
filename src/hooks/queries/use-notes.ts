import { useAuth } from '@/lib/auth';
import { notesApi, type StudyMaterial } from '@/services';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import * as React from 'react';
import { Alert } from 'react-native';

export function useNotesQuery(params: {
  page: number;
  limit?: number;
  search?: string;
  subjectId?: string;
}) {
  const { token } = useAuth();
  const limit = params.limit ?? 8;

  const query = useQuery({
    queryKey: ['notes', token, params.page, limit, params.search, params.subjectId],
    queryFn: async () =>
      notesApi.list(token as string, {
        page: params.page,
        limit,
        search: params.search || undefined,
        subjectId: params.subjectId || undefined,
      }),
    enabled: Boolean(token),
    placeholderData: keepPreviousData,
  });

  const notes = query.data?.data ?? [];
  const totalItems = query.data?.pagination.totalItems ?? 0;
  const totalPages =
    query.data?.pagination.totalPages ??
    Math.max(1, Math.ceil(totalItems / limit));
  const isRefreshing = query.isFetching && !query.isLoading;

  const refetch = React.useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    notes,
    totalItems,
    totalPages,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isRefreshing,
    isError: query.isError,
    error: query.error,
    refetch,
  };
}

export function useCreateNote() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { content: string; subjectId: number }) => {
      return notesApi.create(token as string, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
      Alert.alert('Success', 'Note created successfully.');
    },
  });
}

export function useUpdateNote() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      content: string;
      subjectId: number;
    }) => {
      return notesApi.update(token as string, payload.id, {
        content: payload.content,
        subjectId: payload.subjectId,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
      Alert.alert('Success', 'Note updated successfully.');
    },
  });
}

export function useDeleteNote() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return notesApi.delete(token as string, id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useStudyNotesQuery(notesId?: string | null) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['study-notes-detail', token, notesId],
    queryFn: async () => {
      if (!notesId) return null;
      const res = await notesApi.getById(token as string, notesId);
      return res.data;
    },
    enabled: Boolean(token && notesId),
  });
}

export function useStudyMaterialNotesQuery(materialInput?: StudyMaterial | string | null) {
  const { token } = useAuth();

  const materialId = typeof materialInput === 'string' ? materialInput : materialInput?.id;
  const explicitNotesId =
    typeof materialInput === 'object' && materialInput !== null
      ? (materialInput as any).notesId ||
        (materialInput as any).noteId ||
        (Array.isArray((materialInput as any).notes)
          ? (materialInput as any).notes[0]?.id
          : (materialInput as any).notes?.id) ||
        (Array.isArray((materialInput as any).files)
          ? (materialInput as any).files[0]?.id
          : null)
      : null;

  const targetNotesId = explicitNotesId || materialId;

  return useQuery({
    queryKey: ['study-notes-detail', token, targetNotesId],
    queryFn: async () => {
      if (!targetNotesId) return null;
      console.log(`[useStudyMaterialNotesQuery] Calling Notes API in use-notes.ts: GET /notes/${targetNotesId}`);
      const notesRes = await notesApi.getById(token as string, targetNotesId);
      if (notesRes && notesRes.data) {
        return {
          content: notesRes.data.content,
          title: notesRes.data.studyMaterial?.title || 'Notes Detail',
          subjectName: notesRes.data.subject?.name || notesRes.data.studyMaterial?.subject?.name,
          createdAt: notesRes.data.createdAt,
        };
      }
      return null;
    },
    enabled: Boolean(token && targetNotesId),
    staleTime: 0,
  });
}

