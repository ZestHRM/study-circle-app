import { useAuth } from "@/lib/auth";
import { notesApi, type StudyMaterial } from "@/services";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as React from "react";
import { Alert } from "react-native";

export function useNotesQuery(params: {
  page: number;
  limit?: number;
  search?: string;
  subjectId?: string;
}) {
  const { token } = useAuth();
  const limit = params.limit ?? 8;

  const query = useQuery({
    queryKey: [
      "notes",
      token,
      params.page,
      limit,
      params.search,
      params.subjectId,
    ],
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

export function useNotesInfiniteQuery(params?: {
  limit?: number;
  search?: string;
  subjectId?: string;
}) {
  const { token } = useAuth();
  const limit = params?.limit ?? 8;
  const search = params?.search;
  const subjectId = params?.subjectId;

  const query = useInfiniteQuery({
    queryKey: ["notes-infinite", token, limit, search, subjectId],
    queryFn: async ({ pageParam = 1 }) =>
      notesApi.list(token as string, {
        page: pageParam as number,
        limit,
        search: search || undefined,
        subjectId: subjectId || undefined,
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

  const notes = React.useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data]
  );

  const totalItems = query.data?.pages[0]?.pagination.totalItems ?? notes.length;
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
    notes,
    totalItems,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    isRefreshing,
    hasNextPage: Boolean(query.hasNextPage),
    fetchNextPage,
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
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
      Alert.alert("Success", "Note created successfully.");
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
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
      Alert.alert("Success", "Note updated successfully.");
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
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useStudyNotesQuery(notesId?: string | null) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["study-notes-detail", token, notesId],
    queryFn: async () => {
      if (!notesId) return null;
      const res = await notesApi.getById(token as string, notesId);
      return res.data;
    },
    enabled: Boolean(token && notesId),
  });
}

export function useStudyMaterialNotesQuery(
  materialInput?: StudyMaterial | string | null,
) {
  const { token } = useAuth();

  const materialId =
    typeof materialInput === "string" ? materialInput : materialInput?.id;
  const explicitNotesId =
    typeof materialInput === "object" && materialInput !== null
      ? (materialInput as any).notesId ||
        (materialInput as any).noteId ||
        (Array.isArray((materialInput as any).notes)
          ? (materialInput as any).notes[0]?.id
          : (materialInput as any).notes?.id)
      : null;

  const fileContent =
    typeof materialInput === "object" && materialInput !== null
      ? (materialInput as any).files?.[0]?.content
      : null;

  return useQuery({
    queryKey: [
      "study-notes-detail",
      token,
      explicitNotesId,
      materialId,
      Boolean(fileContent),
    ],
    queryFn: async () => {
      if (!token) return null;

      // Strategy 1: Try explicit notes ID if available
      if (explicitNotesId) {
        try {
          const notesRes = await notesApi.getById(token, explicitNotesId);
          const rawNote = notesRes?.data || notesRes;
          if (rawNote?.content) {
            return {
              content: rawNote.content,
              title: rawNote.studyMaterial?.title || "Notes Detail",
              subjectName:
                rawNote.subject?.name ||
                rawNote.studyMaterial?.subject?.name,
              createdAt: rawNote.createdAt,
            };
          }
        } catch {
          // Fall through to strategy 2
        }
      }

      // Strategy 2: Search notes list by materialId
      if (materialId) {
        try {
          const listRes = await notesApi.list(token, { page: 1, limit: 50 });
          const rawList = listRes?.data || (Array.isArray(listRes) ? listRes : []);
          const found = rawList.find(
            (n: any) => n.studyMaterialId === materialId,
          );
          if (found?.id) {
            const detailRes = await notesApi.getById(token, found.id);
            const rawDetail = detailRes?.data || detailRes;
            if (rawDetail?.content) {
              return {
                content: rawDetail.content,
                title: rawDetail.studyMaterial?.title || "Notes Detail",
                subjectName:
                  rawDetail.subject?.name ||
                  rawDetail.studyMaterial?.subject?.name,
                createdAt: rawDetail.createdAt,
              };
            }
          }
        } catch {
          // Fall through to strategy 3
        }

        // Strategy 3: Try materialId directly as notesId
        try {
          const directRes = await notesApi.getById(token, materialId);
          const rawDirect = directRes?.data || directRes;
          if (rawDirect?.content) {
            return {
              content: rawDirect.content,
              title: rawDirect.studyMaterial?.title || "Notes Detail",
              subjectName:
                rawDirect.subject?.name ||
                rawDirect.studyMaterial?.subject?.name,
              createdAt: rawDirect.createdAt,
            };
          }
        } catch {
          // Fall through to strategy 4
        }
      }

      // Strategy 4: Fallback to extracted file content if available
      if (fileContent && fileContent.trim()) {
        return {
          content: fileContent,
          title: (materialInput as any)?.title || "Notes Detail",
          subjectName: (materialInput as any)?.subject?.name || "General",
          createdAt: (materialInput as any)?.createdAt,
        };
      }

      return null;
    },
    enabled: Boolean(
      token && (explicitNotesId || materialId || fileContent),
    ),
    staleTime: 1000 * 60 * 5,
  });
}
