import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { examMaterialsApi, type ImportantTopic } from "@/services";
import * as React from "react";
import { ScrollView, View } from "react-native";

export type ImportantTopicsTabProps = {
  examPaperId?: string;
  subjectId?: string | number;
  materialTitle?: string;
};

export const ImportantTopicsTab = React.memo(function ImportantTopicsTab({
  examPaperId,
  subjectId,
  materialTitle,
}: ImportantTopicsTabProps) {
  const [topics, setTopics] = React.useState<ImportantTopic[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  const fetchTopics = React.useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await examMaterialsApi.getImportantTopics({
        examPaperId,
        subjectId,
        limit: 20,
      });
      setTopics(res.data ?? []);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [examPaperId, subjectId]);

  React.useEffect(() => {
    void fetchTopics();
  }, [fetchTopics]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center py-16">
        <Spinner
          variant="primary"
          size="large"
          message="Loading Important Topics..."
          center
        />
      </View>
    );
  }

  if (isError || topics.length === 0) {
    return (
      <ScrollView className="flex-1 bg-background p-4">
        <Card className="p-6 items-center gap-3 border-dashed border-border bg-card">
          <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center">
            <Icon name="award" size={24} color={APP_COLORS.primary} />
          </View>
          <Text variant="h3" className="text-center">
            No Important Topics Identified
          </Text>
          <Text variant="muted" className="text-center text-xs leading-5">
            Topics are generated automatically when exam papers are uploaded and
            processed by AI.
          </Text>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, gap: 12 }}
    >
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center gap-2">
          <Icon name="zap" size={18} color={APP_COLORS.primary} />
          <Text variant="h3" className="font-extrabold text-base">
            Key Important Topics
          </Text>
        </View>
        <Badge label={`${topics.length} Topics`} variant="blue" />
      </View>

      {topics.map((item, index) => {
        const difficultyVariant =
          item.difficulty === "high"
            ? "destructive"
            : item.difficulty === "medium"
              ? "amber"
              : "emerald";

        return (
          <Card
            key={item.id ?? index}
            className="p-4 gap-3 border-l-4 border-l-primary border-border bg-card"
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-2">
                <Text
                  variant="h3"
                  className="text-base font-bold text-foreground"
                >
                  {item.topic}
                </Text>
                {item.description ? (
                  <Text variant="muted" className="text-xs mt-1 leading-5">
                    {item.description}
                  </Text>
                ) : null}
              </View>
              {item.importunacy ? (
                <View className="items-end">
                  <Badge label={`Score ${item.importunacy}`} variant="amber" />
                </View>
              ) : null}
            </View>

            {/* Difficulty & Estimated Duration badges */}
            <View className="flex-row items-center gap-2 pt-1 border-t border-border flex-wrap">
              {item.difficulty ? (
                <Badge
                  label={`${item.difficulty.toUpperCase()} Difficulty`}
                  icon="activity"
                  variant={difficultyVariant}
                />
              ) : null}

              {item.estimatedDuration ? (
                <View className="flex-row items-center gap-1 bg-muted px-2.5 py-1 rounded-md">
                  <Icon name="clock" size={12} color={APP_COLORS.stone500} />
                  <Text variant="caption" className="text-[11px] font-medium">
                    ~{Math.round(item.estimatedDuration / 60)} min read
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Reasons / Key Takeaways */}
            {item.reason && item.reason.length > 0 ? (
              <View className="bg-primary/5 p-3 rounded-xl gap-1.5 mt-1 border border-border">
                <Text variant="caption" className="font-bold text-primary">
                  Why this topic is important:
                </Text>
                {item.reason.map((r, rIdx) => (
                  <View key={rIdx} className="flex-row items-start gap-2">
                    <Icon
                      name="check-circle"
                      size={13}
                      color={APP_COLORS.primary}
                      className="mt-0.5"
                    />
                    <Text
                      variant="caption"
                      className="flex-1 text-xs text-foreground font-medium"
                    >
                      {r}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </Card>
        );
      })}
    </ScrollView>
  );
});
