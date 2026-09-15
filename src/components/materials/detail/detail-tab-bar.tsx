import { AppTabBar } from "@/components/ui/app-tab-bar";
import * as React from "react";
import type { TabType } from "./types";

interface DetailTabBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isPro?: boolean;
}

export const DetailTabBar = React.memo(function DetailTabBar({
  activeTab,
  onSelectTab,
  isPro = false,
}: DetailTabBarProps) {
  const tabs = React.useMemo<
    Array<{
      id: TabType;
      label: string;
      icon: string;
      badge?: string;
      badgeVariant?: "blue" | "emerald" | "amber" | "purple";
    }>
  >(
    () => [
      { id: "material", label: "Material", icon: "file-text" },
      { id: "notes", label: "AI Notes", icon: "star" },
      {
        id: "quiz",
        label: "Quiz",
        icon: isPro ? "zap" : "lock",
        badge: isPro ? undefined : "Pro",
        badgeVariant: "amber",
      },
    ],
    [isPro],
  );

  return (
    <AppTabBar<TabType>
      activeTab={activeTab}
      onTabChange={onSelectTab}
      tabs={tabs}
    />
  );
});
