import { showSuccessToast } from "@/lib/utils/toast";
import { notesApi, type StudyMaterial } from "@/services";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as React from "react";

export function useNotesQuery(params: {
  page: number;
  limit?: number;
  search?: string;
  subjectId?: string;
}) {
  const limit = params.limit ?? 8;

  const query = useQuery({
    queryKey: ["notes", params.page, limit, params.search, params.subjectId],
    queryFn: async () =>
      notesApi.list({
        page: params.page,
        limit,
        search: params.search || undefined,
        subjectId: params.subjectId || undefined,
      }),
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
  const limit = params?.limit ?? 8;
  const search = params?.search;
  const subjectId = params?.subjectId;

  const query = useInfiniteQuery({
    queryKey: ["notes-infinite", limit, search, subjectId],
    queryFn: async ({ pageParam = 1 }) =>
      notesApi.list({
        page: pageParam as number,
        limit,
        search: search || undefined,
        subjectId: search || undefined,
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
  });

  const notes = React.useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data],
  );

  const totalItems =
    query.data?.pages[0]?.pagination.totalItems ?? notes.length;
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { content: string; subjectId: number }) => {
      return notesApi.create(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
      showSuccessToast("Success", "Note created successfully.");
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      content: string;
      subjectId: number;
    }) => {
      return notesApi.update(payload.id, {
        content: payload.content,
        subjectId: payload.subjectId,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
      showSuccessToast("Success", "Note updated successfully.");
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return notesApi.delete(id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useStudyNotesQuery(notesId?: string | null) {
  return useQuery({
    queryKey: ["study-notes-detail", notesId],
    queryFn: async () => {
      if (!notesId) return null;
      const res = await notesApi.getById(notesId);
      return res.data;
    },
    enabled: Boolean(notesId),
  });
}

export function useStudyMaterialNotesQuery(
  materialInput?: StudyMaterial | string | null,
) {
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
      explicitNotesId,
      materialId,
      Boolean(fileContent),
    ],
    queryFn: async () => {
      const objInput =
        typeof materialInput === "object" && materialInput !== null
          ? (materialInput as any)
          : null;

      // Strategy 0: Direct embedded notes content on material object
      const embeddedContent =
        objInput?.notes?.[0]?.content ||
        (Array.isArray(objInput?.notes) ? objInput?.notes[0]?.content : null) ||
        objInput?.processedNotes ||
        objInput?.notesContent;

      if (
        embeddedContent &&
        typeof embeddedContent === "string" &&
        embeddedContent.trim().length > 0
      ) {
        return {
          content: embeddedContent,
          title: objInput?.title || "Notes Detail",
          subjectName: objInput?.subject?.name || "General",
          createdAt: objInput?.createdAt,
        };
      }

      // Strategy 1: Try explicit notes ID if available
      if (explicitNotesId) {
        try {
          const notesRes = await notesApi.getById(explicitNotesId);
          const rawNote = notesRes?.data || notesRes;
          if (rawNote?.content) {
            return {
              content: rawNote.content,
              title:
                rawNote.studyMaterial?.title ||
                objInput?.title ||
                "Notes Detail",
              subjectName:
                rawNote.subject?.name ||
                rawNote.studyMaterial?.subject?.name ||
                objInput?.subject?.name,
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
          const listRes = await notesApi.list({ page: 1, limit: 100 });
          const rawList =
            listRes?.data || (Array.isArray(listRes) ? listRes : []);
          const found = rawList.find(
            (n: any) => n.studyMaterialId === materialId || n.id === materialId,
          );
          if (found?.id) {
            if (found.content && found.content.trim().length > 0) {
              return {
                content: found.content,
                title:
                  found.studyMaterial?.title ||
                  objInput?.title ||
                  "Notes Detail",
                subjectName:
                  found.subject?.name ||
                  (found.studyMaterial as any)?.subject?.name ||
                  objInput?.subject?.name,
                createdAt: found.createdAt,
              };
            }

            const detailRes = await notesApi.getById(found.id);
            const rawDetail = detailRes?.data || detailRes;
            if (rawDetail?.content) {
              return {
                content: rawDetail.content,
                title:
                  rawDetail.studyMaterial?.title ||
                  objInput?.title ||
                  "Notes Detail",
                subjectName:
                  rawDetail.subject?.name ||
                  rawDetail.studyMaterial?.subject?.name ||
                  objInput?.subject?.name,
                createdAt: rawDetail.createdAt,
              };
            }
          }
        } catch {
          // Fall through to strategy 3
        }

        // Strategy 3: Try materialId directly as notesId
        try {
          const directRes = await notesApi.getById(materialId);
          const rawDirect = directRes?.data || directRes;
          if (rawDirect?.content) {
            return {
              content: rawDirect.content,
              title:
                rawDirect.studyMaterial?.title ||
                objInput?.title ||
                "Notes Detail",
              subjectName:
                rawDirect.subject?.name ||
                rawDirect.studyMaterial?.subject?.name ||
                objInput?.subject?.name,
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
          title: objInput?.title || "Notes Detail",
          subjectName: objInput?.subject?.name || "General",
          createdAt: objInput?.createdAt,
        };
      }

      return null;
    },
    enabled: Boolean(explicitNotesId || materialId || fileContent),
    staleTime: 1000 * 60 * 5,
  });
}
