import { AppTabBar } from "@/components/ui/app-tab-bar";
import * as React from "react";
import type { TabType } from "./types";

interface DetailTabBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

const DETAIL_TABS: Array<{
  id: TabType;
  label: string;
  icon: string;
  badge?: string;
  badgeVariant?: "blue" | "emerald" | "amber" | "purple";
}> = [
  { id: "material", label: "Material", icon: "file-text" },
  { id: "notes", label: "AI Notes", icon: "star" },
  { id: "quiz", label: "Quiz", icon: "lock", badge: "Pro", badgeVariant: "amber" },
];

export const DetailTabBar = React.memo(function DetailTabBar({
  activeTab,
  onSelectTab,
}: DetailTabBarProps) {
  return (
    <AppTabBar<TabType>
      activeTab={activeTab}
      onTabChange={onSelectTab}
      tabs={DETAIL_TABS}
    />
  );
});
