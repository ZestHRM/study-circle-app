import { useAuth } from '@/lib/auth';
import { quizzesApi } from '@/services';
import {
  keepPreviousData,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import * as React from 'react';

export function useQuizzesQuery(params: {
  page: number;
  limit?: number;
  search?: string;
  subjectId?: string;
  status?: string;
}) {
  const { token } = useAuth();
  const limit = params.limit ?? 8;

  const query = useQuery({
    queryKey: [
      'quizzes',
      token,
      params.page,
      limit,
      params.search,
      params.subjectId,
      params.status,
    ],
    queryFn: async () =>
      quizzesApi.list(token as string, {
        page: params.page,
        limit,
        search: params.search || undefined,
        subjectId: params.subjectId || undefined,
        status: params.status || undefined,
      }),
    enabled: Boolean(token),
    placeholderData: keepPreviousData,
  });

  const quizzes = query.data?.data ?? [];
  const totalItems = query.data?.pagination.totalItems ?? 0;
  const totalPages =
    query.data?.pagination.totalPages ??
    Math.max(1, Math.ceil(totalItems / limit));
  const isRefreshing = query.isFetching && !query.isLoading;

  const refetch = React.useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    quizzes,
    totalItems,
    totalPages,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isRefreshing,
    refetch,
  };
}

export function useStartQuizAttempt() {
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (quizId: string) =>
      quizzesApi.startAttempt(token as string, quizId),
  });
}
