import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { NoticeBox } from "@/components/ui/notice-box";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import type { PickedFileValues } from "@/schemas";
import * as React from "react";
import { ScrollView, View } from "react-native";
import { PdfDropzone } from "./pdf-dropzone";

export type Step3ExamUploadProps = {
  materialTitle: string;
  subjectName: string;
  year?: string;
  description?: string;
  grade?: string;
  fileName?: string;
  file?: PickedFileValues | null;
  submitting?: boolean;
  isParsingQuestions?: boolean;
  parsedQuestions?: string[];
  titleError?: string;
  fileError?: string;
  submitError?: string | null;
  onTitleChange?: (text: string) => void;
  onYearChange?: (text: string) => void;
  onDescriptionChange?: (text: string) => void;
  onGradeChange?: (text: string) => void;
  onPickFile?: () => void;
  onRemoveFile?: () => void;
  onEditSubject?: () => void;
  onUpload: () => void;
};

export const Step3ExamUpload = React.memo(function Step3ExamUpload({
  materialTitle,
  subjectName,
  year = "",
  description = "",
  grade = "",
  fileName,
  file,
  submitting = false,
  isParsingQuestions = false,
  parsedQuestions = [],
  titleError,
  fileError,
  submitError,
  onTitleChange,
  onYearChange,
  onDescriptionChange,
  onGradeChange,
  onPickFile,
  onRemoveFile,
  onEditSubject,
  onUpload,
}: Step3ExamUploadProps) {
  return (
    <View className="gap-5">
      {/* Header */}
      <View className="gap-1">
        <Text variant="h2">Upload PYQ / Exam Paper</Text>
        <Text variant="muted">
          Upload PDF paper. Questions will be extracted automatically using AI.
        </Text>
      </View>

      {/* Selected Subject Banner */}
      <Card className="rounded-2xl p-4 border-border bg-primary/5 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="w-9 h-9 rounded-xl bg-primary/10 items-center justify-center">
            <Icon name="book-open" size="sm" color="primary" />
          </View>
          <View>
            <Text variant="caption" className="uppercase font-semibold">
              Selected Subject
            </Text>
            <Text variant="h4">{subjectName || "General"}</Text>
          </View>
        </View>

        {onEditSubject ? (
          <Button
            variant="ghost"
            title="Edit"
            onPress={onEditSubject}
            className="px-3 py-1 h-8 rounded-full"
            textClassName="text-xs font-bold text-primary"
          />
        ) : null}
      </Card>

      {/* Material Details Input Fields */}
      <Card className="rounded-2xl p-4 gap-3.5 border-border">
        <CardContent className="p-0 gap-3.5">
          <Input
            label="Exam Title *"
            value={materialTitle}
            onChangeText={onTitleChange}
            placeholder="e.g. End Term DBMS Question Paper 2024"
            error={titleError}
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Exam Year"
                value={year}
                onChangeText={onYearChange}
                placeholder="e.g. 2024"
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Input
                label="Grade / Class"
                value={grade}
                onChangeText={onGradeChange}
                placeholder="e.g. B.Tech 2nd Year"
              />
            </View>
          </View>

          <Input
            label="Description (Optional)"
            value={description}
            onChangeText={onDescriptionChange}
            placeholder="e.g. Solved past year question paper with 22 questions"
            multiline
            numberOfLines={2}
          />
        </CardContent>
      </Card>

      {/* File Dropzone */}
      <PdfDropzone
        file={
          file ||
          (fileName
            ? ({
                name: fileName,
                uri: "",
                mimeType: "application/pdf",
                size: null,
              } as any)
            : null)
        }
        onPickFile={onPickFile || (() => {})}
        onRemoveFile={onRemoveFile || (() => {})}
        disabled={submitting || isParsingQuestions}
        error={fileError}
      />

      {/* Stage 1: Question Parsing Loading Indicator */}
      {isParsingQuestions ? (
        <Card className="p-5 items-center gap-3 bg-primary/5 border-border rounded-2xl">
          <Spinner
            variant="primary"
            size="large"
            message="Extracting questions from PDF using AI..."
            center
          />
          <Text variant="muted" className="text-xs text-center mt-1">
            Parsing past paper questions and formatting list...
          </Text>
        </Card>
      ) : null}

      {/* Stage 2: Parsed Questions Review & Final Submit Section */}
      {!isParsingQuestions && file && parsedQuestions.length > 0 ? (
        <View className="gap-3.5 mt-1">
          <Card className="p-4 gap-3 bg-primary/5 border-border rounded-2xl">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Icon name="check-circle" size={18} color="primary" />
                <Text variant="h3" className="font-extrabold text-sm">
                  Parsed Questions ({parsedQuestions.length})
                </Text>
              </View>
              <Badge label="AI Extracted" variant="default" />
            </View>

            <Text variant="muted" className="text-xs">
              Review extracted questions below. Click Submit to save paper &
              generate important topics.
            </Text>

            <ScrollView className="max-h-56 gap-2 pr-1">
              {parsedQuestions.map((q, idx) => (
                <View
                  key={idx}
                  className="flex-row items-start gap-2.5 p-2.5 rounded-xl bg-card border border-border mb-1"
                >
                  <View className="w-6 h-6 rounded-lg bg-primary/10 items-center justify-center">
                    <Text className="text-[11px] font-black text-primary">
                      Q{idx + 1}
                    </Text>
                  </View>
                  <Text
                    variant="p"
                    className="flex-1 text-xs leading-5 font-medium text-foreground"
                  >
                    {q}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </Card>

          <NoticeBox
            variant="info"
            message="Submitting will create your exam paper and generate Key Important Topics automatically."
          />

          {submitError ? (
            <Text variant="error" className="text-center">
              {submitError}
            </Text>
          ) : null}

          {/* Submit Button */}
          <Button
            variant="quiz"
            icon="check-circle"
            loading={submitting}
            loadingText="Saving & Creating Exam Paper..."
            disabled={submitting}
            title="Submit & Save Paper +"
            onPress={onUpload}
            className="w-full h-13 rounded-2xl justify-center items-center shadow-md"
          />
        </View>
      ) : !isParsingQuestions && file ? (
        <View className="gap-3">
          <NoticeBox
            variant="info"
            message="Document uploaded. Click Submit to extract questions and create exam paper."
          />

          {submitError ? (
            <Text variant="error" className="text-center">
              {submitError}
            </Text>
          ) : null}

          <Button
            variant="quiz"
            icon="upload-cloud"
            loading={submitting}
            loadingText="Processing & Saving..."
            disabled={submitting}
            title="Submit Exam Paper"
            onPress={onUpload}
            className="w-full h-13 rounded-2xl justify-center items-center shadow-md"
          />
        </View>
      ) : null}
    </View>
  );
});
