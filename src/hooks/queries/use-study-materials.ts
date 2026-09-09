import { useAuth } from '@/lib/auth';
import { studyMaterialsApi, type StudyMaterial } from '@/services';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import * as React from 'react';

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
    refetchInterval: (query) => {
      const pages = query.state.data?.pages;
      if (!pages) return false;
      const allMaterials = pages.flatMap((p) => p.data ?? []);
      const isAnyProcessing = allMaterials.some((m) => {
        const isNotesProcessing =
          m.status === 'PENDING' ||
          m.status === 'PROCESSING' ||
          m.status === 'GENERATING_NOTES' ||
          m.files?.some((f) => f.status === 'PENDING' || f.status === 'PROCESSING');
        const isQuizProcessing =
          m.quizStatus === 'PENDING' || m.quizStatus === 'GENERATING';
        return isNotesProcessing || isQuizProcessing;
      });
      return isAnyProcessing ? 4000 : false;
    },
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

export function useStudyMaterialDetail(id?: string | null) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['study-material-detail', token, id],
    queryFn: async () => {
      if (!id) return null;
      return studyMaterialsApi.getById(token as string, id);
    },
    enabled: Boolean(token && id),
    refetchInterval: (query) => {
      const material = query.state.data;
      if (!material) return false;
      const isNotesProcessing =
        material.status === 'PENDING' ||
        material.status === 'PROCESSING' ||
        material.status === 'GENERATING_NOTES' ||
        material.files?.some((f) => f.status === 'PENDING' || f.status === 'PROCESSING');
      const isQuizProcessing =
        material.quizStatus === 'PENDING' || material.quizStatus === 'GENERATING';
      return isNotesProcessing || isQuizProcessing ? 3000 : false;
    },
  });
}

export function useCreateStudyMaterial() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      description?: string;
      subjectId: string | number;
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







