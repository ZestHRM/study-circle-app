import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useStudyMaterialsInfinite } from "@/hooks/queries/use-study-materials";
import { usePlanPermissions } from "@/hooks/use-plan-permissions";
import { formatShortDate } from "@/lib/utils/formatters";
import { isNotesReady as isNotesReadyHelper } from "@/lib/utils/material-status";
import { router } from "expo-router";
import * as React from "react";
import { Pressable, View } from "react-native";

export const RecentMaterialsWidget = React.memo(
  function RecentMaterialsWidget() {
    const { materials } = useStudyMaterialsInfinite({ limit: 4 });
    const { hasQuizAccess: isPro } = usePlanPermissions();

    const handleViewAll = React.useCallback(() => {
      router.push("/(tabs)/materials");
    }, []);

    const handleUnlockGold = React.useCallback(() => {
      router.push("/subscriptions");
    }, []);

    const handlePyqsPress = React.useCallback(() => {
      router.push("/pyqs");
    }, []);

    const handleMaterialPress = React.useCallback((id: string) => {
      router.push({
        pathname: "/materials/[id]",
        params: { id },
      } as any);
    }, []);

    return (
      <View className="gap-3 pt-2">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <Text variant="h3" className="font-bold">
            Recent Materials & Quizzes
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

        {materials && materials.length > 0 ? (
          materials.map((mat) => {
            const dateStr = mat.createdAt
              ? formatShortDate(mat.createdAt)
              : "Recent";

            const isNotesReady = isNotesReadyHelper(mat);

            const isQuizReady =
              mat.quizStatus === "GENERATED" ||
              Boolean(mat.quizId || (mat.quizzes && mat.quizzes.length > 0));

            return (
              <Card key={mat.id} className="rounded-3xl p-4 gap-3">
                {/* Main Material Header Row */}
                <View className="flex-row items-center justify-between gap-2 flex-wrap">
                  <View className="flex-row items-center gap-3 flex-1 min-w-[150px]">
                    {/* Green Document Icon Box */}
                    <View className="w-10 h-10 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/60 items-center justify-center border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                      <Icon name="file-text" size={18} color="emerald" />
                    </View>
                    <View className="flex-1">
                      <Text
                        variant="h4"
                        className="font-extrabold"
                        numberOfLines={1}
                      >
                        {mat.title}
                      </Text>
                      <Text variant="muted" className="mt-0.5">
                        {mat.subject?.name ?? "Material"} • {dateStr}
                      </Text>
                    </View>
                  </View>

                  {/* Badges & Actions */}
                  <View className="flex-row items-center gap-2 shrink-0">
                    {isNotesReady ? (
                      <View className="bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full flex-row items-center gap-1 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                        <Icon name="book-open" size={11} color="emerald" />
                        <Text className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          Notes ready
                        </Text>
                      </View>
                    ) : (
                      <View className="bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 rounded-full flex-row items-center gap-1 border border-amber-200/60 dark:border-amber-800/60 shrink-0">
                        <Icon name="clock" size={11} color="warning" />
                        <Text className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                          Processing
                        </Text>
                      </View>
                    )}

                    <Button
                      title="View"
                      variant="outline"
                      size="sm"
                      className="border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/40 px-3.5 py-1 rounded-full h-8 shrink-0 min-w-[58px]"
                      textClassName="text-xs font-bold text-blue-700 dark:text-blue-300"
                      onPress={() => handleMaterialPress(mat.id)}
                    />
                  </View>
                </View>

                {/* Quiz Status Banner */}
                {isQuizReady || isPro ? (
                  <View className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-2xl p-2.5 flex-row items-center justify-between gap-2 flex-wrap">
                    <View className="flex-row items-center gap-2 flex-1 min-w-[150px]">
                      <View className="w-5 h-5 rounded-full bg-blue-200/60 dark:bg-blue-900/60 items-center justify-center shrink-0">
                        <Icon name="check-circle" size={11} color="primary" />
                      </View>
                      <Text variant="subhead">
                        Quiz ready • Ready to practice
                      </Text>
                    </View>

                    <Button
                      title="Take quiz →"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 shrink-0"
                      textClassName="text-xs font-bold text-primary"
                      onPress={() => handleMaterialPress(mat.id)}
                    />
                  </View>
                ) : (
                  <View className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-2xl p-2.5 flex-row items-center justify-between gap-2 flex-wrap">
                    <View className="flex-row items-center gap-2 flex-1 min-w-[140px]">
                      <View className="w-5 h-5 rounded-full bg-blue-200/60 dark:bg-blue-900/60 items-center justify-center shrink-0">
                        <Icon name="lock" size={11} color="primary" />
                      </View>
                      <Text variant="subhead">Quiz generated • Locked</Text>
                    </View>

                    <Button
                      title="👑 Unlock with Gold"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 shrink-0"
                      textClassName="text-xs font-bold text-amber-700 dark:text-amber-400"
                      onPress={handleUnlockGold}
                    />
                  </View>
                )}
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon="file-text"
            title="No materials uploaded yet"
            description="Upload notes or past year papers to generate notes & AI quizzes."
            actionLabel="Upload Material"
            actionVariant="quiz"
            onAction={() => router.push("/materials/upload")}
          />
        )}
      </View>
    );
  },
);
