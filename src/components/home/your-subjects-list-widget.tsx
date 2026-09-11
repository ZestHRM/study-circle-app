import { Icon } from "@/components/ui/icon";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Text } from "@/components/ui/text";
import { UI_STYLES } from "@/constants/styles";
import { useSubjectsQuery } from "@/hooks/queries/use-subjects";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as React from "react";
import { Pressable, View } from "react-native";

const PRESET_SUBJECT_STYLES = [
  {
    iconName: "book" as const,
    colorHex: "#2563EB",
    bgClass: "bg-blue-100 dark:bg-blue-950/60",
    barClass: "bg-blue-600 dark:bg-blue-500",
    defaultProgress: 68,
  },
  {
    iconName: "feather" as const,
    colorHex: "#65A30D",
    bgClass: "bg-lime-100 dark:bg-lime-950/60",
    barClass: "bg-lime-600 dark:bg-lime-500",
    defaultProgress: 52,
  },
  {
    iconName: "book-open" as const,
    colorHex: "#E11D48",
    bgClass: "bg-rose-100 dark:bg-rose-950/60",
    barClass: "bg-rose-500 dark:bg-rose-400",
    defaultProgress: 37,
  },
];

export const YourSubjectsListWidget = React.memo(function YourSubjectsListWidget() {
  const { subjects } = useSubjectsQuery();

  const handleSeeAll = React.useCallback(() => {
    router.push("/(tabs)/subjects");
  }, []);

  const handleSubjectPress = React.useCallback((id: number | string) => {
    router.push(`/subjects/${id}`);
  }, []);

  if (!subjects || subjects.length === 0) {
    return null;
  }

  // Display top 4 subjects
  const displayList = subjects.slice(0, 4);

  return (
    <View className="gap-3 pt-2">
      {/* Header Row */}
      <View className={UI_STYLES.rowBetween}>
        <Text variant="h2" className={UI_STYLES.sectionHeaderTitle}>
          Your subjects
        </Text>
        <Pressable onPress={handleSeeAll} className="active:opacity-70">
          <Text className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            See all
          </Text>
        </Pressable>
      </View>

      {/* Subjects Progress List */}
      <View className="gap-3">
        {displayList.map((item, idx) => {
          const style = PRESET_SUBJECT_STYLES[idx % PRESET_SUBJECT_STYLES.length];
          const progressPercent = style.defaultProgress;

          return (
            <Pressable
              key={item.id}
              onPress={() => handleSubjectPress(item.id)}
              className="flex-row items-center gap-3 py-1 active:opacity-80"
            >
              {/* Left Icon Badge */}
              <View
                className={`w-11 h-11 rounded-full items-center justify-center ${style.bgClass}`}
              >
                <Feather name={style.iconName} size={20} color={style.colorHex} />
              </View>

              {/* Subject Title & Progress Bar */}
              <View className="flex-1 gap-1.5">
                <Text
                  variant="h3"
                  className="text-base font-extrabold text-stone-900 dark:text-stone-100"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>

                <ProgressBar
                  value={progressPercent}
                  size="lg"
                  barClassName={style.barClass}
                />
              </View>

              {/* Percentage & Chevron Right */}
              <View className="flex-row items-center gap-2 pl-2">
                <Text className="text-sm font-bold text-stone-700 dark:text-stone-300">
                  {progressPercent}%
                </Text>
                <Icon name="chevron-right" size={18} color="muted" />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});
