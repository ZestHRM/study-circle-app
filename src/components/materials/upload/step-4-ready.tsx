import type { PickedFileValues } from "@/schemas";
import type { StudyMaterialQuizStatus, StudyMaterialStatus } from "@/services";
import * as React from "react";
import { Step4Complete } from "./step-4-complete";
import { Step4PartialFailure } from "./step-4-partial-failure";
import { Step4Processing } from "./step-4-processing";

export interface Step4ReadyProps {
  materialTitle: string;
  subjectName: string;
  fileName?: string;
  file?: PickedFileValues | null;
  materialStatus?: StudyMaterialStatus;
  quizStatus?: StudyMaterialQuizStatus;
  isNotesReady?: boolean;
  isQuizReady?: boolean;
  processingError?: string | null;
  isBackendReady?: boolean;
  onReadNotes: () => void;
  onTakeQuiz: () => void;
  onViewOriginalFile: () => void;
  onViewSubject?: () => void;
  onReupload?: () => void;
}

export const Step4Ready = React.memo(function Step4Ready({
  materialTitle,
  subjectName,
  fileName,
  file,
  materialStatus,
  quizStatus,
  isNotesReady = false,
  isQuizReady = false,
  processingError,
  isBackendReady = false,
  onReadNotes,
  onTakeQuiz,
  onViewOriginalFile,
  onViewSubject,
  onReupload,
}: Step4ReadyProps) {
  // Compute display details
  const displayFileName = file?.name || fileName || "Document.pdf";
  const displaySubject = subjectName || "Physics";
  const displayTitle = materialTitle || "Laws of Motion";
  const isFailed =
    Boolean(processingError) ||
    materialStatus === "PROCESSING_FAILED" ||
    materialStatus === "NOTES_GENERATION_FAILED";

  // Screen View State: 1 = Processing, 2 = Notes Ready, 3 = Everything Ready, 4 = Partial Failure
  const [viewState, setViewState] = React.useState<1 | 2 | 3 | 4>(1);

  React.useEffect(() => {
    if (isFailed) {
      setViewState(4);
      return;
    }

    if (isBackendReady || isNotesReady) {
      setViewState(2);
    } else {
      setViewState(1);
    }
  }, [isFailed, isBackendReady, isNotesReady]);

  const handleMoveToComplete = React.useCallback(() => {
    setViewState(3);
  }, []);

  // Screen 4: Partial Failure Screen Component
  if (viewState === 4 || isFailed) {
    return (
      <Step4PartialFailure
        displaySubject={displaySubject}
        displayTitle={displayTitle}
        displayFileName={displayFileName}
        file={file}
        processingError={processingError}
        onReupload={onReupload}
        onContinue={handleMoveToComplete}
      />
    );
  }

  // Screen 3: Complete Screen Component (Everything is ready)
  if (viewState === 3) {
    return (
      <Step4Complete
        displaySubject={displaySubject}
        displayTitle={displayTitle}
        displayFileName={displayFileName}
        onReadNotes={onReadNotes}
        onTakeQuiz={onTakeQuiz}
        onViewOriginalFile={onViewOriginalFile}
      />
    );
  }

  // Screen 1 & Screen 2: Processing & Notes Ready Component
  return (
    <Step4Processing
      viewState={viewState}
      displaySubject={displaySubject}
      displayTitle={displayTitle}
      displayFileName={displayFileName}
      file={file}
      materialStatus={materialStatus}
      quizStatus={quizStatus}
      isNotesReady={isNotesReady}
      isQuizReady={isQuizReady}
      onReadNotes={onReadNotes}
      onViewSubject={onViewSubject}
      onMoveToComplete={handleMoveToComplete}
    />
  );
});
