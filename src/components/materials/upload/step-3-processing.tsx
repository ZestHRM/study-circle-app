import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { NoticeBox } from "@/components/ui/notice-box";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import type { StudyMaterialQuizStatus, StudyMaterialStatus } from "@/services";
import * as React from "react";
import { View } from "react-native";

export interface Step3ProcessingProps {
  materialTitle: string;
  subjectName: string;
  fileName?: string;
  materialStatus?: StudyMaterialStatus;
  quizStatus?: StudyMaterialQuizStatus;
  isNotesReady?: boolean;
  isQuizReady?: boolean;
  processingError?: string | null;
  isBackendReady?: boolean;
  onCloseError?: () => void;
  onReupload?: () => void;
  onAllStepsFinished?: () => void;
}

export const Step3Processing = React.memo(function Step3Processing({
  materialTitle,
  subjectName,
  fileName,
  materialStatus,
  quizStatus,
  isNotesReady = false,
  isQuizReady = false,
  processingError,
  isBackendReady = true,
  onCloseError,
  onReupload,
  onAllStepsFinished,
}: Step3ProcessingProps) {
  const isNotesCompleted = Boolean(isNotesReady);
  const isQuizCompleted = Boolean(isQuizReady);

  // Step completion strictly derived from backend status
  const isStep2Done =
    materialStatus === "PROCESSING" ||
    materialStatus === "GENERATING_NOTES" ||
    isNotesCompleted;
  const isStep3Done = isNotesCompleted;
  const isStep4Done = isQuizCompleted;

  const isStep2Active = !isStep2Done;
  const isStep3Active = isStep2Done && !isStep3Done;
  const isStep4Active =
    quizStatus === "GENERATING" || (isStep3Done && !isStep4Done);

  return (
    <View className="gap-5">
      {/* Title Header */}
      <View className="gap-1">
        <Text variant="h1">Preparing your study pack</Text>
        <Text variant="muted">
          We're analysing your material and creating notes, summaries and
          practice questions.
        </Text>
      </View>

      {/* Material Summary Card */}
      <Card className="rounded-3xl p-4 gap-3">
        <CardContent className="p-0 gap-3">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 items-center justify-center border border-purple-200 dark:border-purple-800">
              <Icon name="book-open" size={18} color="primary" />
            </View>
            <View className="flex-1">
              <Text variant="caption">Subject</Text>
              <Text variant="subhead" numberOfLines={1}>
                {subjectName || "General"}
              </Text>
            </View>
            <Badge label={subjectName || "General"} variant="purple" />
          </View>

          <View className="h-px bg-stone-100 dark:bg-stone-800/80" />

          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/40 items-center justify-center border border-red-200 dark:border-red-900/50">
              <Icon name="file-text" size={18} color="error" />
            </View>
            <View className="flex-1">
              <Text variant="h3" numberOfLines={1}>
                {materialTitle || "Study Material"}
              </Text>
              <Text variant="caption" numberOfLines={1}>
                {fileName || "--"}
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Vertical Stepper Timeline Card */}
      <Card className="rounded-3xl p-4.5 gap-4">
        <CardContent className="p-0 gap-4">
          {/* Timeline Item 1: Upload Complete */}
          <View className="flex-row items-start gap-3.5">
            <View className="w-7 h-7 rounded-full bg-emerald-500 items-center justify-center mt-0.5 shadow-2xs">
              <Icon name="check" size="sm" color="white" />
            </View>
            <View className="flex-1 flex-row items-center justify-between">
              <View>
                <Text variant="subhead">Upload complete</Text>
                <Text variant="caption" className="mt-0.5">
                  File received and queued.
                </Text>
              </View>
              <Badge label="Complete" variant="emerald" />
            </View>
          </View>

          {/* Vertical Connecting Line */}
          <View
            className={`w-0.5 h-3 ml-[13px] -my-2.5 ${isStep2Done ? "bg-emerald-500" : "bg-purple-600"}`}
          />

          {/* Timeline Item 2: Understanding Concepts */}
          <View className="flex-row items-start gap-3.5">
            {isStep2Done ? (
              <View className="w-7 h-7 rounded-full bg-emerald-500 items-center justify-center mt-0.5 shadow-2xs">
                <Icon name="check" size="sm" color="white" />
              </View>
            ) : (
              <View className="w-7 h-7 rounded-full bg-purple-600 items-center justify-center mt-0.5 shadow-2xs">
                <Spinner variant="white" size="small" />
              </View>
            )}
            <View className="flex-1 gap-1.5">
              <View className="flex-row items-center justify-between">
                <Text
                  className={`text-xs font-bold ${isStep2Done ? "text-stone-900 dark:text-stone-100" : "text-purple-950 dark:text-purple-200"}`}
                >
                  Understanding concepts
                </Text>
                {isStep2Done ? (
                  <Badge label="Complete" variant="emerald" />
                ) : (
                  <Badge label="Analysing..." variant="purple" />
                )}
              </View>

              <Text variant="caption">
                {isStep2Done
                  ? "Analysis completed."
                  : "Analysing your material..."}
              </Text>
            </View>
          </View>

          {/* Vertical Connecting Line */}
          <View
            className={`w-0.5 h-3 ml-[13px] -my-2.5 ${isStep3Done ? "bg-emerald-500" : isStep3Active ? "bg-purple-600" : "bg-stone-200 dark:bg-stone-800"}`}
          />

          {/* Timeline Item 3: Generating Notes */}
          <View
            className={`flex-row items-start gap-3.5 ${!isStep3Active && !isStep3Done ? "opacity-60" : ""}`}
          >
            {isStep3Done ? (
              <View className="w-7 h-7 rounded-full bg-emerald-500 items-center justify-center mt-0.5 shadow-2xs">
                <Icon name="check" size="sm" color="white" />
              </View>
            ) : isStep3Active ? (
              <View className="w-7 h-7 rounded-full bg-purple-600 items-center justify-center mt-0.5 shadow-2xs">
                <Spinner variant="white" size="small" />
              </View>
            ) : (
              <View className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 items-center justify-center mt-0.5">
                <Text variant="subhead">3</Text>
              </View>
            )}

            <View className="flex-1">
              <View className="flex-row items-center justify-between">
                <Text variant="subhead">Generating notes</Text>
                {isStep3Done ? (
                  <Badge label="Notes Ready" variant="emerald" />
                ) : isStep3Active ? (
                  <Badge label="Generating..." variant="amber" />
                ) : null}
              </View>

              <Text variant="caption" className="mt-0.5">
                {isStep3Done
                  ? "AI notes & key points generated!"
                  : isStep3Active
                    ? "Creating summary & bullet points..."
                    : "Waiting to start..."}
              </Text>
            </View>
          </View>

          {/* Vertical Connecting Line */}
          <View
            className={`w-0.5 h-3 ml-[13px] -my-2.5 ${isStep4Done ? "bg-emerald-500" : isStep4Active ? "bg-amber-500" : "bg-stone-200 dark:bg-stone-800"}`}
          />

          {/* Timeline Item 4: Creating Quiz */}
          <View
            className={`flex-row items-start gap-3.5 ${!isStep4Active && !isStep4Done ? "opacity-60" : ""}`}
          >
            {isStep4Done ? (
              <View className="w-7 h-7 rounded-full bg-emerald-500 items-center justify-center mt-0.5 shadow-2xs">
                <Icon name="check" size="sm" color="white" />
              </View>
            ) : isStep4Active ? (
              <View className="w-7 h-7 rounded-full bg-amber-500 items-center justify-center mt-0.5 shadow-2xs">
                <Spinner variant="white" size="small" />
              </View>
            ) : (
              <View className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 items-center justify-center mt-0.5">
                <Icon name="lock" size={13} color="muted" />
              </View>
            )}

            <View className="flex-1 flex-row items-center justify-between">
              <View>
                <Text variant="subhead">Creating quiz</Text>
                <Text variant="caption" className="mt-0.5">
                  {isStep4Done
                    ? "Practice set ready!"
                    : isStep4Active
                      ? "Generating questions..."
                      : "Queued for generation"}
                </Text>
              </View>
              {isStep4Done ? (
                <Badge label="Quiz Ready" variant="emerald" icon="zap" />
              ) : isStep4Active ? (
                <Badge label="Creating..." variant="amber" />
              ) : (
                <Badge label="Gold" variant="amber" />
              )}
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Bottom Info / Error Notice & Action Button */}
      {processingError ||
      materialStatus === "PROCESSING_FAILED" ||
      materialStatus === "NOTES_GENERATION_FAILED" ? (
        <View className="gap-3 pt-1">
          <NoticeBox
            variant="error"
            title="Processing Failed"
            message={
              processingError ||
              "We couldn't generate notes from this document. Please try re-uploading a clearer PDF or image file."
            }
          />
          {onReupload ? (
            <Button
              variant="quiz"
              icon="refresh-cw"
              title="Re-upload Document"
              onPress={onReupload}
              className="w-full h-12 rounded-2xl justify-center items-center shadow-2xs"
            />
          ) : null}
        </View>
      ) : isNotesCompleted ? (
        <View className="gap-2 pt-1">
          <NoticeBox
            variant="success"
            message="Your study notes have been generated successfully! Click below to view your notes & practice set."
          />
          <Button
            variant="quiz"
            icon="arrow-right"
            iconPosition="right"
            title="View Study Pack (Notes & Quiz)"
            onPress={onAllStepsFinished}
            className="w-full h-12 rounded-2xl justify-center items-center shadow-2xs"
          />
        </View>
      ) : (
        <NoticeBox
          variant="info"
          message="Analysing your material. We'll update the steps in real-time as notes and quiz complete."
        />
      )}
    </View>
  );
});
