import { AppHeaderBrand } from "@/components/ui/app-logo";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useUnreadCountQuery } from "@/hooks";
import { useAuth } from "@/lib/auth";
import { formatFullDate } from "@/lib/utils/formatters";
import { useRouter } from "expo-router";
import * as React from "react";
import { Pressable, View } from "react-native";

export interface HomeGreetingProps {
  name?: string | null;
}

export const HomeGreeting = React.memo(function HomeGreeting({
  name,
}: HomeGreetingProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { unreadCount } = useUnreadCountQuery();

  const displayName = name || user?.name || "Student";
  const firstName = displayName.split(" ")[0];

  const timeOfDayGreeting = React.useMemo(() => {
    const currentHour = new Date().getHours();
    return currentHour < 12
      ? "Good morning,"
      : currentHour < 17
        ? "Good afternoon,"
        : "Good evening,";
  }, []);

  const formattedDate = React.useMemo(() => formatFullDate(), []);

  return (
    <View className="gap-4 pb-1">
      <View className="flex-row items-center justify-between pt-1">
        <View className="gap-0.5">
          <AppHeaderBrand logoSize={38} />
          <Text variant="muted" className="text-[11px] pl-0.5">
            Learn faster. Go further.
          </Text>
        </View>

        <View className="flex-row items-center gap-2.5">
          <Pressable
            onPress={() => router.push("/notifications" as any)}
            className="w-10 h-10 rounded-full bg-muted items-center justify-center relative active:opacity-70"
            hitSlop={8}
          >
            <Icon name="bell" size={18} color="muted" />
            {unreadCount > 0 ? (
              <View className="min-w-[16px] h-4 px-1 rounded-full bg-blue-600 absolute -top-1 -right-1 items-center justify-center border-2 border-white dark:border-stone-900">
                <Text className="text-[9px] font-bold text-white leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      <View className="flex-row items-end justify-between pt-1">
        <View className="gap-0.5">
          <Text variant="muted" className="text-sm font-medium">
            {timeOfDayGreeting}
          </Text>
          <Text variant="h1" className="text-2xl font-black">
            {firstName} 👋
          </Text>
          <Text variant="muted">Let&apos;s make progress today.</Text>
        </View>

        <View className="items-end gap-0.5 pb-0.5">
          <Text variant="muted">{formattedDate}</Text>
          <Text variant="primary" className="text-xs">
            Small steps. Big progress.
          </Text>
        </View>
      </View>
    </View>
  );
});
