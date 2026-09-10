import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { NoticeBox } from "@/components/ui/notice-box";
import { SelectionCard } from "@/components/ui/selection-card";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import * as React from "react";
import { View } from "react-native";

export interface Step2UploadTypeProps {
  selectedSubjectName?: string;
  submitError?: string | null;
  onContinue: () => void;
}

export type Step2UploadProps = Step2UploadTypeProps;

export const Step2UploadType = React.memo(function Step2UploadType({
  selectedSubjectName,
  submitError,
  onContinue,
}: Step2UploadTypeProps) {
  const [selectedUploadType, setSelectedUploadType] = React.useState<
    "STUDY_MATERIAL" | "PYQ"
  >("STUDY_MATERIAL");

  return (
    <View className="gap-5">
      {/* Title & Subtitle Header */}
      <View className="gap-1">
        <Text variant="h2">
          What are you uploading?
        </Text>
        <Text variant="muted">
          Choose the type of content so we can organise and process it better.
        </Text>
      </View>

      {/* Selected Subject Badge */}
      {selectedSubjectName ? (
        <View className="flex-row items-center gap-2 bg-blue-50 dark:bg-blue-950/40 px-3.5 py-2 rounded-xl border border-blue-200 dark:border-blue-900/60 align-self-start">
          <Icon name="book-open" size="xs" color="primary" />
          <Text variant="caption" className="font-semibold text-blue-900 dark:text-blue-200">
            Subject: {selectedSubjectName}
          </Text>
        </View>
      ) : null}

      {/* Upload Option Cards */}
      <View className="gap-4">
        {/* Option 1: Study Material */}
        <SelectionCard
          selected={selectedUploadType === "STUDY_MATERIAL"}
          onPress={() => setSelectedUploadType("STUDY_MATERIAL")}
          title="Study material"
          subtitle="Notes + Quiz outcomes"
          icon="file-text"
          iconColor="primary"
          features={[
            "Class notes, textbooks, handouts",
            "We'll create summaries, flashcards and quizzes",
          ]}
        />

        {/* Option 2: Past Year Question Paper (PYQ) */}
        <SelectionCard
          selected={selectedUploadType === "PYQ"}
          onPress={() => setSelectedUploadType("PYQ")}
          title="Past year question paper (PYQ)"
          subtitle="Important questions + why they matter"
          icon="clipboard"
          iconColor="warning"
          badge={<Badge label="Paid plan" icon="lock" variant="amber" />}
          features={[
            { text: "Upload past year papers (PYQs)", iconColor: "warning" },
            {
              text: "Get important questions with explanations and relevance",
              iconColor: "warning",
            },
          ]}
        />
      </View>

      {/* Info Notice Box */}
      <NoticeBox
        variant="info"
        message="PYQ analysis is available on a paid plan. Learn how StudyCircleAI helps you prepare faster."
      />

      {submitError ? (
        <Text variant="error" className="text-center">
          {submitError}
        </Text>
      ) : null}

      {/* Primary Action Button */}
      <Button
        variant="quiz"
        icon="arrow-right"
        iconPosition="right"
        title="Continue"
        onPress={onContinue}
        className="w-full h-13 rounded-2xl justify-center items-center shadow-md"
      />
    </View>
  );
});

// Alias export for backward compatibility
export const Step2Upload = Step2UploadType;
