import { type DashboardCheckInMood } from "@/services/dashboard-service";

export interface MoodItem {
  id: string;
  label: string;
  emoji: string;
  icon?: "smile" | "meh" | "frown";
  iconColor?: string;
  apiMood: DashboardCheckInMood;
  selectedCardClass?: string;
  unselectedCardClass?: string;
  badgeClass?: string;
  buttonClass?: string;
  textClass?: string;
}

export const CENTRAL_MOOD_OPTIONS: MoodItem[] = [
  {
    id: "focused",
    label: "Confident",
    emoji: "😊",
    icon: "smile",
    iconColor: "#059669",
    apiMood: "MOTIVATED",
    selectedCardClass:
      "bg-[#ECFDF5] border-2 border-emerald-600 shadow-xs dark:bg-emerald-950/50",
    unselectedCardClass:
      "bg-[#F4FBF7] border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30",
    badgeClass: "bg-emerald-100/80 dark:bg-emerald-900/40",
    buttonClass:
      "bg-[#ECFDF5] dark:bg-emerald-950/40 border border-[#A7F3D0]/60 dark:border-emerald-800/40",
    textClass: "text-emerald-900 dark:text-emerald-300",
  },
  {
    id: "okay",
    label: "Okay",
    emoji: "😐",
    icon: "meh",
    iconColor: "#2563EB",
    apiMood: "OKAY",
    selectedCardClass:
      "bg-blue-50 border-2 border-blue-600 shadow-xs dark:bg-blue-950/50",
    unselectedCardClass:
      "bg-blue-50/50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30",
    badgeClass: "bg-blue-100/80 dark:bg-blue-900/40",
    buttonClass:
      "bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs",
    textClass: "text-blue-900 dark:text-blue-300",
  },
  {
    id: "stressed",
    label: "Not ready",
    emoji: "🙁",
    icon: "frown",
    iconColor: "#E11D48",
    apiMood: "TIRED",
    selectedCardClass:
      "bg-[#FFF1F2] border-2 border-rose-600 shadow-xs dark:bg-rose-950/50",
    unselectedCardClass:
      "bg-[#FFF5F6] border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30",
    badgeClass: "bg-rose-100/80 dark:bg-rose-900/40",
    buttonClass:
      "bg-[#FFF1F2] dark:bg-rose-950/40 border border-[#FECDD3]/60 dark:border-rose-800/40",
    textClass: "text-rose-900 dark:text-rose-300",
  },
];

export function getMoodById(id: string): MoodItem {
  return (
    CENTRAL_MOOD_OPTIONS.find((m) => m.id === id) ?? CENTRAL_MOOD_OPTIONS[1]
  );
}
