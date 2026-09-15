import type { StudyMaterial } from "@/services";

export function getFailedMessage(material?: StudyMaterial | null): string {
  if (!material) return "Processing failed";

  const failedFile = material.files?.find(
    (f) =>
      f.status === "PROCESSING_FAILED" ||
      f.status === "NOTES_GENERATION_FAILED" ||
      f.quizStatus === "GENERATION_FAILED" ||
      Boolean(f.errorMessage && f.errorMessage.trim().length > 0),
  );

  if (failedFile?.errorMessage) return failedFile.errorMessage;
  if (material.status === "NOTES_GENERATION_FAILED")
    return "AI notes generation failed";
  if (material.status === "PROCESSING_FAILED") return "File processing failed";
  if (material.quizStatus === "GENERATION_FAILED")
    return "Quiz generation failed";

  return "Processing failed";
}

export function isNotesFailed(material?: StudyMaterial | null): boolean {
  if (!material) return false;
  return Boolean(
    material.status === "PROCESSING_FAILED" ||
    material.status === "NOTES_GENERATION_FAILED" ||
    material.files?.some(
      (f) =>
        f.status === "PROCESSING_FAILED" ||
        f.status === "NOTES_GENERATION_FAILED",
    ),
  );
}

export function isNotesReady(material?: StudyMaterial | null): boolean {
  if (!material) return false;
  if (isNotesFailed(material)) {
    return false;
  }

  return Boolean(
    material.notesId ||
    (material.notes && material.notes.length > 0) ||
    material.processedNotes ||
    material.status === "PROCESSED" ||
    material.status === "NOTES_GENERATED" ||
    material.files?.some(
      (f) =>
        f.status === "NOTES_GENERATED" ||
        f.status === "PROCESSED" ||
        Boolean(f.content && f.content.trim().length > 10),
    ),
  );
}

export function isQuizFailed(material?: StudyMaterial | null): boolean {
  if (!material) return false;
  return Boolean(
    material.quizStatus === "GENERATION_FAILED" ||
    material.files?.some((f) => f.quizStatus === "GENERATION_FAILED"),
  );
}

export function isQuizReady(material?: StudyMaterial | null): boolean {
  if (!material) return false;
  if (isQuizFailed(material)) {
    return false;
  }

  return Boolean(
    material.quizId ||
    (material.quizzes && material.quizzes.length > 0) ||
    material.quizStatus === "GENERATED" ||
    material.files?.some((f) => f.quizStatus === "GENERATED"),
  );
}

export function isFailed(material?: StudyMaterial | null): boolean {
  if (!material) return false;

  // If either notes or quiz are ready, it is not failed
  if (isNotesReady(material) || isQuizReady(material)) {
    return false;
  }

  return Boolean(
    material.status === "PROCESSING_FAILED" ||
    material.status === "NOTES_GENERATION_FAILED" ||
    material.quizStatus === "GENERATION_FAILED" ||
    material.files?.some(
      (f) =>
        f.status === "PROCESSING_FAILED" ||
        f.status === "NOTES_GENERATION_FAILED" ||
        f.quizStatus === "GENERATION_FAILED",
    ),
  );
}

export interface MaterialStatusSummary {
  failed: boolean;
  notesFailed: boolean;
  quizFailed: boolean;
  notesReady: boolean;
  quizReady: boolean;
  isProcessing: boolean;
  errorMessage: string;
}

export function getMaterialStatusSummary(
  material?: StudyMaterial | null,
): MaterialStatusSummary {
  const notesReady = isNotesReady(material);
  const quizReady = isQuizReady(material);
  const failed = isFailed(material);
  const notesFailed = isNotesFailed(material);
  const quizFailed = isQuizFailed(material);
  const isProcessing = !failed && !notesReady && !quizReady;
  const errorMessage = failed ? getFailedMessage(material) : "";

  return {
    failed,
    notesFailed,
    quizFailed,
    notesReady,
    quizReady,
    isProcessing,
    errorMessage,
  };
}
