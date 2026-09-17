import { useAuth } from "@/lib/auth";
import { showSuccessToast } from "@/lib/utils/toast";
import {
  deleteNotifications,
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationsAsRead,
  registerDeviceToken,
  type DeleteNotificationsPayload,
  type GetNotificationsParams,
  type MarkReadPayload,
  type NotificationItem,
  type RegisterDeviceTokenPayload,
} from "@/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";

export function useNotificationsQuery(params?: GetNotificationsParams) {
  const { token } = useAuth();
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;

  const query = useQuery({
    queryKey: ["notifications", token, page, limit],
    queryFn: async () => getNotifications({ page, limit }, token),
    enabled: Boolean(token),
    staleTime: 1000 * 30, // 30 seconds
  });

  const notifications: NotificationItem[] = React.useMemo(() => {
    if (!query.data) return [];
    return (
      query.data.data ?? query.data.notifications ?? query.data.items ?? []
    );
  }, [query.data]);

  const pagination = query.data?.pagination;
  const totalItems =
    pagination?.totalItems ??
    pagination?.totalCount ??
    query.data?.totalCount ??
    notifications.length;

  const unreadCount = React.useMemo(() => {
    if (query.data?.unreadCount !== undefined) {
      return query.data.unreadCount;
    }
    return notifications.filter((n) => !(n.isRead || n.read)).length;
  }, [query.data, notifications]);

  const refetch = React.useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    notifications,
    pagination,
    totalItems,
    unreadCount,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    isError: query.isError,
    error: query.error,
    refetch,
  };
}

export function useUnreadCountQuery() {
  const { token } = useAuth();

  const query = useQuery({
    queryKey: ["notifications", "unread-count", token],
    queryFn: async () => getUnreadNotificationsCount(token),
    enabled: Boolean(token),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60, // Auto refetch every 1 minute
  });

  const unreadCount = React.useMemo(() => {
    if (!query.data) return 0;
    return (
      query.data.count ??
      query.data.unreadCount ??
      query.data.data?.count ??
      query.data.data?.unreadCount ??
      0
    );
  }, [query.data]);

  const refetch = React.useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    unreadCount,
    isLoading: query.isLoading,
    refetch,
  };
}

export function useMarkNotificationsRead() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: MarkReadPayload) => {
      return markNotificationsAsRead(payload, token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteNotifications() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: DeleteNotificationsPayload) => {
      return deleteNotifications(payload, token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      showSuccessToast("Success", "Notification(s) deleted.");
    },
  });
}

export function useRegisterDeviceToken() {
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (payload: RegisterDeviceTokenPayload) => {
      return registerDeviceToken(payload, token);
    },
  });
}
