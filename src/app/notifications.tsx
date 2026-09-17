import { Card } from "@/components/ui/card";
import { CommonHeader } from "@/components/ui/common-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import {
  useDeleteNotifications,
  useMarkNotificationsRead,
  useNotificationsQuery,
  useUnreadCountQuery,
} from "@/hooks";
import { useRefreshControl } from "@/hooks/use-refresh-control";
import { useThemePreference } from "@/lib/theme-preference";
import { formatRelativeTime } from "@/lib/utils/formatters";
import { NotificationItem, NotificationType } from "@/services";
import { useRouter } from "expo-router";
import * as React from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StatusBar,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const router = useRouter();
  const { isDark } = useThemePreference();
  const [activeTab, setActiveTab] = React.useState<"all" | "unread">("all");
  const [page, setPage] = React.useState<number>(1);
  const limit = 10;

  const {
    notifications,
    pagination,
    totalItems,
    unreadCount: queryUnreadCount,
    isLoading,
    isRefetching,
    refetch,
  } = useNotificationsQuery({ page, limit });

  const { unreadCount: globalUnreadCount, refetch: refetchUnreadCount } =
    useUnreadCountQuery();

  const markReadMutation = useMarkNotificationsRead();
  const deleteMutation = useDeleteNotifications();

  const handleRefresh = React.useCallback(async () => {
    await Promise.all([refetch(), refetchUnreadCount()]);
  }, [refetch, refetchUnreadCount]);

  const { refreshing, onRefresh } = useRefreshControl(handleRefresh);

  const displayUnreadCount = globalUnreadCount || queryUnreadCount || 0;

  // Memoized filtered notifications
  const filteredNotifications = React.useMemo(() => {
    if (activeTab === "unread") {
      return notifications.filter((item) => !(item.isRead || item.read));
    }
    return notifications;
  }, [notifications, activeTab]);

  // Mark single notification as read
  const handleMarkAsRead = React.useCallback(
    (item: NotificationItem) => {
      if (item.isRead || item.read) return;
      markReadMutation.mutate({ ids: [item.id] });
    },
    [markReadMutation],
  );

  // Mark all notifications as read
  const handleMarkAllAsRead = React.useCallback(() => {
    Alert.alert(
      "Mark All as Read",
      "Are you sure you want to mark all notifications as read?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Read",
          onPress: () => {
            markReadMutation.mutate({ ids: "all" });
          },
        },
      ],
    );
  }, [markReadMutation]);

  // Delete single notification
  const handleDeleteNotification = React.useCallback(
    (id: number | string) => {
      Alert.alert(
        "Delete Notification",
        "Are you sure you want to delete this notification?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              deleteMutation.mutate({ ids: [id] });
            },
          },
        ],
      );
    },
    [deleteMutation],
  );

  // Delete all notifications
  const handleDeleteAll = React.useCallback(() => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to delete all notifications? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            deleteMutation.mutate({ ids: "all" });
          },
        },
      ],
    );
  }, [deleteMutation]);

  const totalPages = React.useMemo(
    () => (pagination?.totalPages ?? Math.ceil(totalItems / limit)) || 1,
    [pagination?.totalPages, totalItems, limit],
  );

  // Memoized Header Right Actions using semantic tokens
  const renderHeaderRight = React.useCallback(() => {
    if (notifications.length === 0) return null;
    return (
      <View className="flex-row items-center gap-1">
        <Pressable
          onPress={handleMarkAllAsRead}
          disabled={markReadMutation.isPending}
          className="p-2 rounded-lg bg-muted items-center justify-center active:opacity-70"
          hitSlop={8}
        >
          <Icon name="check-check" size={18} color="primary" />
        </Pressable>

        <Pressable
          onPress={handleDeleteAll}
          disabled={deleteMutation.isPending}
          className="p-2 rounded-lg bg-red-100 dark:bg-red-950/60 items-center justify-center active:opacity-70"
          hitSlop={8}
        >
          <Icon name="trash-2" size={18} color="error" />
        </Pressable>
      </View>
    );
  }, [
    notifications.length,
    handleMarkAllAsRead,
    markReadMutation.isPending,
    handleDeleteAll,
    deleteMutation.isPending,
  ]);

  // Memoized FlatList renderItem
  const renderItem = React.useCallback(
    ({ item }: { item: NotificationItem }) => (
      <NotificationCard
        item={item}
        onMarkRead={handleMarkAsRead}
        onDelete={handleDeleteNotification}
      />
    ),
    [handleMarkAsRead, handleDeleteNotification],
  );

  const keyExtractor = React.useCallback(
    (item: NotificationItem, idx: number) => String(item.id ?? idx),
    [],
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Reusable Header */}
      <CommonHeader
        title="Notifications"
        subtitle="Stay updated with your study circles & progress"
        showBack={true}
        logoPosition="left"
        rightElement={renderHeaderRight()}
      />

      {/* Tabs using semantic theme colors */}
      <View className="flex-row px-4 py-3 bg-card border-b border-border gap-2">
        <Pressable
          onPress={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-full font-medium text-xs flex-row items-center gap-1.5 ${
            activeTab === "all" ? "bg-primary" : "bg-muted"
          }`}
        >
          <Text
            variant={activeTab === "all" ? undefined : "subhead"}
            className={activeTab === "all" ? "text-white font-semibold" : ""}
          >
            All Notifications ({notifications.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("unread")}
          className={`px-4 py-2 rounded-full font-medium text-xs flex-row items-center gap-1.5 ${
            activeTab === "unread" ? "bg-primary" : "bg-muted"
          }`}
        >
          <Text
            variant={activeTab === "unread" ? undefined : "subhead"}
            className={activeTab === "unread" ? "text-white font-semibold" : ""}
          >
            Unread ({displayUnreadCount})
          </Text>
        </Pressable>
      </View>

      {/* Notification List & Reusable UI States */}
      {isLoading && !isRefetching && !refreshing ? (
        <Spinner message="Loading notifications..." center />
      ) : filteredNotifications.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <EmptyState
            icon="bell-off"
            title={
              activeTab === "unread"
                ? "No Unread Notifications"
                : "No Notifications Yet"
            }
            description={
              activeTab === "unread"
                ? "You are all caught up! Check back later for updates."
                : "When you receive announcements, quiz results, or study updates, they will appear here."
            }
          />
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={keyExtractor}
          refreshing={refreshing}
          onRefresh={onRefresh}
          renderItem={renderItem}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === "android"}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          ListFooterComponent={
            totalPages > 1 ? (
              <View className="flex-row items-center justify-between pt-4 pb-8 border-t border-border">
                <Pressable
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-3 py-1.5 rounded-lg border ${
                    page === 1
                      ? "border-border bg-muted opacity-50"
                      : "border-border bg-card"
                  }`}
                >
                  <Text variant="subhead">Previous</Text>
                </Pressable>
                <Text variant="muted">
                  Page {page} of {totalPages}
                </Text>
                <Pressable
                  onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className={`px-3 py-1.5 rounded-lg border ${
                    page >= totalPages
                      ? "border-border bg-muted opacity-50"
                      : "border-border bg-card"
                  }`}
                >
                  <Text variant="subhead">Next</Text>
                </Pressable>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

