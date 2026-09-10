import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import type { PickedFileValues } from "@/schemas";
import type { StudyMaterialQuizStatus, StudyMaterialStatus } from "@/services";
import * as React from "react";
import { ActivityIndicator, View } from "react-native";
import { ScreenFooterBadge } from "./screen-footer-badge";
import { SubjectBannerCard } from "./subject-banner-card";

export interface Step4ProcessingProps {
  viewState: 1 | 2;
  displaySubject: string;
  displayTitle: string;
  displayFileName: string;
  file?: PickedFileValues | null;
  materialStatus?: StudyMaterialStatus;
  quizStatus?: StudyMaterialQuizStatus;
  isNotesReady?: boolean;
  isQuizReady?: boolean;
  onReadNotes: () => void;
  onViewSubject?: () => void;
  onMoveToComplete: () => void;
}

interface StepperItemConfig {
  id: string;
  title: string;
  completedSubtitle: string;
  activeSubtitle?: string;
  isDone: boolean;
  isActive: boolean;
  progressPercent?: number;
  spinnerColor?: string;
}

export const Step4Processing = React.memo(function Step4Processing({
  viewState,
  displaySubject,
  displayTitle,
  displayFileName,
  file,
  materialStatus,
  quizStatus,
  isNotesReady,
  isQuizReady,
  onReadNotes,
  onViewSubject,
  onMoveToComplete,
}: Step4ProcessingProps) {
  // Calculate dynamic status flags
  const isContentExtracted =
    materialStatus === "GENERATING_NOTES" ||
    materialStatus === "NOTES_GENERATED" ||
    materialStatus === "PROCESSED" ||
    viewState >= 2;
  const isExtracting = !isContentExtracted && viewState === 1;

  const isNotesDone = viewState >= 2 || Boolean(isNotesReady);
  const isGeneratingNotes =
    viewState === 1 && !isNotesDone && isContentExtracted;

  const isQuizDone = quizStatus === "GENERATED" || Boolean(isQuizReady);
  const isQuizGenerating = viewState === 2 && !isQuizDone;

  // Dynamic live progress bar calculation (driven by backend processing state)
  const [activeProgress, setActiveProgress] = React.useState(25);

  React.useEffect(() => {
    setActiveProgress(25);
    const interval = setInterval(() => {
      setActiveProgress((prev) =>
        prev < 92 ? prev + Math.floor(Math.random() * 5 + 3) : 92,
      );
    }, 600);

    return () => clearInterval(interval);
  }, [materialStatus, quizStatus, viewState]);

  const stepsConfig = React.useMemo<StepperItemConfig[]>(
    () => [
      {
        id: "upload_complete",
        title: "Upload complete",
        completedSubtitle: "1 file uploaded",
        isDone: true,
        isActive: false,
        progressPercent: 100,
      },
      {
        id: "extracting_content",
        title: "Extracting content",
        completedSubtitle: "Found text, images and key information",
        activeSubtitle: "Finding text, images and key information...",
        isDone: isContentExtracted,
        isActive: isExtracting,
        progressPercent: isContentExtracted
          ? 100
          : isExtracting
            ? activeProgress
            : 0,
      },
      {
        id: "generating_notes",
        title: "Generating notes",
        completedSubtitle: "Your personalized notes are ready",
        activeSubtitle: "Creating your personalized notes...",
        isDone: isNotesDone,
        isActive: isGeneratingNotes,
        progressPercent: isNotesDone
          ? 100
          : isGeneratingNotes
            ? activeProgress
            : 0,
      },
      {
        id: "preparing_quiz",
        title: "Preparing quiz",
        completedSubtitle: "Practice quiz is ready",
        activeSubtitle: "Creating practice questions...",
        isDone: isQuizDone,
        isActive: isQuizGenerating,
        progressPercent: isQuizDone
          ? 100
          : isQuizGenerating
            ? activeProgress
            : 0,
        spinnerColor: APP_COLORS.brandPurple,
      },
    ],
    [
      isContentExtracted,
      isExtracting,
      isNotesDone,
      isGeneratingNotes,
      isQuizDone,
      isQuizGenerating,
      activeProgress,
    ],
  );

  return (
    <View className="gap-5">
      {/* Title & Subtitle Header */}
      <View className="gap-1">
        <Text variant="h2">
          {viewState === 2
            ? "Your notes are ready"
            : "Understanding your materials"}
        </Text>
        <Text variant="muted">
          {viewState === 2
            ? "We're putting the final touches on your practice quiz."
            : "We're analyzing your files and finding the key concepts."}
        </Text>
      </View>

      {/* Subject Banner Card */}
      <SubjectBannerCard subject={displaySubject} title={displayTitle} />

      {/* Files List Card (Shown in Screen 1 Processing) */}
      {viewState === 1 ? (
        <Card className="rounded-2xl p-3.5 border-stone-200 dark:border-stone-800 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1 pr-2">
            <View className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/40 items-center justify-center">
              <Icon name="file-text" size="sm" color="error" />
            </View>
            <View className="flex-1">
              <Text
                variant="h4"
                numberOfLines={1}
              >
                {displayFileName}
              </Text>
              <Text variant="caption">
                {file?.size
                  ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                  : "Document"}
              </Text>
            </View>
          </View>

          <Badge label="Uploaded" variant="emerald" icon="check" />
        </Card>
      ) : null}

      {/* Linked Vertical Stepper Timeline Card */}
      <Card className="rounded-3xl p-5 border-stone-200 dark:border-stone-800 gap-1 shadow-2xs">
        {stepsConfig.map((step, index) => {
          const isLast = index === stepsConfig.length - 1;
          const nextStep = stepsConfig[index + 1];

          const lineBgColor =
            step.isDone && nextStep?.isDone
              ? APP_COLORS.success
              : step.isDone ||
                  step.isActive ||
                  nextStep?.isActive ||
                  nextStep?.isDone
                ? APP_COLORS.brandPurple
                : "#E7E5E4";

          return (
            <View key={step.id} className="flex-row items-stretch gap-3.5">
              <View className="items-center w-7">
                <View
                  style={{
                    backgroundColor: step.isDone
                      ? APP_COLORS.success
                      : step.isActive
                        ? step.spinnerColor === APP_COLORS.brandPurple
                          ? APP_COLORS.brandPurpleLight
                          : APP_COLORS.brandPurple
                        : "transparent",
                    borderColor: step.isDone
                      ? APP_COLORS.success
                      : step.isActive
                        ? APP_COLORS.brandPurple
                        : "#D6D3D1",
                  }}
                  className="w-7 h-7 rounded-full items-center justify-center border-2 z-10"
                >
                  {step.isDone ? (
                    <Icon name="check" size="xs" color="white" />
                  ) : step.isActive ? (
                    <ActivityIndicator
                      size="small"
                      color={step.spinnerColor || "#FFFFFF"}
                    />
                  ) : (
                    <Icon name="clock" size="xs" color="muted" />
                  )}
                </View>

                {!isLast && (
                  <View
                    className="w-[2px] flex-1 my-1"
                    style={{ backgroundColor: lineBgColor }}
                  />
                )}
              </View>

              <View className="flex-1 pb-4">
                <Text variant="h4">
                  {step.title}
                </Text>
                <Text variant="muted" className="mt-0.5">
                  {step.isDone
                    ? step.completedSubtitle
                    : step.isActive
                      ? step.activeSubtitle
                      : "Queued..."}
                </Text>

                {step.isActive && step.progressPercent ? (
                  <View className="h-1.5 w-full bg-blue-100 dark:bg-blue-950/40 rounded-full mt-2 overflow-hidden">
                    <View
                      style={{
                        width: `${step.progressPercent}%`,
                        backgroundColor: APP_COLORS.brandPurple,
                      }}
                      className="h-full rounded-full"
                    />
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </Card>

      {/* Estimated Time Pill Card */}
      <Card className="rounded-2xl p-3.5 border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 flex-row items-center gap-3">
        <Icon name="clock" size="sm" color="primary" />
        <Text variant="caption" className="flex-1 font-medium">
          Estimated time: 3–5 min. You can leave — we'll notify you when
          everything is ready.
        </Text>
      </Card>

      {/* Action Buttons on Screen 2 (Notes ready) */}
      {viewState === 2 ? (
        <View className="gap-3 pt-1">
          <Button
            variant="quiz"
            icon="book-open"
            iconPosition="right"
            title="Read notes"
            onPress={() => {
              onReadNotes();
              onMoveToComplete();
            }}
            className="w-full h-13 rounded-2xl justify-center items-center shadow-md"
          />
          {onViewSubject ? (
            <Button
              variant="outline"
              icon="arrow-right"
              iconPosition="right"
              title="View subject"
              onPress={onViewSubject}
              className="w-full h-12 rounded-2xl justify-center items-center"
            />
          ) : null}
        </View>
      ) : null}

      {/* Footer Badge 1 or 2 */}
      <ScreenFooterBadge
        stepNum={viewState}
        title={viewState === 2 ? "Notes ready (in progress)" : "Processing"}
        subtitle={
          viewState === 2
            ? "Read notes while quiz is generating"
            : "Materials are being analyzed"
        }
      />
    </View>
  );
});
