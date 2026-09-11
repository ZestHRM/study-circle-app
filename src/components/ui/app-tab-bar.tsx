import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import * as React from "react";
import { Pressable, View } from "react-native";

export interface AppTabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: string;
  badge?: string | number;
  badgeVariant?: "blue" | "amber" | "purple" | "emerald";
}

export interface AppTabBarProps<T extends string = string> {
  tabs: AppTabItem<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
  className?: string;
}

const BADGE_STYLES = {
  amber: {
    bg: "bg-amber-400 dark:bg-amber-500",
    text: "text-amber-950 font-black",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-950/60",
    text: "text-blue-700 dark:text-blue-300 font-bold",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-950/60",
    text: "text-purple-700 dark:text-purple-300 font-bold",
  },
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-950/60",
    text: "text-emerald-700 dark:text-emerald-300 font-bold",
  },
};

/**
 * Reusable Tab Bar component with active indicator line, icons, and badges.
 */
export function AppTabBar<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  className,
}: AppTabBarProps<T>) {
  return (
    <View
      className={cn(
        "flex-row bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 px-2",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const color = isActive ? "#2563EB" : "#94A3B8";
        const badgeStyle = BADGE_STYLES[tab.badgeVariant ?? "amber"];

        return (
          <Pressable
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 flex-row items-center justify-center gap-1.5 py-3 border-b-2 active:opacity-70",
              isActive ? "border-blue-600" : "border-transparent",
            )}
          >
            {tab.icon ? (
              <Icon name={tab.icon as any} size={14} color={color} />
            ) : null}
            <Text
              style={{
                color,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {tab.label}
            </Text>
            {tab.badge !== undefined && tab.badge !== null ? (
              <View className={cn("px-1.5 py-0.5 rounded-full ml-0.5", badgeStyle.bg)}>
                <Text className={cn("text-[9px]", badgeStyle.text)}>
                  {tab.badge}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
