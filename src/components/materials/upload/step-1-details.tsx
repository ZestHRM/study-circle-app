import { SubjectPicker } from "./subject-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import type { Subject } from "@/services";
import * as React from "react";
import { View } from "react-native";

export interface Step1DetailsProps {
  title: string;
  subjectId: string;
  subjects: Subject[];
  isLoadingSubjects: boolean;
  isCreatingSubject: boolean;
  titleError?: string;
  subjectError?: string;
  onTitleChange: (text: string) => void;
  onSelectSubject: (id: string) => void;
  onCreateSubject: (name: string) => Promise<void>;
  onBack?: () => void;
  onContinue: () => void;
}

export const Step1Details = React.memo(function Step1Details({
  title,
  subjectId,
  subjects,
  isLoadingSubjects,
  isCreatingSubject,
  titleError,
  subjectError,
  onTitleChange,
  onSelectSubject,
  onCreateSubject,
  onBack,
  onContinue,
}: Step1DetailsProps) {
  return (
    <View className="gap-5">
      {/* Title Header */}
      <View className="gap-1">
        <Text variant="h1">Add study material</Text>
        <Text variant="muted">
          Tell us about your material so we can create the best notes for you.
        </Text>
      </View>

      {/* Main Form Container Card */}
      <Card className="rounded-3xl p-5 gap-4">
        <CardContent className="p-0 gap-4">
          {/* Subject Selection Dropdown */}
          <View className="gap-1.5">
            <Text variant="subhead">Subject</Text>
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

          {/* Material Title Input */}
          <Input
            label="Material title"
            value={title}
            onChangeText={onTitleChange}
            placeholder="e.g. Database Management Systems"
            error={titleError}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <View className="flex-row items-center gap-3 pt-1">
        {onBack ? (
          <Button
            variant="outline"
            icon="arrow-left"
            title="Back"
            onPress={onBack}
            className="w-24 h-12 rounded-2xl justify-center items-center"
          />
        ) : null}
        <Button
          variant="quiz"
          icon="arrow-right"
          iconPosition="right"
          title="Continue"
          onPress={onContinue}
          className="flex-1 h-12 rounded-2xl justify-center items-center"
        />
      </View>
    </View>
  );
});
