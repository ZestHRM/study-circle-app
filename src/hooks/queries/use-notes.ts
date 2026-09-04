import { useAuth } from '@/lib/auth';
import { notesApi } from '@/services';
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
