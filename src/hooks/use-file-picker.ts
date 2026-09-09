import { pickedFileSchema, type PickedFileValues } from "@/schemas";
import * as DocumentPicker from "expo-document-picker";
import * as React from "react";

export type UseFilePickerOptions = {
  allowedTypes?: string[];
};

export function useFilePicker(options?: UseFilePickerOptions) {
  const [file, setFile] = React.useState<PickedFileValues | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const allowedTypes = React.useMemo(
    () =>
      options?.allowedTypes ?? [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "image/*",
      ],
    [options?.allowedTypes],
  );

  const pickFile = React.useCallback(async (): Promise<PickedFileValues | null> => {
    setError(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: false,
        copyToCacheDirectory: true,
        type: allowedTypes,
      });

      if (result.canceled || !result.assets?.[0]) {
        return null;
      }

      const picked = result.assets[0];
      const candidateFile: PickedFileValues = {
        uri: picked.uri,
        name: picked.name,
        mimeType: picked.mimeType ?? "application/pdf",
        size: picked.size ?? null,
      };

      const parseResult = pickedFileSchema.safeParse(candidateFile);
      if (!parseResult.success) {
        const msg = parseResult.error.issues[0]?.message ?? "Invalid file selected.";
        setError(msg);
        return null;
      }

      setFile(parseResult.data);
      setError(null);
      return parseResult.data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to select file.";
      setError(msg);
      return null;
    }
  }, [allowedTypes]);

  const removeFile = React.useCallback(() => {
    setFile(null);
    setError(null);
  }, []);

  const reset = React.useCallback(() => {
    setFile(null);
    setError(null);
  }, []);

  return {
    file,
    error,
    pickFile,
    removeFile,
    setError,
    reset,
    setFile,
  };
}
