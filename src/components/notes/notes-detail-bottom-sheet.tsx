import {
  AppBottomSheet,
  AppBottomSheetScrollView,
} from "@/components/ui/app-bottom-sheet";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { useFileDownload } from "@/hooks";
import { Feather } from "@expo/vector-icons";
import * as React from "react";
import { Spinner } from "@/components/ui/spinner";
import { View } from "react-native";
import { HtmlNotesView } from "./html-notes-view";

interface NotesDetailBottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subjectName?: string;
  createdAt?: string;
  content?: string | null;
  pdfUrl?: string | null;
  isLoading?: boolean;
  isError?: boolean;
  isQuizReady?: boolean;
  onRetry?: () => void;
  onTakeQuiz?: () => void;
}

export const NotesDetailBottomSheet = React.memo(
  function NotesDetailBottomSheet({
    open,
    onClose,
    title,
    subjectName = "General",
    createdAt,
    content,
    pdfUrl,
    isLoading = false,
    isError = false,
    isQuizReady = true,
    onRetry,
    onTakeQuiz,
  }: NotesDetailBottomSheetProps) {
    const { isDownloading, downloadFile } = useFileDownload();

    const formattedDate = React.useMemo(() => {
      if (!createdAt) return "Recent";
      const parsed = new Date(createdAt);
      if (Number.isNaN(parsed.getTime())) return "Recent";
      return parsed.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }, [createdAt]);

    const handleDownload = React.useCallback(async () => {
      await downloadFile({
        url: pdfUrl,
        title,
        subjectName,
        content,
      });
    }, [downloadFile, pdfUrl, title, subjectName, content]);

    const handleTakeQuizPress = React.useCallback(() => {
      onClose();
      if (onTakeQuiz) {
        onTakeQuiz();
      }
    }, [onClose, onTakeQuiz]);

    return (
      <AppBottomSheet
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) onClose();
        }}
        snapPoints={["90%"]}
        initialIndex={0}
        enablePanDownToClose={true}
        enableContentPanningGesture={true}
        title={title || "AI Generated Notes"}
        description={`Subject: ${subjectName} • ${formattedDate}`}
      >
        {isLoading ? (
          <Spinner
            variant="terracotta"
            size="large"
            message="Fetching AI Notes..."
            containerStyle={{ paddingVertical: 64 }}
          />
        ) : isError ? (
          <View className="py-12 items-center justify-center gap-3">
            <Feather name="alert-circle" size={24} color={APP_COLORS.error} />
            <Text className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Unable to Load Notes
            </Text>
            {onRetry ? (
              <Button variant="outline" title="Retry" onPress={onRetry} />
            ) : null}
          </View>
        ) : (
          <AppBottomSheetScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            bounces={true}
            contentContainerStyle={{ gap: 16, paddingTop: 4, paddingBottom: 120 }}
          >
            <HtmlNotesView content={content} />
          </AppBottomSheetScrollView>
        )}


        {/* Footer Action Buttons */}
        <View className="flex-row items-center gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
          <Button
            variant="terracotta"
            icon="download"
            loading={isDownloading}
            loadingText="Downloading..."
            title="Download Notes"
            className="flex-1 h-11 justify-center items-center"
            onPress={handleDownload}
          />

          {onTakeQuiz ? (
            <Button
              variant="quiz"
              icon="zap"
              title={isQuizReady ? "Take Quiz" : "Quiz Pending"}
              disabled={!isQuizReady}
              className="flex-1 h-11 justify-center items-center"
              onPress={handleTakeQuizPress}
            />
          ) : (
            <Button
              variant="outline"
              title="Close"
              className="flex-1 h-11 justify-center items-center"
              onPress={onClose}
            />
          )}
        </View>
      </AppBottomSheet>
    );
  },
);

// Alias for backward compatibility
export const FullScreenNotesModal = NotesDetailBottomSheet;
