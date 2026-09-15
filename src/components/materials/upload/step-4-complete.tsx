import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { Pressable, View } from "react-native";
import { ScreenFooterBadge } from "./screen-footer-badge";
import { SubjectBannerCard } from "./subject-banner-card";

export interface Step4CompleteProps {
  displaySubject: string;
  displayTitle: string;
  displayFileName: string;
  onReadNotes: () => void;
  onTakeQuiz: () => void;
  onViewOriginalFile: () => void;
}

interface ResultItemProps {
  title: string;
  subtitle: string;
  iconName: React.ComponentProps<typeof Icon>["name"];
  iconBgClass: string;
  badgeLabel: string;
  badgeVariant: "emerald" | "amber" | "outline";
  onPress?: () => void;
}

const ResultCardItem = React.memo(function ResultCardItem({
  title,
  subtitle,
  iconName,
  iconBgClass,
  badgeLabel,
  badgeVariant,
  onPress,
}: ResultItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white dark:bg-stone-900 rounded-3xl p-4.5 border border-stone-200 dark:border-stone-800 flex-row items-center justify-between shadow-2xs active:opacity-90"
    >
      <View className="flex-row items-center gap-3.5 flex-1 pr-2">
        <View
          className={`w-11 h-11 rounded-2xl ${iconBgClass} items-center justify-center border border-blue-200 dark:border-blue-800`}
        >
          <Icon
            name={iconName}
            size="md"
            color={badgeVariant === "amber" ? "warning" : "primary"}
          />
        </View>
        <View className="flex-1">
          <Text variant="h4">
            {title}
          </Text>
          <Text variant="muted" className="mt-0.5" numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <Badge label={badgeLabel} variant={badgeVariant} icon="check" />
        <Icon name="chevron-right" size="sm" color="muted" />
      </View>
    </Pressable>
  );
});

export const Step4Complete = React.memo(function Step4Complete({
  displaySubject,
  displayTitle,
  displayFileName,
  onReadNotes,
  onTakeQuiz,
  onViewOriginalFile,
}: Step4CompleteProps) {
  const resultItems = React.useMemo<ResultItemProps[]>(
    () => [
      {
        title: "Generated Notes",
        subtitle: "Personalized notes from your materials",
        iconName: "book-open",
        iconBgClass: "bg-blue-500/15",
        badgeLabel: "Ready",
        badgeVariant: "emerald",
        onPress: onReadNotes,
      },
      {
        title: "Practice Quiz",
        subtitle: "Custom questions to test your knowledge",
        iconName: "zap",
        iconBgClass: "bg-amber-500/15",
        badgeLabel: "Ready",
        badgeVariant: "amber",
        onPress: onTakeQuiz,
      },
      {
        title: "Original Materials",
        subtitle: displayFileName,
        iconName: "file-text",
        iconBgClass: "bg-stone-100 dark:bg-stone-800",
        badgeLabel: "Available",
        badgeVariant: "emerald",
        onPress: onViewOriginalFile,
      },
    ],
    [displayFileName, onReadNotes, onTakeQuiz, onViewOriginalFile],
  );

  return (
    <View className="gap-5">
      {/* Header */}
      <View className="gap-1">
        <Text variant="h2">
          Everything is ready
        </Text>
        <Text variant="muted">
          Your study materials for {displayTitle} are all set!
        </Text>
      </View>

      {/* Subject Banner Card */}
      <SubjectBannerCard subject={displaySubject} title={displayTitle} />

      {/* Results Cards List */}
      <View className="gap-3.5">
        {resultItems.map((item) => (
          <ResultCardItem key={item.title} {...item} />
        ))}
      </View>

      {/* Primary Action Button */}
      <Button
        variant="quiz"
        icon="book-open"
        iconPosition="right"
        title="Open study material"
        onPress={onReadNotes}
        className="w-full h-13 rounded-2xl justify-center items-center shadow-md mt-1"
      />

      {/* Motivational Quote Banner Card */}
      <Card className="rounded-3xl p-4 border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/60 items-center justify-center">
          <Icon name="award" size="md" color="primary" />
        </View>
        <View className="flex-1">
          <Text variant="caption" className="font-bold text-blue-900 dark:text-blue-200 italic">
            "Concepts stick better when you practice them."
          </Text>
          <Text variant="muted" className="mt-0.5">
            Small steps. Big progress.
          </Text>
        </View>
      </Card>

      {/* Footer Badge 3 */}
      <ScreenFooterBadge
        stepNum={3}
        title="Complete"
        subtitle="All materials ready, quiz locked for Free"
      />
    </View>
  );
});
