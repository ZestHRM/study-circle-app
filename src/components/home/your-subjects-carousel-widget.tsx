import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { Text } from "@/components/ui/text";
import { getSubjectTheme } from "@/constants/subject-themes";
import { useSubjectsQuery } from "@/hooks/queries/use-subjects";
import { router } from "expo-router";
import * as React from "react";
import { Pressable, ScrollView, View } from "react-native";

export interface SubjectItemData {
  id: string;
  name: string;
  iconName: string;
  readinessPercent: number;
  statusLabel: string;
  statusColor: string;
  isActive?: boolean;
}

export const YourSubjectsCarouselWidget = React.memo(
  function YourSubjectsCarouselWidget() {
    const { subjects: apiSubjects, isLoading } = useSubjectsQuery();

    const displaySubjects = React.useMemo<SubjectItemData[]>(() => {
      if (apiSubjects && apiSubjects.length > 0) {
        return apiSubjects.map((sub, idx) => {
          const theme = getSubjectTheme(sub.name, idx);
          const readinessPercent = idx === 0 ? 72 : idx === 1 ? 48 : 35;
          const statusLabel =
            readinessPercent >= 70
              ? "You're on track!"
              : readinessPercent >= 45
                ? "Keep going!"
                : "Build momentum!";
          const statusColor =
            readinessPercent >= 70
              ? "text-emerald-600 dark:text-emerald-400"
              : readinessPercent >= 45
                ? "text-blue-600 dark:text-blue-400"
                : "text-blue-700 dark:text-blue-300";

          return {
            id: String(sub.id),
            name: sub.name,
            iconName: theme.iconName,
            readinessPercent,
            statusLabel,
            statusColor,
            isActive: idx === 0,
          };
        });
      }
      return [];
    }, [apiSubjects]);

    const handleViewAll = React.useCallback(() => {
      router.push("/(tabs)/subjects");
    }, []);

    const handleAddSubject = React.useCallback(() => {
      router.push("/create-subject" as any);
    }, []);

    const handleSubjectPress = React.useCallback((id: string) => {
      router.push({
        pathname: "/(tabs)/subjects",
        params: { selectedId: id },
      } as any);
    }, []);

    return (
      <View className="gap-3 pt-1">
        {/* Section Header */}
        <View className="flex-row items-center justify-between">
          <Text variant="h3" className="font-bold">
            Your subjects
          </Text>
          <Pressable
            onPress={handleViewAll}
            className="flex-row items-center gap-1 active:opacity-70"
          >
            <Text variant="primary" className="text-xs">
              View all
            </Text>
            <Icon name="arrow-right" size={14} color="primary" />
          </Pressable>
        </View>

        {displaySubjects.length > 0 ? (
          /* Horizontal Carousel */
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {displaySubjects.map((sub) => {
              const ringColor =
                sub.readinessPercent >= 70
                  ? "#2563EB"
                  : sub.readinessPercent >= 45
                    ? "#3B82F6"
                    : "#60A5FA";

              return (
                <Pressable
                  key={sub.id}
                  onPress={() => handleSubjectPress(sub.id)}
                  className={`w-44 bg-card rounded-3xl p-3.5 mr-3 shadow-2xs gap-3 justify-between active:opacity-90 ${
                    sub.isActive
                      ? "border-2 border-primary"
                      : "border border-border"
                  }`}
                >
                  {/* Top: Icon & Name */}
                  <View className="gap-2">
                    <View className="w-10 h-10 rounded-2xl bg-primary/10 items-center justify-center border border-primary/20">
                      <Icon name={sub.iconName} size={20} color="primary" />
                    </View>
                    <Text
                      variant="h4"
                      className="font-extrabold"
                      numberOfLines={1}
                    >
                      {sub.name}
                    </Text>
                  </View>

                  {/* Bottom Gauge & Readiness */}
                  <View className="flex-row items-center gap-2.5 pt-1 border-t border-border">
                    <ProgressCircle
                      percent={sub.readinessPercent}
                      color={ringColor}
                    />
                    <View className="flex-1">
                      <Text
                        variant="caption"
                        className="text-[10px] font-semibold"
                      >
                        Exam readiness
                      </Text>
                      <Text
                        className={`text-[11px] font-bold ${sub.statusColor}`}
                        numberOfLines={1}
                      >
                        {sub.statusLabel}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
          /* Empty State Card when user has 0 subjects */
          <Card className="rounded-3xl p-4 flex-row items-center justify-between gap-3">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-10 h-10 rounded-2xl bg-primary/10 items-center justify-center border border-primary/20">
                <Icon name="book-open" size={20} color="primary" />
              </View>
              <View className="flex-1">
                <Text variant="h4" className="font-extrabold">
                  No subjects yet
                </Text>
                <Text variant="muted" className="mt-0.5">
                  Add subjects to organize notes & quizzes
                </Text>
              </View>
            </View>
            <Button
              title="Add subject"
              icon="plus"
              size="sm"
              variant="quiz"
              className="rounded-2xl px-3 h-9"
              onPress={handleAddSubject}
            />
          </Card>
        )}
      </View>
    );
  },
);
