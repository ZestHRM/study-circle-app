import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import * as React from "react";
import { ScrollView, View } from "react-native";

export type QuestionsTabProps = {
  questions?: string[];
  materialTitle?: string;
};

export const QuestionsTab = React.memo(function QuestionsTab({
  questions = [],
  materialTitle = "Exam Paper",
}: QuestionsTabProps) {
  if (!questions || questions.length === 0) {
    return (
      <ScrollView className="flex-1 bg-background p-4">
        <Card className="p-6 items-center gap-3 bg-card border-dashed border-border">
          <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center">
            <Icon name="help-circle" size={24} color={APP_COLORS.primary} />
          </View>
          <Text variant="h3" className="text-center">
            No Extracted Questions Found
          </Text>
          <Text variant="muted" className="text-center text-xs leading-5">
            Questions will automatically appear here once AI finishes parsing
            the exam paper questions.
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
      {/* Header Summary */}
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center gap-2">
          <Icon name="help-circle" size={18} color={APP_COLORS.primary} />
          <Text variant="h3" className="font-extrabold text-base">
            Exam Questions ({questions.length})
          </Text>
        </View>
        <Badge label="Past Paper" variant="default" />
      </View>

      {/* Question Cards List */}
      {questions.map((questionText, index) => (
        <Card key={index} className="p-4 gap-2.5 bg-card border-border">
          <View className="flex-row items-start gap-3">
            <View className="w-7 h-7 rounded-xl bg-primary/10 items-center justify-center flex-shrink-0">
              <Text className="text-xs font-black text-primary">
                Q{index + 1}
              </Text>
            </View>
            <View className="flex-1 pt-0.5">
              <Text
                variant="h4"
                className="text-sm font-bold text-foreground leading-6"
              >
                {questionText}
              </Text>
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
});
