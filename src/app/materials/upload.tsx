import { NotesDetailBottomSheet } from "@/components/notes";
import { StartQuizSheet } from "@/components/quizzes";
import {
  Step1Details,
  Step2Upload,
  Step3Processing,
  Step4Ready,
  UploadHeader,
} from "@/components/materials";
import {
  useCreateSubject,
  useFileDownload,
  useFilePicker,
  useStartQuizAttempt,
  useStudyMaterialNotesQuery,
  useSubjectsQuery,
} from "@/hooks";
import { useAuth } from "@/lib/auth";
import { step1MaterialSchema, step2MaterialSchema } from "@/schemas";
import {
  ApiError,
  studyMaterialsApi,
  type QuizAttempt,
  type StudyMaterial,
} from "@/services";
import { useRouter } from "expo-router";
import * as React from "react";
import { Alert, Linking, ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FormValues = {
  title: string;
  subjectId: string;
};

type FormErrors = Partial<Record<keyof FormValues | "file", string>>;

export default function UploadMaterialScreen() {
  const router = useRouter();
  const { token } = useAuth();
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
    "General";

  // Poll for material processing status in Step 3
  React.useEffect(() => {
    if (step !== 3 || !createdMaterialId || !token) return;

    let isMounted = true;

    async function checkStatus() {
      try {
        const material = await studyMaterialsApi.getById(
          token as string,
          createdMaterialId as string,
        );
        if (!isMounted) return;

        console.log("[AI Notes Full Response]", material);

        const hasReadyNotes =
          Boolean(material.notesId) ||
          Boolean(material.processedNotes) ||
          (Array.isArray((material as any).notes) &&
            (material as any).notes.length > 0);

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
        // Silent catch for polling network glitches
      }
    }

    void checkStatus();

    const interval = setInterval(() => {
      void checkStatus();
    }, 500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [step, createdMaterialId, token]);

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
    const result = step1MaterialSchema.safeParse({
      title: values.title,
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
  }, [values.title, values.subjectId]);

  const handlePickFile = React.useCallback(async () => {
    setSubmitError(null);
    const picked = await filePicker.pickFile();
    if (picked) {
      setErrors((prev) => (prev.file ? { ...prev, file: undefined } : prev));
    }
  }, [filePicker]);

  const handleRemoveFile = React.useCallback(() => {
    filePicker.removeFile();
  }, [filePicker]);

  const handleFinalUpload = React.useCallback(async () => {
    const parseResult = step2MaterialSchema.safeParse({
      file: filePicker.file,
    });

    if (!parseResult.success) {
      const msg =
        parseResult.error.issues[0]?.message ??
        "Please select a document to upload.";
      setErrors((prev) => ({ ...prev, file: msg }));
      return;
    }

    const fileToUpload = parseResult.data.file;
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

      if (result && typeof result === "object" && "id" in result) {
        setCreatedMaterialId(result.id);
        setStep(3);
      } else {
        router.back();
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Failed to upload study material.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }, [filePicker.file, token, values.title, values.subjectId, router]);

  const handleReadNotes = React.useCallback(() => {
    setShowNotesSheet(true);
  }, []);

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
          Alert.alert(
            "Gold Plan Required",
            "Access denied. Upgrade your plan to access interactive quizzes.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Upgrade Plan",
                onPress: () =>
                  void Linking.openURL(
                    "https://app.usestudycircle.ai/billings",
                  ),
              },
            ],
          );
          return;
        }
        Alert.alert("Quiz Error", msg);
      }
    } else {
      router.push("/(tabs)/quizzes");
    }
  }, [explicitQuizId, startAttemptMutation, router]);

  const handleDownloadOriginalFile = React.useCallback(async () => {
    const pdfUrl = processedMaterial?.files?.[0]?.url || filePicker.file?.uri;
    await downloadFile({
      url: pdfUrl,
      title: processedMaterial?.title || values.title,
      content: processedMaterial?.processedNotes,
    });
  }, [downloadFile, processedMaterial, filePicker.file, values.title]);

  const isNotesReady = React.useMemo(() => {
    if (!processedMaterial) return false;
    return Boolean(
      processedMaterial.notesId ||
        (Array.isArray(processedMaterial.notes) &&
          processedMaterial.notes.length > 0) ||
        Boolean(processedMaterial.processedNotes)
    );
  }, [processedMaterial]);

  const isQuizReady = React.useMemo(() => {
    if (!processedMaterial) return false;
    return Boolean(
      explicitQuizId ||
        (Array.isArray(processedMaterial.quizzes) &&
          processedMaterial.quizzes.length > 0)
    );
  }, [processedMaterial, explicitQuizId]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#ffffff" }}
      className="flex-1 bg-white dark:bg-stone-900"
      edges={["top"]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
        translucent={false}
      />
      {/* Brand & Stepper Header Bar */}
      <UploadHeader currentStep={step} />

      {/* Main Screen Content Body */}
      <View style={{ flex: 1 }} className="flex-1 bg-white dark:bg-stone-900">
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
            <Step1Details
              title={values.title}
              subjectId={values.subjectId}
              subjects={subjects}
              isLoadingSubjects={isLoadingSubjects}
              isCreatingSubject={createSubjectMutation.isPending}
              titleError={errors.title}
              subjectError={errors.subjectId}
              onTitleChange={handleTitleChange}
              onSelectSubject={handleSelectSubject}
              onCreateSubject={handleCreateSubject}
              onBack={() => router.back()}
              onContinue={handleContinueToStep2}
            />
          )}

          {step === 2 && (
            <Step2Upload
              file={filePicker.file}
              submitting={submitting}
              fileError={errors.file || filePicker.error || undefined}
              submitError={submitError}
              onPickFile={handlePickFile}
              onRemoveFile={handleRemoveFile}
              onBack={() => setStep(1)}
              onUpload={handleFinalUpload}
            />
          )}

          {step === 3 && (
            <Step3Processing
              materialTitle={values.title}
              subjectName={displaySubjectName}
              fileName={filePicker.file?.name}
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
              onCloseError={() => router.back()}
              onReupload={handleReupload}
              onAllStepsFinished={() => setStep(4)}
            />
          )}

          {step === 4 && (
            <Step4Ready
              materialTitle={processedMaterial?.title || values.title}
              subjectName={displaySubjectName}
              fileName={filePicker.file?.name || "Document.pdf"}
              isNotesReady={isNotesReady}
              isQuizReady={isQuizReady}
              onReadNotes={handleReadNotes}
              onTakeQuiz={handleTakeQuiz}
              onViewOriginalFile={handleDownloadOriginalFile}
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
          pdfUrl={processedMaterial?.files?.[0]?.url}
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
