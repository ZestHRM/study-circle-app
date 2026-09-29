import { showSuccessToast } from "@/lib/utils/toast";
import { examMaterialsApi, type ExamMaterialCategory } from "@/services/exam-materials-service";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as React from "react";

export function useExamMaterialsInfinite(options?: {
  limit?: number;
  search?: string;
  category?: ExamMaterialCategory;
  subjectId?: string;
}) {
  const limit = options?.limit ?? 8;
  const search = options?.search;
  const category = options?.category;
  const subjectId = options?.subjectId;

  const query = useInfiniteQuery({
    queryKey: ["exam-materials", limit, search, category, subjectId],
    queryFn: async ({ pageParam = 1 }) =>
      examMaterialsApi.list({
        page: pageParam as number,
        limit,
        search,
        category,
        subjectId,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.data || lastPage.data.length === 0) {
        return undefined;
      }
      const currentPage = lastPage.pagination.page ?? 1;
      const totalPages =
        lastPage.pagination.totalPages ??
        Math.ceil((lastPage.pagination.totalItems ?? 0) / limit);
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });

  const materials = React.useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data],
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

export function useExamMaterialDetail(id?: string | null) {
  return useQuery({
    queryKey: ["exam-material-detail", id],
    queryFn: async () => {
      if (!id) return null;
      return examMaterialsApi.getById(id);
    },
    enabled: Boolean(id),
  });
}

export function useCreateExamMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      description?: string;
      examCategory: ExamMaterialCategory;
      subjectId: string | number;
      year?: string;
      file: {
        uri: string;
        name: string;
        type: string;
      };
    }) => {
      return examMaterialsApi.create(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["exam-materials"],
      });
      showSuccessToast(
        "Exam Material Uploaded",
        "Your exam paper has been uploaded successfully.",
      );
    },
  });
}

export function useImportantTopicsQuery(params?: {
  examPaperId?: string;
  subjectId?: string | number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ["important-topics", params],
    queryFn: async () => examMaterialsApi.getImportantTopics(params),
  });
}

export function useParseQuestionsMutation() {
  return useMutation({
    mutationFn: async (file: { uri: string; name: string; type: string }) => {
      return examMaterialsApi.parseQuestions(file);
    },
  });
}

export function useCreateExamPaperMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      description?: string;
      subjectId: string | number;
      year?: string | number;
      grade?: string;
      questions: string[];
    }) => {
      return examMaterialsApi.createExamPaper(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["exam-materials"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["important-topics"],
      });
      showSuccessToast(
        "Exam Paper Created",
        "Your exam paper has been created successfully.",
      );
    },
  });
}

export function useDeleteExamMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return examMaterialsApi.delete(id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["exam-materials"],
      });
      showSuccessToast(
        "Exam Material Deleted",
        "The exam material has been deleted successfully.",
      );
    },
  });
}
