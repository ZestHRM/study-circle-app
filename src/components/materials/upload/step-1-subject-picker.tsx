import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import type { Subject } from "@/services";
import * as React from "react";
import { View } from "react-native";
import { SubjectPicker } from "./subject-picker";

export interface Step1SubjectPickerProps {
  subjectId: string;
  subjects: Subject[];
  isLoadingSubjects: boolean;
  isCreatingSubject: boolean;
  subjectError?: string;
  onSelectSubject: (id: string) => void;
  onCreateSubject: (name: string) => Promise<void>;
  onBack?: () => void;
  onContinue: () => void;
}

export type Step1DetailsProps = Step1SubjectPickerProps;

export const Step1SubjectPicker = React.memo(function Step1SubjectPicker({
  subjectId,
  subjects,
  isLoadingSubjects,
  isCreatingSubject,
  subjectError,
  onSelectSubject,
  onCreateSubject,
  onBack,
  onContinue,
}: Step1SubjectPickerProps) {
  return (
    <View className="gap-5">
      {/* Title & Subtitle Header */}
      <View className="gap-1">
        <Text variant="h2">
          Choose a subject
        </Text>
        <Text variant="muted">
          All materials and generated content will stay attached to this
          subject.
        </Text>
      </View>

      {/* Main Subject Selection Section */}
      <View className="gap-4">
        {/* Subject Cards Picker */}
        <SubjectPicker
          subjects={subjects}
          selectedSubjectId={subjectId}
          onSelectSubject={onSelectSubject}
          onCreateSubject={onCreateSubject}
          isLoading={isLoadingSubjects}
          isCreating={isCreatingSubject}
          error={subjectError}
        />
      </View>

      {/* Doodle / Motivation Callout */}
      <View className="flex-row items-center justify-center gap-2 py-1">
        <Icon name="award" size="sm" color="warning" />
        <Text variant="caption" className="font-bold tracking-wide uppercase">
          Keep Learning For A Brighter You
        </Text>
      </View>

      {/* Primary Action Button */}
      <Button
        variant="quiz"
        icon="arrow-right"
        iconPosition="right"
        title="Continue"
        disabled={!subjectId}
        onPress={onContinue}
        className="w-full h-13 rounded-2xl justify-center items-center shadow-md"
      />
    </View>
  );
});

// Alias export for backward compatibility
export const Step1Details = Step1SubjectPicker;
