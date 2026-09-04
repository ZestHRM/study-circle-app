import { useAuth } from '@/lib/auth';
import { studyMaterialsApi } from '@/services';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import * as React from 'react';
import { Alert } from 'react-native';

export function useStudyMaterialsInfinite(options?: {
  limit?: number;
  search?: string;
}) {
  const { token } = useAuth();
  const limit = options?.limit ?? 8;
  const search = options?.search;

  const query = useInfiniteQuery({
    queryKey: ['study-materials', token, limit, search],
    queryFn: async ({ pageParam = 1 }) =>
      studyMaterialsApi.list(token as string, {
        page: pageParam as number,
        limit,
        search,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.pagination.page ?? 1;
      const totalPages =
        lastPage.pagination.totalPages ??
        Math.ceil((lastPage.pagination.totalItems ?? 0) / limit);
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: Boolean(token),
  });

  const materials = React.useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data]
  );

  const isRefreshing = query.isRefetching && !query.isFetchingNextPage;

  const fetchNextPage = React.useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage && !query.isLoading) {
      void query.fetchNextPage();
    }
  }, [query]);

  const refetch = React.useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    materials,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    isRefreshing,
    hasNextPage: Boolean(query.hasNextPage),
    fetchNextPage,
    refetch,
  };
}

export function useCreateStudyMaterial() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      description?: string;
      subjectId: string;
      file: {
        uri: string;
        name: string;
        type: string;
      };
    }) => {
      return studyMaterialsApi.create(token as string, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['study-materials'],
      });
      Alert.alert('Success', 'Study material created successfully.');
    },
  });
}

export function useDeleteStudyMaterial() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return studyMaterialsApi.delete(token as string, id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['study-materials'],
      });
    },
  });
}
