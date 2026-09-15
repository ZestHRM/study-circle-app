import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { NoticeBox } from "@/components/ui/notice-box";
import { Text } from "@/components/ui/text";
import type { PickedFileValues } from "@/schemas";
import * as React from "react";
import { View } from "react-native";
import { PdfDropzone } from "./pdf-dropzone";

export interface Step3FileUploadProps {
  materialTitle: string;
  subjectName: string;
  fileName?: string;
  file?: PickedFileValues | null;
  submitting?: boolean;
  titleError?: string;
  fileError?: string;
  submitError?: string | null;
  onTitleChange?: (text: string) => void;
  onPickFile?: () => void;
  onRemoveFile?: () => void;
  onEditSubject?: () => void;
  onUpload: () => void;
}

export type Step3ProcessingProps = Step3FileUploadProps;

export const Step3FileUpload = React.memo(function Step3FileUpload({
  materialTitle,
  subjectName,
  fileName,
  file,
  submitting = false,
  titleError,
  fileError,
  submitError,
  onTitleChange,
  onPickFile,
  onRemoveFile,
  onEditSubject,
  onUpload,
}: Step3FileUploadProps) {
  return (
    <View className="gap-5">
      {/* Title & Subtitle Header */}
      <View className="gap-1">
        <Text variant="h2">Add study materials</Text>
        <Text variant="muted">
          Upload PDF documents or files so we can generate notes & quizzes.
        </Text>
      </View>

      {/* Selected Subject Banner */}
      <Card className="rounded-2xl p-4 border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="w-9 h-9 rounded-xl bg-blue-500/15 items-center justify-center">
            <Icon name="book-open" size="sm" color="primary" />
          </View>
          <View>
            <Text variant="caption" className="uppercase font-semibold">
              Selected subject
            </Text>
            <Text variant="h4">{subjectName}</Text>
          </View>
        </View>

        {onEditSubject ? (
          <Button
            variant="ghost"
            title="Edit"
            onPress={onEditSubject}
            className="px-3 py-1 h-8 rounded-full"
            textClassName="text-xs font-bold text-blue-600 dark:text-blue-400"
          />
        ) : null}
      </Card>

      {/* Material Title Input Field */}
      <Card className="rounded-2xl p-4 border-stone-200 dark:border-stone-800">
        <CardContent className="p-0">
          <Input
            label="Material title"
            value={materialTitle}
            onChangeText={onTitleChange}
            placeholder="e.g. Database Management Systems / Chapter 1"
            error={titleError}
          />
        </CardContent>
      </Card>

      {/* File Dropzone Box */}
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
        disabled={submitting}
        error={fileError}
      />

      {/* Tip Notice Box */}
      <NoticeBox
        variant="info"
        message=" Supported formats: PDF documents and images (up to 25 MB)."
      />

      {submitError ? (
        <Text variant="error" className="text-center">
          {submitError}
        </Text>
      ) : null}

      {/* Doodle / Motivation Text */}
      <View className="flex-row items-center justify-center gap-2 py-1">
        <Icon name="book-open" size="sm" color="primary" />
        <Text variant="caption" className="font-bold tracking-wide uppercase">
          Good Materials • Great Progress
        </Text>
      </View>

      {/* Upload & Process Button */}
      <Button
        variant="quiz"
        icon="upload-cloud"
        loading={submitting}
        loadingText="Uploading & Processing..."
        disabled={!file || submitting}
        title="Upload & Process"
        onPress={onUpload}
        className="w-full h-13 rounded-2xl justify-center items-center shadow-md"
      />
    </View>
  );
});

// Alias export for backward compatibility
export const Step3Processing = Step3FileUpload;
