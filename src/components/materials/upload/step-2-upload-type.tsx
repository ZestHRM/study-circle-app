import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SelectionCard } from "@/components/ui/selection-card";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { View } from "react-native";
export interface Step2UploadTypeProps {
  selectedSubjectName?: string;
  onContinue: (uploadType: "STUDY_MATERIAL" | "PYQ") => void;
}

export type Step2UploadProps = Step2UploadTypeProps;

export const Step2UploadType = React.memo(function Step2UploadType({
  selectedSubjectName,
  onContinue,
}: Step2UploadTypeProps) {
  const [selectedUploadType, setSelectedUploadType] = React.useState<
    "STUDY_MATERIAL" | "PYQ"
  >("STUDY_MATERIAL");

  const handleContinuePress = React.useCallback(() => {
    onContinue(selectedUploadType);
  }, [onContinue, selectedUploadType]);

  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text variant="h2">What are you uploading?</Text>
        <Text variant="muted">
          Choose the type of content so we can organise and process it better.
        </Text>
      </View>

      {selectedSubjectName ? (
        <View className="flex-row items-center gap-2 bg-primary/10 px-3.5 py-2 rounded-xl border border-primary/20 align-self-start">
          <Icon name="book-open" size="xs" color="primary" />
          <Text variant="caption" className="font-semibold text-primary">
            Subject: {selectedSubjectName}
          </Text>
        </View>
      ) : null}

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
          features={[
            { text: "Upload past year papers (PYQs)", iconColor: "warning" },
            {
              text: "Get important questions with explanations and relevance",
              iconColor: "warning",
            },
          ]}
        />
      </View>
      <Button
        variant="quiz"
        icon="arrow-right"
        iconPosition="right"
        title="Continue"
        onPress={handleContinuePress}
        className="w-full h-13 rounded-2xl justify-center items-center shadow-md"
      />
    </View>
  );
});

export const Step2Upload = Step2UploadType;
