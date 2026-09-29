import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { Pressable, View } from "react-native";

export type PickedMaterialFile = {
  uri: string;
  name: string;
  mimeType: string;
  size: number | null;
};

interface PdfDropzoneProps {
  file: PickedMaterialFile | null;
  onPickFile: () => void;
  onRemoveFile?: () => void;
  disabled?: boolean;
  error?: string | null;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes || bytes <= 0) return "PDF File";
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    return `${kb.toFixed(0)} KB`;
  }
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export const PdfDropzone = React.memo(function PdfDropzone({
  file,
  onPickFile,
  onRemoveFile,
  disabled = false,
  error,
}: PdfDropzoneProps) {
  return (
    <View className="gap-4">
      {/* Upload Dropzone */}
      <Pressable
        onPress={onPickFile}
        disabled={disabled}
        className="bg-primary/10 border-2 border-dashed border-primary/30 rounded-3xl p-6 items-center justify-center gap-2 active:opacity-80"
      >
        <View className="w-14 h-14 rounded-full bg-card items-center justify-center border border-border shadow-xs">
          <Icon name="cloud" size={26} color="primary" />
        </View>

        <Text variant="h4" className="text-center">
          Tap to select PDF file
        </Text>
        <Text variant="muted" className="text-center">
          Maximum file size: 25 MB
        </Text>
      </Pressable>

      {/* Selected File Card */}
      {file ? (
        <View className="bg-card rounded-2xl p-4 border border-border flex-row items-center justify-between shadow-xs">
          <View className="flex-row items-center gap-3 flex-1 pr-2">
            <View className="w-10 h-10 rounded-full bg-warning-bg items-center justify-center">
              <Icon name="file-text" size={20} color="warning" />
            </View>

            <View className="flex-1">
              <Text variant="subhead" numberOfLines={1}>
                {file.name}
              </Text>
              <Text variant="muted">{formatFileSize(file.size)}</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            <View className="w-7 h-7 rounded-full bg-emerald-500/10 items-center justify-center">
              <Icon name="check" size={16} color="emerald" />
            </View>
            {onRemoveFile ? (
              <Pressable onPress={onRemoveFile} className="p-1">
                <Icon name="x" size={16} color="muted" />
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      {error ? <Text variant="error">{error}</Text> : null}
    </View>
  );
});
