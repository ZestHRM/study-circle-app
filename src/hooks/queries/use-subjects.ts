import { useAuth } from "@/lib/auth";
import { showSuccessToast } from "@/lib/utils/toast";
import { subjectsApi, type Subject } from "@/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";

export function useSubjectsQuery(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { token } = useAuth();
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 200;

  const query = useQuery({
    queryKey: ["subjects", token, page, limit, params?.search],
    queryFn: async () =>
      subjectsApi.list(token as string, {
        page,
        limit,
        search: params?.search,
      }),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
  });

  const subjects = query.data?.data ?? [];
  const subjectOptions = React.useMemo(
    () =>
      subjects.map((subject: Subject) => ({
        value: String(subject.id),
        label: subject.name,
      })),
    [subjects],
  );

  const refetch = React.useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    subjects,
    subjectOptions,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch,
  };
}

export function useCreateSubject() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      description?: string;
      userId?: string;
    }) => {
      return subjectsApi.create(token as string, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["subjects"] });
      showSuccessToast("Success", "Subject created successfully.");
    },
  });
}
