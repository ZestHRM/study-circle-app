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
        subtitle=""
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

const ICON_CONFIG_MAP: Record<
  string,
  { icon: string; color: "purple" | "emerald" | "warning" | "primary"; bg: string }
> = {
  quiz: { icon: "help-circle", color: "purple", bg: "bg-purple-500/10" },
  study: { icon: "book-open", color: "emerald", bg: "bg-emerald-500/10" },
  circle: { icon: "users", color: "warning", bg: "bg-amber-500/10" },
  subscription: { icon: "award", color: "warning", bg: "bg-amber-500/10" },
  system: { icon: "shield", color: "primary", bg: "bg-primary/10" },
};

const DEFAULT_ICON_CONFIG = {
  icon: "bell",
  color: "primary" as const,
  bg: "bg-primary/10",
};

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

  const displayTitle = React.useMemo(
    () =>
      extractText(item.title) ||
      extractText((item as any).heading) ||
      "Notification",
    [item.title, (item as any).heading],
  );

  const displayBody = React.useMemo(
    () =>
      extractText(item.message) ||
      extractText(item.body) ||
      extractText(item.content) ||
      extractText(item.data?.message) ||
      extractText(item.data?.body) ||
      extractText(item.data?.title) ||
      "",
    [item.message, item.body, item.content, item.data],
  );

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

  const iconConfig = item.type
    ? ICON_CONFIG_MAP[item.type] ?? DEFAULT_ICON_CONFIG
    : DEFAULT_ICON_CONFIG;

  return (
    <Card
      onPress={handleCardPress}
      className={`p-3 rounded-2xl flex-row items-start gap-3 border shadow-2xs ${
        isRead
          ? "bg-card border-border/60 opacity-90"
          : "bg-primary/5 border-primary/20"
      }`}
    >
      {/* Compact Icon Badge */}
      <View
        className={`w-9 h-9 rounded-xl items-center justify-center shrink-0 ${
          isRead ? "bg-muted" : iconConfig.bg
        }`}
      >
        <Icon
          name={iconConfig.icon}
          size={16}
          color={isRead ? "muted" : iconConfig.color}
        />
      </View>

      {/* Content Block */}
      <View className="flex-1 gap-1">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5 flex-1 mr-2">
            {!isRead && (
              <View className="w-2 h-2 rounded-full bg-primary shrink-0" />
            )}
            <Text
              variant="h4"
              className={`text-xs flex-1 ${
                isRead
                  ? "font-semibold text-foreground/80"
                  : "font-bold text-foreground"
              }`}
              numberOfLines={1}
            >
              {displayTitle}
            </Text>
          </View>

          <Text
            variant="caption"
            className="text-[10px] text-muted-foreground font-medium shrink-0"
          >
            {formattedTime}
          </Text>
        </View>

        {displayBody ? (
          <Text
            variant="muted"
            className="text-[11px] text-muted-foreground leading-relaxed pr-2"
            numberOfLines={2}
          >
            {displayBody}
          </Text>
        ) : null}
      </View>

      {/* Quick Delete Action */}
      <Pressable
        onPress={handleDeletePress}
        className="p-1 rounded-lg active:bg-muted self-center"
        hitSlop={8}
      >
        <Icon name="trash-2" size={13} color="muted" />
      </Pressable>
    </Card>
  );
});
