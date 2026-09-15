import { Icon } from "@/components/ui/icon";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionHeader } from "@/components/ui/section-header";
import { Text } from "@/components/ui/text";
import { getSubjectTheme } from "@/constants/subject-themes";
import { useSubjectsQuery } from "@/hooks/queries/use-subjects";
import { router } from "expo-router";
import * as React from "react";
import { Pressable, View } from "react-native";

export const YourSubjectsListWidget = React.memo(function YourSubjectsListWidget() {
  const { subjects } = useSubjectsQuery();

  const handleSeeAll = React.useCallback(() => {
    router.push("/(tabs)/subjects");
  }, []);

  const handleSubjectPress = React.useCallback((id: number | string) => {
    router.push(`/(tabs)/subjects` as any);
  }, []);

  if (!subjects || subjects.length === 0) {
    return null;
  }

  // Display top 4 subjects
  const displayList = subjects.slice(0, 4);

  return (
    <View className="gap-3 pt-2">
      <SectionHeader
        title="Your subjects"
        actionLabel="See all"
        onAction={handleSeeAll}
      />

      {/* Subjects Progress List */}
      <View className="gap-3">
        {displayList.map((item, idx) => {
          const theme = getSubjectTheme(item.name, idx);
          const progressPercent = idx === 0 ? 68 : idx === 1 ? 52 : 37;

          return (
            <Pressable
              key={item.id}
              onPress={() => handleSubjectPress(item.id)}
              className="flex-row items-center gap-3 py-1 active:opacity-80"
            >
              {/* Left Icon Badge */}
              <View
                style={{ backgroundColor: theme.bgHex }}
                className="w-11 h-11 rounded-full items-center justify-center"
              >
                <Icon name={theme.iconName} size={20} color={theme.colorHex} />
              </View>

              {/* Subject Title & Progress Bar */}
              <View className="flex-1 gap-1.5">
                <Text
                  variant="h3"
                  className="text-base font-extrabold"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>

                <ProgressBar
                  value={progressPercent}
                  size="lg"
                  barClassName="bg-blue-600 dark:bg-blue-500"
                />
              </View>

              {/* Percentage & Chevron Right */}
              <View className="flex-row items-center gap-2 pl-2">
                <Text variant="subhead" className="font-bold">
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
