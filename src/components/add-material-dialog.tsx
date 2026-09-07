import {
  PdfDropzone,
  type PickedMaterialFile,
} from "@/components/add-material/pdf-dropzone";
import { StepProgressBar } from "@/components/add-material/step-progress-bar";
import { SubjectPicker } from "@/components/add-material/subject-picker";
import { HtmlNotesView } from "@/components/notes/html-notes-view";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import {
  useCreateSubject,
  useSubjectsQuery,
} from "@/hooks/queries/use-subjects";
import { useAuth } from "@/lib/auth";
import { ApiError, studyMaterialsApi, type StudyMaterial } from "@/services";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as React from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

type FormValues = {
  title: string;
  description: string;
  subjectId: string;
  file: PickedMaterialFile | null;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

function formatNotesText(content?: string | null): string {
  if (!content || !content.trim()) {
    return "AI notes scanned successfully. Full notes available below.";
  }
  return content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h1|h2|h3|h4|h5|h6)>/gi, "\n")
    .replace(/<(p|div|li|h1|h2|h3|h4|h5|h6)(\s+[^>]*)?>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function AddMaterialDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    title: string;
    description?: string;
    subjectId: string;
    file: {
      uri: string;
      name: string;
      type: string;
    };
  }) => Promise<StudyMaterial | void>;
  submitting: boolean;
}) {
  const router = useRouter();
  const { token } = useAuth();
  console.log("[AddMaterialDialog] render open =", open);
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [values, setValues] = React.useState<FormValues>({
    title: "",
    description: "",
    subjectId: "",
    file: null,
  });
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Processing & Polling State
  const [createdMaterialId, setCreatedMaterialId] = React.useState<
    string | null
  >(null);
  const [processedMaterial, setProcessedMaterial] =
    React.useState<StudyMaterial | null>(null);
  const [processingError, setProcessingError] = React.useState<string | null>(
    null,
  );
  const [showFullNotesView, setShowFullNotesView] = React.useState(false);

  const { subjects, isLoading: isLoadingSubjects } = useSubjectsQuery();
  const createSubjectMutation = useCreateSubject();

  const resetForm = React.useCallback(() => {
    setStep(1);
    setValues({
      title: "",
      description: "",
      subjectId: "",
      file: null,
    });
    setErrors({});
    setSubmitError(null);
    setCreatedMaterialId(null);
    setProcessedMaterial(null);
    setProcessingError(null);
    setShowFullNotesView(false);
  }, []);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        resetForm();
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange, resetForm],
  );

  // Poll for notes generation status in Step 3
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
        console.log("material res--", material);
        console.log(
          `[Polling Status Response] GET /study-materials/${createdMaterialId}`,
          JSON.stringify(
            {
              materialId: material.id,
              materialStatus: material.status,
              quizStatus: material.quizStatus,
              files: material.files?.map((f) => ({
                id: f.id,
                fileName: f.fileName,
                status: f.status,
                quizStatus: f.quizStatus,
                errorMessage: f.errorMessage,
              })),
              fullData: material,
            },
            null,
            2,
          ),
        );

        const hasReadyFiles =
          material.files?.some((f) => f.status === "NOTES_GENERATED") ||
          material.status === "NOTES_GENERATED" ||
          (Array.isArray((material as any).notes) &&
            (material as any).notes.length > 0);

        const hasFailedFiles = material.files?.some(
          (f) =>
            f.status === "NOTES_GENERATION_FAILED" ||
            f.status === "PROCESSING_FAILED",
        );

        if (hasReadyFiles) {
          setProcessedMaterial(material);
          setStep(4); // Advance to Step 4: Notes & Quiz Ready!
        } else if (hasFailedFiles) {
          const failMessage =
            material.files.find((f) => f.errorMessage)?.errorMessage ||
            "Error generating AI notes.";
          setProcessingError(failMessage);
        }
      } catch (err) {
        // Silent catch for transient polling network errors
      }
    }

    void checkStatus();

    const interval = setInterval(() => {
      void checkStatus();
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [step, createdMaterialId, token]);

  function handleNextStep() {
    const nextErrors: FormErrors = {};

    if (!values.title.trim()) {
      nextErrors.title = "Please enter a material title.";
    }
    if (!values.subjectId) {
      nextErrors.subjectId = "Selecting a subject is required.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setStep(2);
  }

  async function handlePickFile() {
    setSubmitError(null);
    const result = await DocumentPicker.getDocumentAsync({
      multiple: false,
      copyToCacheDirectory: true,
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "image/*",
      ],
    });

    if (result.canceled) return;

    const picked = result.assets[0];
    if (picked.size && picked.size > MAX_FILE_SIZE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        file: "File size must be under 25 MB.",
      }));
      return;
    }

    setValues((prev) => ({
      ...prev,
      file: {
        uri: picked.uri,
        name: picked.name,
        mimeType: picked.mimeType ?? "application/pdf",
        size: picked.size ?? null,
      },
    }));

    setErrors((prev) => ({ ...prev, file: undefined }));
  }

  async function handleFinalSubmit() {
    if (!values.file) {
      setErrors((prev) => ({
        ...prev,
        file: "Please select a PDF document to upload.",
      }));
      return;
    }

    try {
      setSubmitError(null);
      const result = await onSubmit({
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        subjectId: values.subjectId,
        file: {
          uri: values.file.uri,
          name: values.file.name,
          type: values.file.mimeType,
        },
      });

      if (result && typeof result === "object" && "id" in result) {
        setCreatedMaterialId(result.id);
        setStep(3); // Move to Step 3: Processing & Polling
      } else {
        handleOpenChange(false);
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Failed to upload study material.";
      setSubmitError(message);
    }
  }

  async function handleCreateSubject(name: string) {
    const created = await createSubjectMutation.mutateAsync({ name });
    if (created?.id) {
      setValues((prev) => ({ ...prev, subjectId: String(created.id) }));
      setErrors((prev) => ({ ...prev, subjectId: undefined }));
    }
  }

  async function handleDownloadPdf() {
    if (values.file?.uri) {
      try {
        if (Platform.OS === "web") {
          window.open(values.file.uri, "_blank");
        } else {
          await WebBrowser.openBrowserAsync(values.file.uri);
        }
      } catch {
        await Linking.openURL(values.file.uri);
      }
    } else {
      Alert.alert("PDF Ready", "Uploaded PDF file ready in your library.");
    }
  }

  function handleTakeQuiz() {
    handleOpenChange(false);
    router.push("/(tabs)/quizzes");
  }

  function getStepTitle() {
    switch (step) {
      case 1:
        return "Enter Details";
      case 2:
        return "Upload Document";
      case 3:
        return "Generating AI Notes...";
      case 4:
        return "Notes & Quizzes Ready!";
      default:
        return "";
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#FAF8F5] dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 rounded-t-[32px] rounded-b-none px-6 pb-8 pt-4 w-full max-w-none shadow-2xl max-h-[90vh]">
        {/* Bottom Sheet Drag Handle */}
        <View className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full self-center mb-3" />

        {/* Progress Header */}
        <View className="pr-8 pb-1">
          <StepProgressBar
            currentStep={step}
            totalSteps={4}
            stepTitle={getStepTitle()}
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 20, paddingTop: 8, paddingBottom: 16 }}
        >
          {step === 1 && (
            /* STEP 1: Details & Subject Selection */
            <View className="gap-6">
              <View className="gap-2">
                <Text variant="h2">Material Title</Text>
                <Text variant="muted">
                  This title will be displayed in your study materials
                </Text>

                <Input
                  value={values.title}
                  onChangeText={(text) => {
                    setValues((prev) => ({ ...prev, title: text }));
                    if (errors.title)
                      setErrors((prev) => ({ ...prev, title: undefined }));
                  }}
                  placeholder="e.g. Chapter 3 Study Notes"
                  placeholderTextColor="#A8A29E"
                  className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl px-5 h-14 text-base font-medium text-stone-900 dark:text-stone-100 mt-1 shadow-2xs"
                />

                {errors.title ? (
                  <Text variant="error">{errors.title}</Text>
                ) : null}
              </View>

              <View className="gap-2">
                <SubjectPicker
                  subjects={subjects}
                  selectedSubjectId={values.subjectId}
                  onSelectSubject={(id) => {
                    setValues((prev) => ({ ...prev, subjectId: id }));
                    if (errors.subjectId)
                      setErrors((prev) => ({ ...prev, subjectId: undefined }));
                  }}
                  onCreateSubject={handleCreateSubject}
                  isLoading={isLoadingSubjects}
                  isCreating={createSubjectMutation.isPending}
                  error={errors.subjectId}
                />
              </View>

              <Button
                onPress={handleNextStep}
                className="mt-4 bg-[#8B5CF6] active:bg-[#7C3AED] rounded-full h-14 flex-row items-center justify-center shadow-md border-0"
              >
                <Text className="text-base font-bold text-white">Continue</Text>
              </Button>
            </View>
          )}

          {step === 2 && (
            /* STEP 2: PDF File Upload */
            <View className="gap-6">
              <View className="gap-1.5">
                <Text variant="h2">Upload PDF Document</Text>
                <Text variant="muted">
                  Upload a PDF file to generate AI notes automatically
                </Text>
              </View>

              <PdfDropzone
                file={values.file}
                onPickFile={handlePickFile}
                onRemoveFile={() =>
                  setValues((prev) => ({ ...prev, file: null }))
                }
                disabled={submitting}
                error={errors.file}
              />

              {submitError ? (
                <Text variant="error" className="text-center">
                  {submitError}
                </Text>
              ) : null}

              <View className="gap-3 mt-2">
                <Button
                  onPress={handleFinalSubmit}
                  disabled={submitting || !values.file}
                  className={`rounded-full h-14 flex-row items-center justify-center gap-2 shadow-md border-0 ${
                    submitting || !values.file
                      ? "bg-stone-300 dark:bg-stone-700"
                      : "bg-[#8B5CF6] active:bg-[#7C3AED]"
                  }`}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : null}
                  <Text className="text-base font-bold text-white">
                    {submitting ? "Uploading..." : "Upload & Process"}
                  </Text>
                </Button>

                <Button
                  variant="ghost"
                  onPress={() => setStep(1)}
                  disabled={submitting}
                  className="h-11 items-center justify-center"
                >
                  <Text variant="muted" className="font-semibold">
                    Back
                  </Text>
                </Button>
              </View>
            </View>
          )}

          {step === 3 && (
            /* STEP 3: AI Processing & Notes Generation Polling */
            <View className="gap-6 py-6 items-center justify-center">
              <View className="w-20 h-20 rounded-full bg-[#EDE9FE] items-center justify-center border-4 border-[#8B5CF6]/30 animate-pulse">
                <ActivityIndicator size="large" color="#8B5CF6" />
              </View>

              <View className="gap-1.5 items-center">
                <Text variant="h2" className="text-center">
                  Generating AI Notes & Quizzes...
                </Text>
                <Text variant="muted" className="text-center px-4">
                  Scanning your PDF file. This usually takes just a few seconds.
                </Text>
              </View>

              <View className="w-full bg-white dark:bg-stone-800 rounded-2xl p-4 gap-3 border border-stone-200 dark:border-stone-700">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Feather name="check-circle" size={16} color="#10B981" />
                    <Text variant="subhead">
                      File Uploaded ({values.file?.name})
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="#8B5CF6" />
                    <Text variant="primary" className="text-xs">
                      Processing AI Summaries & Quiz...
                    </Text>
                  </View>
                </View>
              </View>

              {processingError ? (
                <View className="w-full gap-3">
                  <Text variant="error" className="text-center">
                    {processingError}
                  </Text>
                  <Button
                    variant="outline"
                    onPress={() => handleOpenChange(false)}
                    className="bg-stone-200 dark:bg-stone-700 rounded-full py-3 items-center"
                  >
                    <Text variant="subhead">Close</Text>
                  </Button>
                </View>
              ) : null}
            </View>
          )}

          {step === 4 && (
            /* STEP 4: Success, Generated Notes Display & Action Buttons (Download & Quiz) */
            <View className="gap-5 py-2">
              <View className="flex-row items-center justify-between bg-[#D1FAE5] p-3.5 rounded-2xl border border-[#10B981]/30">
                <View className="flex-row items-center gap-2.5 flex-1">
                  <View className="w-9 h-9 rounded-full bg-[#10B981] items-center justify-center">
                    <Feather name="check" size={20} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text variant="success" className="text-sm font-bold">
                      AI Notes & Quiz Ready!
                    </Text>
                    <Text className="text-xs text-[#065F46]" numberOfLines={1}>
                      {processedMaterial?.title || values.title}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Generated Notes Preview Box */}
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5">
                    <Feather name="file-text" size={16} color="#8B5CF6" />
                    <Text variant="h3">Generated AI Notes</Text>
                  </View>
                  <Pressable
                    onPress={() => setShowFullNotesView((prev) => !prev)}
                    className="flex-row items-center gap-1"
                  >
                    <Text variant="primary" className="text-xs">
                      {showFullNotesView ? "Collapse" : "Read Full"}
                    </Text>
                    <Feather
                      name={showFullNotesView ? "chevron-up" : "chevron-down"}
                      size={14}
                      color="#8B5CF6"
                    />
                  </Pressable>
                </View>

                <ScrollView
                  nestedScrollEnabled
                  className={`bg-[#FAF8F5] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl p-4 ${
                    showFullNotesView ? "max-h-80" : "max-h-40"
                  }`}
                >
                  <HtmlNotesView content={processedMaterial?.processedNotes} />
                </ScrollView>
              </View>

              {/* User Friendly Action Buttons */}
              <View className="gap-3 pt-2">
                {/* Take a Quiz Button */}
                <Button
                  onPress={handleTakeQuiz}
                  className="bg-[#8B5CF6] active:bg-[#7C3AED] rounded-full h-14 flex-row items-center justify-center gap-2.5 shadow-md border-0"
                >
                  <Feather name="award" size={20} color="#FFFFFF" />
                  <Text className="text-base font-bold text-white">
                    Take Quiz
                  </Text>
                </Button>

                {/* Download PDF / View Button */}
                <Button
                  variant="outline"
                  onPress={handleDownloadPdf}
                  className="bg-white dark:bg-stone-800 border-2 border-[#8B5CF6] rounded-full h-14 flex-row items-center justify-center gap-2.5 shadow-xs"
                >
                  <Feather name="download" size={18} color="#8B5CF6" />
                  <Text className="text-base font-bold text-[#8B5CF6]">
                    View / Download PDF
                  </Text>
                </Button>

                {/* Finish Dismiss Button */}
                <Button
                  variant="ghost"
                  onPress={() => handleOpenChange(false)}
                  className="h-10 items-center justify-center mt-1"
                >
                  <Text className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                    Done / View in Library
                  </Text>
                </Button>
              </View>
            </View>
          )}
        </ScrollView>
      </DialogContent>
    </Dialog>
  );
}
