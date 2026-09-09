import { useAuth } from '@/lib/auth';
import { quizzesApi } from '@/services';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import * as React from 'react';

export function useQuizzesInfiniteQuery(params?: {
  limit?: number;
  search?: string;
  subjectId?: string;
  status?: string;
}) {
  const { token } = useAuth();
  const limit = params?.limit ?? 8;
  const search = params?.search;
  const subjectId = params?.subjectId;
  const status = params?.status;

  const query = useInfiniteQuery({
    queryKey: ['quizzes-infinite', token, limit, search, subjectId, status],
    queryFn: async ({ pageParam = 1 }) =>
      quizzesApi.list(token as string, {
        page: pageParam as number,
        limit,
        search: search || undefined,
        subjectId: subjectId || undefined,
        status: status || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.data || lastPage.data.length === 0) {
        return undefined;
      }
      const currentPage =
        (lastPage.pagination as any).currentPage ??
        lastPage.pagination.page ??
        1;
      const totalPages =
        lastPage.pagination.totalPages ??
        Math.ceil((lastPage.pagination.totalItems ?? 0) / limit);
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: Boolean(token),
  });

  const quizzes = React.useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data]
  );

  const totalItems = query.data?.pages[0]?.pagination.totalItems ?? quizzes.length;
  const isRefreshing = query.isRefetching && !query.isFetchingNextPage;

  const fetchNextPage = React.useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage && !query.isLoading) {
      void query.fetchNextPage();
    }
  }, [query]);

  const refetch = React.useCallback(() => {
    void query.refetch();
  }, [query]);

  const isForbidden =
    (query.error as any)?.status === 403 ||
    (query.error as any)?.data?.code === 'FORBIDDEN';

  const forbiddenMessage =
    (query.error as any)?.data?.message ||
    (query.error as any)?.message ||
    'Access denied. Upgrade your plan to access this feature.';

  return {
    quizzes,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isForbidden,
    forbiddenMessage,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    isRefreshing,
    hasNextPage: Boolean(query.hasNextPage),
    fetchNextPage,
    refetch,
  };
}

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
