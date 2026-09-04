import { useAuth } from '@/lib/auth';
import {
  dashboardApi,
  type CreateDashboardCheckInPayload,
} from '@/services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useDashboardStreak() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['dashboard', 'streak', token],
    queryFn: async () => dashboardApi.getStreak(token as string),
    enabled: Boolean(token),
  });
}

export function useDashboardRecentActivity() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['dashboard', 'recent-activity', token],
    queryFn: async () => dashboardApi.getRecentActivity(token as string),
    enabled: Boolean(token),
  });
}

export function useDashboardChartData(params: {
  startDate: string;
  endDate: string;
}) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['dashboard', 'chart-data', token, params.startDate, params.endDate],
    queryFn: async () =>
      dashboardApi.getChartData(token as string, params),
    enabled: Boolean(token) && Boolean(params.startDate) && Boolean(params.endDate),
  });
}

export function useCreateDashboardCheckIn() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateDashboardCheckInPayload) =>
      dashboardApi.createCheckIn(token as string, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
