import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { cn } from "@/lib/utils";
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
    bg: "bg-amber-100 dark:bg-amber-950/60",
    text: "text-amber-700 dark:text-amber-300 font-bold",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-950/60",
    text: "text-blue-700 dark:text-blue-300 font-bold",
  },
  purple: {
    bg: "bg-blue-100 dark:bg-blue-950/60",
    text: "text-blue-700 dark:text-blue-300 font-bold",
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
      className={cn("flex-row bg-card border-b border-border px-2", className)}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const iconColor = isActive ? APP_COLORS.primary : APP_COLORS.stone400;
        const badgeStyle = BADGE_STYLES[tab.badgeVariant ?? "amber"];

        return (
          <Pressable
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 flex-row items-center justify-center gap-1.5 py-3 border-b-2 active:opacity-70",
              isActive ? "border-primary" : "border-transparent",
            )}
          >
            {tab.icon ? (
              <Icon name={tab.icon as any} size={14} color={iconColor} />
            ) : null}
            <Text
              variant={isActive ? "primary" : "subhead"}
              className="text-xs font-semibold"
            >
              {tab.label}
            </Text>
            {tab.badge !== undefined && tab.badge !== null ? (
              <View
                className={cn(
                  "px-1.5 py-0.5 rounded-full ml-0.5",
                  badgeStyle.bg,
                )}
              >
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