function extractText(val: any): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    if (typeof val.title === "string") return val.title;
    if (typeof val.message === "string") return val.message;
    if (typeof val.body === "string") return val.body;
    if (typeof val.content === "string") return val.content;
    if (typeof val.description === "string") return val.description;
    try {
      return JSON.stringify(val);
    } catch {
      return "";
    }
  }
  return "";
}

const NotificationCard = React.memo(function NotificationCard({
  item,
  onMarkRead,
  onDelete,
}: {
  item: NotificationItem;
  onMarkRead: (item: NotificationItem) => void;
  onDelete: (id: number | string) => void;
}) {
  const isRead = Boolean(item.isRead || item.read);

  const displayTitle =
    extractText(item.title) ||
    extractText((item as any).heading) ||
    "Notification";

  const displayBody =
    extractText(item.message) ||
    extractText(item.body) ||
    extractText(item.content) ||
    extractText(item.data?.message) ||
    extractText(item.data?.body) ||
    extractText(item.data?.title) ||
    "";

  const getIcon = (type?: NotificationType) => {
    switch (type) {
      case "quiz":
        return <Icon name="help-circle" size={20} color="purple" />;
      case "study":
        return <Icon name="book-open" size={18} color="emerald" />;
      case "circle":
        return <Icon name="users" size={18} color="warning" />;
      case "subscription":
        return <Icon name="award" size={18} color="warning" />;
      case "system":
        return <Icon name="shield" size={18} color="primary" />;
      default:
        return <Icon name="bell" size={18} color="primary" />;
    }
  };

  const formattedTime = React.useMemo(() => {
    return formatRelativeTime(item.createdAt);
  }, [item.createdAt]);

  const handleCardPress = React.useCallback(() => {
    onMarkRead(item);
  }, [onMarkRead, item]);

  const handleDeletePress = React.useCallback(
    (e: any) => {
      e.stopPropagation();
      onDelete(item.id);
    },
    [onDelete, item.id],
  );

  return (
    <Card
      onPress={handleCardPress}
      className={`p-4 rounded-xl flex-row items-start gap-3 ${
        isRead
          ? "bg-card border-border opacity-80"
          : "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 shadow-sm"
      }`}
    >
      {/* Icon Badge */}
      <View
        className={`w-10 h-10 rounded-full items-center justify-center ${
          isRead ? "bg-muted" : "bg-blue-100 dark:bg-blue-900/40"
        }`}
      >
        {getIcon(item.type)}
      </View>

      {/* Content */}
      <View className="flex-1 gap-1">
        <View className="flex-row items-center justify-between">
          <Text
            variant="h4"
            className={isRead ? "opacity-75 font-bold" : "font-bold"}
            numberOfLines={1}
          >
            {displayTitle}
          </Text>

          {!isRead && (
            <View className="w-2 h-2 rounded-full bg-blue-600 ml-1" />
          )}
        </View>

        {displayBody ? (
          <Text variant="muted" className="leading-relaxed" numberOfLines={2}>
            {displayBody}
          </Text>
        ) : null}

        <View className="flex-row items-center justify-between pt-1">
          <Text variant="caption" className="text-[10px] font-medium">
            {formattedTime}
          </Text>

          {/* Individual Delete Action */}
          <Pressable
            onPress={handleDeletePress}
            className="p-1 rounded-md active:opacity-60"
            hitSlop={8}
          >
            <Icon name="trash-2" size={14} color="#9CA3AF" />
          </Pressable>
        </View>
      </View>
    </Card>
  );
});
