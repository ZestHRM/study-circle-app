import { Button, ErrorState, Icon, Spinner, Text } from "@/components/ui";
import { useFileDownload } from "@/hooks";
import { useThemePreference } from "@/lib/theme-preference";
import * as React from "react";
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
    const { isDark } = useThemePreference();
    const { isDownloading, downloadFile } = useFileDownload();

    const translateY = React.useRef(new Animated.Value(0)).current;

    const panResponder = React.useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return gestureState.dy > 5;
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 70 || gestureState.vy > 0.5) {
            Animated.timing(translateY, {
              toValue: 600,
              duration: 180,
              useNativeDriver: true,
            }).start(() => {
              translateY.setValue(0);
              onClose();
            });
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 4,
            }).start();
          }
        },
      }),
    ).current;

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
        title: title || "AI Study Notes",
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

    if (!open) return null;

    const sheetBgColor = isDark ? "#0c0a09" : "#ffffff";

    return (
      <Modal
        visible={open}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
        statusBarTranslucent={true}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          {/* Backdrop Touch Dismiss Area */}
          <Pressable style={{ flex: 1 }} onPress={onClose} />

          {/* Sheet Main Container with Drag Translation */}
          <Animated.View
            style={{
              height: "90%",
              width: "100%",
              transform: [{ translateY }],
            }}
          >
            <SafeAreaView
              edges={["bottom"]}
              style={{
                height: "100%",
                width: "100%",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                backgroundColor: sheetBgColor,
              }}
              className="bg-card"
            >
              {/* Header Bar with Interactive Drag Handle */}
              <View
                {...panResponder.panHandlers}
                style={{ backgroundColor: sheetBgColor }}
                className="px-5 pt-2.5 pb-3 border-b border-border flex-row items-center justify-between bg-card"
              >
                <View className="flex-1">
                  {/* Visual Drag Handle Pill */}
                  <View className="w-12 h-1.5 bg-border rounded-full self-center mb-2.5" />

                  <Text variant="h3" numberOfLines={1}>
                    {title || "AI Generated Notes"}
                  </Text>
                  <Text variant="caption" className="mt-0.5">
                    Subject: {subjectName} • {formattedDate}
                  </Text>
                </View>

                <Pressable
                  onPress={onClose}
                  className="w-9 h-9 rounded-full bg-muted items-center justify-center active:opacity-75 ml-2"
                  hitSlop={8}
                >
                  <Icon name="x" size={18} className="text-muted-foreground" />
                </Pressable>
              </View>

              {/* Scrollable Content Body - Native ScrollView that ALWAYS SCROLLS smoothly */}
              <View style={{ flex: 1, backgroundColor: sheetBgColor }}>
                {isLoading ? (
                  <View className="flex-1 items-center justify-center p-8">
                    <Spinner
                      variant="terracotta"
                      size="large"
                      message="Fetching AI Notes..."
                      center
                    />
                  </View>
                ) : isError ? (
                  <ErrorState
                    icon="alert-circle"
                    title="Unable to Load Notes"
                    description="Could not load note content at this time."
                    actionLabel={onRetry ? "Retry" : undefined}
                    actionIcon="rotate-ccw"
                    actionVariant="outline"
                    onAction={onRetry}
                  />
                ) : (
                  <ScrollView
                    style={{ flex: 1, backgroundColor: sheetBgColor }}
                    className="bg-card"
                    showsVerticalScrollIndicator={true}
                    keyboardShouldPersistTaps="handled"
                    bounces={true}
                  >
                    <View className="p-5">
                      <HtmlNotesView content={content} />
                    </View>
                  </ScrollView>
                )}
              </View>

              {/* Fixed Action Buttons Footer Bar - Pinned at bottom of screen */}
              <View
                style={{ backgroundColor: sheetBgColor }}
                className="px-5 py-3.5 bg-card border-t border-border flex-row items-center gap-3"
              >
                <Button
                  variant="terracotta"
                  icon="download"
                  loading={isDownloading}
                  loadingText="Downloading..."
                  title="Download Notes"
                  className="flex-1 h-12 justify-center items-center rounded-2xl"
                  onPress={handleDownload}
                />

                {onTakeQuiz ? (
                  <Button
                    variant="quiz"
                    icon="zap"
                    title={isQuizReady ? "Take Quiz" : "Quiz Pending"}
                    disabled={!isQuizReady}
                    className="flex-1 h-12 justify-center items-center rounded-2xl"
                    onPress={handleTakeQuizPress}
                  />
                ) : (
                  <Button
                    variant="outline"
                    title="Close"
                    className="flex-1 h-12 justify-center items-center rounded-2xl"
                    onPress={onClose}
                  />
                )}
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
    );
  },
);

export const FullScreenNotesModal = NotesDetailBottomSheet;
