import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SelectionCard } from "@/components/ui/selection-card";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { View } from "react-native";

export interface Step2UploadTypeProps {
  selectedSubjectName?: string;
  initialType?: "STUDY_MATERIAL" | "PYQ";
  submitError?: string | null;
  onContinue: (uploadType: "STUDY_MATERIAL" | "PYQ") => void;
}

export type Step2UploadProps = Step2UploadTypeProps;

export const Step2UploadType = React.memo(function Step2UploadType({
  selectedSubjectName,
  initialType = "STUDY_MATERIAL",
  submitError,
  onContinue,
}: Step2UploadTypeProps) {
  const [selectedUploadType, setSelectedUploadType] = React.useState<
    "STUDY_MATERIAL" | "PYQ"
  >(initialType);

  React.useEffect(() => {
    if (initialType) {
      setSelectedUploadType(initialType);
    }
  }, [initialType]);

  const handleContinuePress = React.useCallback(() => {
    onContinue(selectedUploadType);
  }, [onContinue, selectedUploadType]);

  return (
    <View className="gap-5">
      {/* Title & Subtitle Header */}
      <View className="gap-1">
        <Text variant="h2">What are you uploading?</Text>
        <Text variant="muted">
          Choose the type of content so we can organise and process it better.
        </Text>
      </View>

      {/* Selected Subject Badge */}
      {selectedSubjectName ? (
        <View className="flex-row items-center gap-2 bg-primary/10 px-3.5 py-2 rounded-xl border border-primary/20 align-self-start">
          <Icon name="book-open" size="xs" color="primary" />
          <Text variant="caption" className="font-semibold text-primary">
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
          features={[
            { text: "Upload past year papers (PYQs)", iconColor: "warning" },
            {
              text: "Get important questions with explanations and relevance",
              iconColor: "warning",
            },
          ]}
        />
      </View>

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
        onPress={handleContinuePress}
        className="w-full h-13 rounded-2xl justify-center items-center shadow-md"
      />
    </View>
  );
});

// Alias export for backward compatibility
export const Step2Upload = Step2UploadType;
