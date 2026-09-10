import { useAuth } from "@/lib/auth";
import {
  dashboardApi,
  type CreateDashboardCheckInPayload,
} from "@/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useDashboardStreak() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard", "streak", user?.id],
    queryFn: async () => dashboardApi.getStreak(),
    enabled: Boolean(user),
  });
}

export function useDashboardRecentActivity() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard", "recent-activity", user?.id],
    queryFn: async () => dashboardApi.getRecentActivity(),
    enabled: Boolean(user),
  });
}

export function useDashboardChartData(params: {
  startDate: string;
  endDate: string;
}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard", "chart-data", user?.id, params.startDate, params.endDate],
    queryFn: async () => dashboardApi.getChartData(params),
    enabled: Boolean(user) && Boolean(params.startDate) && Boolean(params.endDate),
  });
}

export function useDashboardCounts() {
  const { user } = useAuth();

  const studyMaterialsQuery = useQuery({
    queryKey: ["dashboard", "count", "study-materials", user?.id],
    queryFn: async () => dashboardApi.getStudyMaterialsCount(),
    enabled: Boolean(user),
  });

  const examMaterialsQuery = useQuery({
    queryKey: ["dashboard", "count", "exam-materials", user?.id],
    queryFn: async () => dashboardApi.getExamMaterialsCount(),
    enabled: Boolean(user),
  });

  const quizzesQuery = useQuery({
    queryKey: ["dashboard", "count", "quizzes", user?.id],
    queryFn: async () => dashboardApi.getQuizzesCount(),
    enabled: Boolean(user),
  });

  const studyCirclesQuery = useQuery({
    queryKey: ["dashboard", "count", "study-circles", user?.id],
    queryFn: async () => dashboardApi.getStudyCirclesCount(),
    enabled: Boolean(user),
  });

  const isLoading =
    studyMaterialsQuery.isLoading ||
    examMaterialsQuery.isLoading ||
    quizzesQuery.isLoading ||
    studyCirclesQuery.isLoading;

  return {
    studyMaterialsCount: studyMaterialsQuery.data ?? 0,
    examMaterialsCount: examMaterialsQuery.data ?? 0,
    quizzesCount: quizzesQuery.data ?? 0,
    studyCirclesCount: studyCirclesQuery.data ?? 0,
    isLoading,
  };
}

export function useTodayCheckIn() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard", "today-checkin", user?.id],
    queryFn: async () => dashboardApi.getTodayCheckIn(),
    enabled: Boolean(user),
  });
}

export function useCheckInById(checkInId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard", "checkin-feedback", user?.id, checkInId],
    queryFn: async () => dashboardApi.getCheckInById(checkInId!),
    enabled: Boolean(user && checkInId),
  });
}

export function useCreateDashboardCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateDashboardCheckInPayload) =>
      dashboardApi.createCheckIn(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}



