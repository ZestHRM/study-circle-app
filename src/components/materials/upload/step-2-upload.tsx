import { Button } from "@/components/ui/button";
import { NoticeBox } from "@/components/ui/notice-box";
import { Text } from "@/components/ui/text";
import type { PickedFileValues } from "@/schemas";
import * as React from "react";
import { View } from "react-native";
import { PdfDropzone } from "./pdf-dropzone";

export interface Step2UploadProps {
  file: PickedFileValues | null;
  submitting: boolean;
  fileError?: string;
  submitError?: string | null;
  onPickFile: () => void;
  onRemoveFile: () => void;
  onBack?: () => void;
  onUpload: () => void;
}

export const Step2Upload = React.memo(function Step2Upload({
  file,
  submitting,
  fileError,
  submitError,
  onPickFile,
  onRemoveFile,
  onBack,
  onUpload,
}: Step2UploadProps) {
  return (
    <View className="gap-5">
      {/* Title Header */}
      <View className="gap-1">
        <Text variant="h1">Choose your file</Text>
        <Text variant="muted">
          Upload your study material and we'll create notes, summaries and
          practice questions.
        </Text>
      </View>

      {/* File Dropzone Component */}
      <PdfDropzone
        file={file}
        onPickFile={onPickFile}
        onRemoveFile={onRemoveFile}
        disabled={submitting}
        error={fileError}
      />

      {/* Info Notice Box */}
      <NoticeBox message="Large documents may take longer. You can leave while we process." />

      {submitError ? (
        <Text variant="error" className="text-center text-xs">
          {submitError}
        </Text>
      ) : null}

      {/* Action Buttons */}
      <View className="flex-row items-center gap-3 pt-1">
        {onBack ? (
          <Button
            variant="outline"
            icon="arrow-left"
            title="Back"
            disabled={submitting}
            onPress={onBack}
            className="w-24 h-12 rounded-2xl justify-center items-center"
          />
        ) : null}
        <Button
          variant="quiz"
          icon="upload-cloud"
          loading={submitting}
          loadingText="Uploading..."
          disabled={!file || submitting}
          title="Upload & create notes"
          onPress={onUpload}
          className="flex-1 h-12 rounded-2xl justify-center items-center"
        />
      </View>
    </View>
  );
});
