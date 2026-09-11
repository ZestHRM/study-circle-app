import { HeroBanner } from "@/components/ui/hero-banner";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import * as React from "react";
import { Image, Pressable, View } from "react-native";

export type MaterialFilterType = "all" | "notes_ready" | "quiz_ready" | "processing";

interface MaterialsHeaderProps {
  onUploadPress: () => void;
  onPasteTextPress?: () => void;
  activeFilter?: MaterialFilterType;
  onFilterChange?: (filter: MaterialFilterType) => void;
  totalMaterialsCount?: number;
}

const BENEFITS = [
  {
    icon: "file-text",
    iconColor: "#059669",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/40",
    title: "AI notes",
    desc: "Well structured & easy to follow",
  },
  {
    icon: "lightbulb",
    iconColor: "#D97706",
    bgClass: "bg-amber-50 dark:bg-amber-950/40",
    title: "Key concepts",
    desc: "Focus on what matters",
  },
  {
    icon: "target",
    iconColor: APP_COLORS.brandPurple,
    bgClass: "bg-purple-50 dark:bg-purple-950/40",
    title: "Practice ready",
    desc: "Build confidence step by step",
  },
] as const;

export const MaterialsHeader = React.memo(function MaterialsHeader({
  onUploadPress,
  onPasteTextPress,
  activeFilter = "all",
  onFilterChange,
  totalMaterialsCount = 0,
}: MaterialsHeaderProps) {
  return (
    <View className="mb-4 gap-4">
      {/* 1. Reusable Hero Banner Component */}
      <HeroBanner
        title={
          <Text variant="h1" className="tracking-tight leading-tight">
            Turn your material{"\n"}into a{" "}
            <Text variant="primary" className="text-3xl font-extrabold">
              study plan
            </Text>
          </Text>
        }
        subtitle="Upload your notes or PDFs and we'll turn them into clear AI notes + practice."
        imageSource={require("../../../assets/images/student-study-hero.png")}
        imageWidth={140}
        imageHeight={115}
      />

      {/* 2. Upload Material Action Card */}
      <Pressable
        onPress={onUploadPress}
        className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-4 flex-row items-center justify-between shadow-2xs active:opacity-90"
      >
        <View className="flex-row items-center gap-3.5 flex-1 pr-2">
          {/* Cloud Upload Icon Badge */}
          <View className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 items-center justify-center">
            <Icon name="upload-cloud" size={22} color={APP_COLORS.quizBlue} />
          </View>

          <View className="flex-1">
            <Text variant="h3" numberOfLines={1}>
              Upload your material
            </Text>
            <Text variant="muted" className="mt-0.5" numberOfLines={1}>
              Select subject & upload PDFs, notes or slides
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <View className="bg-blue-600 px-4 py-2.5 rounded-2xl flex-row items-center gap-1.5 shadow-2xs">
          <Icon name="plus" size={14} color={APP_COLORS.white} />
          <Text variant="caption" className="font-bold text-white">
            Upload →
          </Text>
        </View>
      </Pressable>

      {/* 3. Benefit Feature Chips Row (3 horizontal cards) */}
      <View className="flex-row items-center justify-between gap-2.5">
        {BENEFITS.map((benefit) => (
          <View
            key={benefit.title}
            className="flex-1 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-3 items-start shadow-2xs"
          >
            <View className={`w-8 h-8 rounded-xl ${benefit.bgClass} items-center justify-center mb-2`}>
              <Icon name={benefit.icon as any} size={16} color={benefit.iconColor} />
            </View>
            <Text variant="subhead" className="font-extrabold">
              {benefit.title}
            </Text>
            <Text
              variant="muted"
              className="text-[10px] leading-3 mt-0.5"
              numberOfLines={2}
            >
              {benefit.desc}
            </Text>
          </View>
        ))}
      </View>

      {/* 4. Section Header: "Your recent materials" + "See all >" */}
      <View className="flex-row items-center justify-between pt-2">
        <Text variant="h2">
          Your recent materials
        </Text>
        {onFilterChange ? (
          <Pressable
            onPress={() =>
              onFilterChange(activeFilter === "all" ? "notes_ready" : "all")
            }
            className="flex-row items-center gap-1 active:opacity-70"
          >
            <Text variant="muted" className="text-xs font-bold text-stone-500">
              {activeFilter === "all" ? "Filter ready" : "See all"}
            </Text>
            <Icon name="chevron-right" size={14} color={APP_COLORS.stone400} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});
