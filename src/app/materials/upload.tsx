import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import {
  Step1SubjectPicker,
  Step2UploadType,
  Step3FileUpload,
  Step4Ready,
  UploadHeader,
} from "@/components/materials";
import { NotesDetailBottomSheet } from "@/components/notes";
import { StartQuizSheet } from "@/components/quizzes";
import {
  useCreateSubject,
  useFileDownload,
  useFilePicker,
  useStartQuizAttempt,
  useStudyMaterialNotesQuery,
  useSubjectsQuery,
} from "@/hooks";
import { useAuth } from "@/lib/auth";
import { useThemePreference } from "@/lib/theme-preference";
import {
  isNotesReady as isNotesReadyHelper,
  isQuizReady as isQuizReadyHelper,
} from "@/lib/utils/material-status";
import { showErrorToast } from "@/lib/utils/toast";
import {
  step1SubjectSchema,
  step2MaterialSchema,
  step2TitleSchema,
} from "@/schemas";
import {
  getErrorMessage,
  studyMaterialsApi,
  type QuizAttempt,
  type StudyMaterial,
} from "@/services";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as React from "react";
import { Linking, ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FormValues = {
  title: string;
  subjectId: string;
};

type FormErrors = Partial<Record<keyof FormValues | "file", string>>;

export default function UploadMaterialScreen() {
  const router = useRouter();
  const confirm = useConfirmDialog();
  const params = useLocalSearchParams<{
    fileUri?: string;
    fileName?: string;
    fileType?: string;
  }>();
  const { token } = useAuth();
  const { isDark } = useThemePreference();
  const filePicker = useFilePicker();
  const { downloadFile } = useFileDownload();

  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [values, setValues] = React.useState<FormValues>({
    title: "",
    subjectId: "",
  });
  const [selectedSubjectName, setSelectedSubjectName] =
    React.useState<string>("");
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // If a file was picked directly from materials list screen, pre-populate file & clean title
  const isPrePopulatedRef = React.useRef(false);
  React.useEffect(() => {
    if (!isPrePopulatedRef.current && params.fileUri && params.fileName) {
      isPrePopulatedRef.current = true;
      filePicker.setFile({
        uri: params.fileUri,
        name: params.fileName,
        mimeType: params.fileType || "application/pdf",
        size: null,
      });
      const cleanTitle = params.fileName
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ");
      setValues((prev) => ({ ...prev, title: cleanTitle }));
    }
  }, [params.fileUri, params.fileName, params.fileType, filePicker]);

  // Processing & Polling State
  const [createdMaterialId, setCreatedMaterialId] = React.useState<
    string | null
  >(null);
  const [processedMaterial, setProcessedMaterial] =
    React.useState<StudyMaterial | null>(null);
  const [processingError, setProcessingError] = React.useState<string | null>(
    null,
  );
  const [isBackendReady, setIsBackendReady] = React.useState(false);
  const [showNotesSheet, setShowNotesSheet] = React.useState(false);

  // Quiz Attempt State
  const [selectedQuizAttempt, setSelectedQuizAttempt] =
    React.useState<QuizAttempt | null>(null);
  const startAttemptMutation = useStartQuizAttempt();

  const { subjects, isLoading: isLoadingSubjects } = useSubjectsQuery();
  const createSubjectMutation = useCreateSubject();

  const {
    data: fetchedGeneratedNotes,
    isLoading: isFetchingGeneratedNotes,
    isError: isGeneratedNotesError,
    refetch: refetchGeneratedNotes,
  } = useStudyMaterialNotesQuery(showNotesSheet ? processedMaterial : null);

  const selectedSubject = React.useMemo(
    () => subjects.find((s) => String(s.id) === String(values.subjectId)),
    [subjects, values.subjectId],
  );

  const displaySubjectName =
    processedMaterial?.subject?.name ||
    selectedSubject?.name ||
    selectedSubjectName ||
    "";

  const explicitQuizId = React.useMemo(() => {
    if (!processedMaterial) return null;
    return (
      processedMaterial.quizId ||
      (Array.isArray(processedMaterial.quizzes) &&
        processedMaterial.quizzes.length > 0 &&
        processedMaterial.quizzes[0]?.id) ||
      (processedMaterial as any).quiz?.id ||
      null
    );
  }, [processedMaterial]);

  const isNotesReady = React.useMemo(() => {
    if (!processedMaterial) return false;
    return isNotesReadyHelper(processedMaterial);
  }, [processedMaterial]);

  const isQuizReady = React.useMemo(() => {
    if (!processedMaterial) return false;
    return Boolean(explicitQuizId) || isQuizReadyHelper(processedMaterial);
  }, [processedMaterial, explicitQuizId]);

  // Poll for material processing status in Step 3 and Step 4
  React.useEffect(() => {
    if (!createdMaterialId || !token) return;
    if ((isBackendReady || isNotesReady) && isQuizReady) return;
    if (processingError) return;

    let isMounted = true;

    async function checkStatus() {
      try {
        const material = await studyMaterialsApi.getById(
          token as string,
          createdMaterialId as string,
        );
        if (!isMounted) return;

        const isNotesStatusReady =
          material.status === "NOTES_GENERATED" ||
          material.status === "PROCESSED" ||
          material.files?.some(
            (f) => f.status === "NOTES_GENERATED" || f.status === "PROCESSED",
          );

        const hasReadyNotes =
          Boolean(material.notesId) ||
          Boolean(material.processedNotes) ||
          (Array.isArray((material as any).notes) &&
            (material as any).notes.length > 0) ||
          isNotesStatusReady;

        const hasFailedFiles =
          material.status === "PROCESSING_FAILED" ||
          material.status === "NOTES_GENERATION_FAILED" ||
          material.files?.some(
            (f) =>
              f.status === "NOTES_GENERATION_FAILED" ||
              f.status === "PROCESSING_FAILED",
          );

        setProcessedMaterial(material);

        if (hasReadyNotes) {
          setIsBackendReady(true);
        } else if (hasFailedFiles) {
          const failMessage =
            material.files?.find((f) => f.errorMessage)?.errorMessage ||
            "We couldn't generate notes from this document. Please re-upload a clearer document or image.";
          setProcessingError(failMessage);
        }
      } catch (err) {
        console.error("[AI Notes Polling Error]:", err);
      }
    }

    void checkStatus();

    const interval = setInterval(() => {
      void checkStatus();
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [
    createdMaterialId,
    token,
    isBackendReady,
    isNotesReady,
    isQuizReady,
    processingError,
  ]);

  const handleReupload = React.useCallback(() => {
    setCreatedMaterialId(null);
    setProcessedMaterial(null);
    setProcessingError(null);
    setIsBackendReady(false);
    filePicker.removeFile();
    setStep(1);
  }, [filePicker]);

  const handleTitleChange = React.useCallback((text: string) => {
    setValues((prev) => ({ ...prev, title: text }));
    setErrors((prev) => (prev.title ? { ...prev, title: undefined } : prev));
  }, []);

  const handleSelectSubject = React.useCallback(
    (id: string) => {
      setValues((prev) => ({ ...prev, subjectId: id }));
      setErrors((prev) =>
        prev.subjectId ? { ...prev, subjectId: undefined } : prev,
      );
      const found = subjects.find((s) => String(s.id) === String(id));
      if (found?.name) {
        setSelectedSubjectName(found.name);
      }
    },
    [subjects],
  );

  const handleCreateSubject = React.useCallback(
    async (name: string) => {
      setSelectedSubjectName(name);
      const created = await createSubjectMutation.mutateAsync({ name });
      if (created?.id) {
        setValues((prev) => ({ ...prev, subjectId: String(created.id) }));
        if (created.name) {
          setSelectedSubjectName(created.name);
        }
        setErrors((prev) =>
          prev.subjectId ? { ...prev, subjectId: undefined } : prev,
        );
      }
    },
    [createSubjectMutation],
  );

  const handleContinueToStep2 = React.useCallback(() => {
    const result = step1SubjectSchema.safeParse({
      subjectId: values.subjectId,
    });

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormValues;
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setStep(2);
  }, [values.subjectId]);

  const handleContinueFromStep2 = React.useCallback(
    (uploadType: "STUDY_MATERIAL" | "PYQ") => {
      if (uploadType === "PYQ") {
        router.push("/pyqs" as any);
      } else {
        setErrors({});
        setStep(3);
      }
    },
    [router],
  );

  const handlePickFile = React.useCallback(async () => {
    setSubmitError(null);
    const picked = await filePicker.pickFile();
    if (picked) {
      setErrors((prev) => (prev.file ? { ...prev, file: undefined } : prev));
      if (!values.title.trim() && picked.name) {
        const cleanTitle = picked.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ");
        setValues((prev) => ({ ...prev, title: cleanTitle }));
      }
    }
  }, [filePicker, values.title]);

  const handleRemoveFile = React.useCallback(() => {
    filePicker.removeFile();
  }, [filePicker]);

  const handleFinalUpload = React.useCallback(async () => {
    const titleResult = step2TitleSchema.safeParse({ title: values.title });
    const fileResult = step2MaterialSchema.safeParse({ file: filePicker.file });

    const newErrors: FormErrors = {};
    if (!titleResult.success) {
      newErrors.title =
        titleResult.error.issues[0]?.message ??
        "Please enter a material title.";
    }
    if (!fileResult.success) {
      newErrors.file =
        fileResult.error.issues[0]?.message ??
        "Please select a document to upload.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const fileToUpload = fileResult.data?.file;
    if (!fileToUpload || !token) return;

    try {
      setSubmitting(true);
      setSubmitError(null);

      const result = await studyMaterialsApi.create(token, {
        title: values.title.trim(),
        subjectId: values.subjectId,
        file: {
          uri: fileToUpload.uri,
          name: fileToUpload.name,
          type: fileToUpload.mimeType,
        },
      });

      console.log("[AI Notes Upload Create Response]:", result);

      if (result && typeof result === "object" && "id" in result) {
        setCreatedMaterialId(result.id);
        setStep(4);
      } else {
        router.back();
      }
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Failed to upload study material.",
      );
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }, [filePicker.file, token, values.title, values.subjectId, router]);

  const handleReadNotes = React.useCallback(() => {
    setShowNotesSheet(true);
  }, []);

  const handleTakeQuiz = React.useCallback(async () => {
    if (explicitQuizId) {
      try {
        const attempt = await startAttemptMutation.mutateAsync(explicitQuizId);
        if (attempt) {
          setSelectedQuizAttempt(attempt);
          setShowNotesSheet(false);
          return;
        }
      } catch (err: any) {
        const msg =
          err?.data?.message || err?.message || "Failed to start quiz attempt.";
        if (err?.status === 403 || msg.toLowerCase().includes("upgrade")) {
          const confirmed = await confirm({
            title: "Gold Plan Required",
            description:
              "Access denied. Upgrade your plan to access interactive quizzes.",
            confirmText: "Upgrade Plan",
            cancelText: "Cancel",
          });
          if (confirmed) {
            void Linking.openURL("https://app.usestudycircle.ai/billings");
          }
          return;
        }
        showErrorToast("Quiz Error", msg);
      }
    } else {
      router.push("/(tabs)/quizzes" as any);
    }
  }, [explicitQuizId, startAttemptMutation, router, confirm]);

  const handleDownloadOriginalFile = React.useCallback(async () => {
    const pdfUrl = processedMaterial?.files?.[0]?.url || filePicker.file?.uri;
    await downloadFile({
      url: pdfUrl,
      title: processedMaterial?.title || values.title,
      content: processedMaterial?.processedNotes,
    });
  }, [downloadFile, processedMaterial, filePicker.file, values.title]);

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      className="flex-1 bg-background"
      edges={["top"]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0c0a09" : "#ffffff"}
        translucent={false}
      />
      {/* Brand & Stepper Header Bar */}
      <UploadHeader
        currentStep={step}
        onBack={() => {
          if (step > 1) {
            setStep((s) => (s - 1) as any);
          } else {
            router.back();
          }
        }}
      />

      {/* Main Screen Content Body */}
      <View style={{ flex: 1 }} className="flex-1 bg-background">
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 100,
          }}
        >
          {step === 1 && (
            <Step1SubjectPicker
              subjectId={values.subjectId}
              subjects={subjects}
              isLoadingSubjects={isLoadingSubjects}
              isCreatingSubject={createSubjectMutation.isPending}
              subjectError={errors.subjectId}
              onSelectSubject={handleSelectSubject}
              onCreateSubject={handleCreateSubject}
              onBack={() => router.back()}
              onContinue={handleContinueToStep2}
            />
          )}

          {step === 2 && (
            <Step2UploadType
              selectedSubjectName={displaySubjectName}
              submitError={submitError}
              onContinue={handleContinueFromStep2}
            />
          )}

          {step === 3 && (
            <Step3FileUpload
              materialTitle={values.title}
              subjectName={displaySubjectName}
              fileName={filePicker.file?.name}
              file={filePicker.file}
              submitting={submitting}
              titleError={errors.title}
              fileError={errors.file || filePicker.error || undefined}
              submitError={submitError}
              onTitleChange={handleTitleChange}
              onPickFile={handlePickFile}
              onRemoveFile={handleRemoveFile}
              onEditSubject={() => setStep(1)}
              onUpload={handleFinalUpload}
            />
          )}

          {step === 4 && (
            <Step4Ready
              materialTitle={processedMaterial?.title || values.title}
              subjectName={displaySubjectName}
              fileName={filePicker.file?.name}
              file={filePicker.file}
              materialStatus={
                processedMaterial?.files?.[0]?.status ||
                processedMaterial?.status
              }
              quizStatus={
                processedMaterial?.files?.[0]?.quizStatus ||
                processedMaterial?.quizStatus
              }
              isNotesReady={isNotesReady}
              isQuizReady={isQuizReady}
              processingError={processingError}
              isBackendReady={isBackendReady}
              onReadNotes={handleReadNotes}
              onTakeQuiz={handleTakeQuiz}
              onViewOriginalFile={handleDownloadOriginalFile}
              onViewSubject={() => router.push("/(tabs)/subjects")}
              onReupload={handleReupload}
            />
          )}
        </ScrollView>
      </View>

      {/* Full Screen Notes Detail Sheet */}
      {showNotesSheet ? (
        <NotesDetailBottomSheet
          open={showNotesSheet}
          onClose={() => setShowNotesSheet(false)}
          title={
            fetchedGeneratedNotes?.title ||
            processedMaterial?.title ||
            values.title
          }
          subjectName={
            fetchedGeneratedNotes?.subjectName ||
            processedMaterial?.subject?.name ||
            "General"
          }
          createdAt={
            fetchedGeneratedNotes?.createdAt || processedMaterial?.createdAt
          }
          content={
            fetchedGeneratedNotes?.content || processedMaterial?.processedNotes
          }
          pdfUrl={(fetchedGeneratedNotes as any)?.pdfUrl ?? undefined}
          isLoading={isFetchingGeneratedNotes}
          isError={isGeneratedNotesError}
          isQuizReady={isQuizReady}
          onRetry={refetchGeneratedNotes}
          onTakeQuiz={handleTakeQuiz}
        />
      ) : null}

      {/* Interactive Quiz Attempt Sheet */}
      {selectedQuizAttempt ? (
        <StartQuizSheet
          key={selectedQuizAttempt.id}
          open={Boolean(selectedQuizAttempt)}
          onOpenChange={(open: boolean) => {
            if (!open) {
              setSelectedQuizAttempt(null);
            }
          }}
          attempt={selectedQuizAttempt}
        />
      ) : null}
    </SafeAreaView>
  );
}
