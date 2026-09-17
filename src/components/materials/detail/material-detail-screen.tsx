import { NotesDetailBottomSheet } from "@/components/notes/notes-detail-bottom-sheet";
import { StartQuizSheet } from "@/components/quizzes";
import { AppScreen } from "@/components/ui/app-screen";
import { Spinner } from "@/components/ui/spinner";
import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import {
  useDeleteStudyMaterial,
  useQuizzesInfiniteQuery,
  useStartQuizAttempt,
  useStudyMaterialDetail,
  useStudyMaterialNotesQuery,
} from "@/hooks/queries";
import { usePlanPermissions } from "@/hooks/use-plan-permissions";
import { useAuth } from "@/lib/auth";
import { hasQuizAccess, type Quiz, type QuizAttempt } from "@/services";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as React from "react";
import { StatusBar, View } from "react-native";
import { useThemePreference } from "@/lib/theme-preference";
import { isFailed, isNotesReady, isQuizReady, isQuizFailed } from "@/lib/utils/material-status";
import { showErrorToast, showInfoToast } from "@/lib/utils/toast";
import { SwipeableTabView } from "@/components/ui/swipeable-tab-view";
import { DetailHeader } from "./detail-header";
import { MaterialTab } from "./material-tab";
import { NotesTab } from "./notes-tab";
import { QuizTab } from "./quiz-tab";
import type { TabType } from "./types";

interface MaterialDetailScreenProps {
  materialId: string;
}

export function MaterialDetailScreen({
  materialId,
}: MaterialDetailScreenProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isDark } = useThemePreference();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<TabType>("notes");
  const [showNotesSheet, setShowNotesSheet] = React.useState(false);
  const [selectedQuizAttempt, setSelectedQuizAttempt] =
    React.useState<QuizAttempt | null>(null);
  const [startingQuizId, setStartingQuizId] = React.useState<string | null>(
    null,
  );

  const { data: material, isLoading: isMaterialLoading } =
    useStudyMaterialDetail(materialId);

  const {
    data: notesData,
    isLoading: isNotesLoading,
    isError: isNotesError,
    refetch: refetchNotes,
  } = useStudyMaterialNotesQuery(material ?? materialId);

  const {
    quizzes,
    isLoading: isQuizzesLoading,
    isForbidden,
  } = useQuizzesInfiniteQuery({ limit: 20 });
  const startAttemptMutation = useStartQuizAttempt();

  const { hasQuizAccess: userHasQuizAccess } = usePlanPermissions();

  const isPro = React.useMemo(() => {
    if (isForbidden) return false;
    return userHasQuizAccess;
  }, [userHasQuizAccess, isForbidden]);

  const materialQuiz = React.useMemo(() => {
    if (!material) return null;
    return (
      quizzes.find(
        (q) =>
          (q as any).studyMaterialId === material.id ||
          material.quizId === q.id ||
          material.quizzes?.some((mq) => mq.id === q.id),
      ) ??
      quizzes[0] ??
      null
    );
  }, [quizzes, material]);

  const notesReady = material ? isNotesReady(material) : false;
  const quizReady = material ? isQuizReady(material) : false;
  const quizFailed = material ? isQuizFailed(material) : false;
  const failed = material ? isFailed(material) : false;
  const title = material?.title ?? "Study Material";
  const subject = material?.subject?.name ?? "General";
  const pdfUrl = material?.files?.[0]?.url ?? undefined;

  const handleStartQuiz = React.useCallback(
    async (quiz: Quiz) => {
      if (!quiz || quiz.totalQuestions <= 0) {
        showInfoToast("No Questions", "This quiz has no questions yet.");
        return;
      }
      try {
        setStartingQuizId(quiz.id);
        const attempt = await startAttemptMutation.mutateAsync(quiz.id);
        setSelectedQuizAttempt(attempt);
      } catch (e) {
        showErrorToast(
          "Error",
          e instanceof Error ? e.message : "Failed to start quiz.",
        );
      } finally {
        setStartingQuizId(null);
      }
    },
    [startAttemptMutation],
  );

  const handleBack = React.useCallback(() => router.back(), [router]);
  const handleReadNotes = React.useCallback(() => setShowNotesSheet(true), []);
  const handleGoToQuiz = React.useCallback(() => setActiveTab("quiz"), []);
  const handleCloseNotesSheet = React.useCallback(
    () => setShowNotesSheet(false),
    [],
  );
  const handleSheetTakeQuiz = React.useCallback(() => {
    setShowNotesSheet(false);
    setActiveTab("quiz");
  }, []);
  const handleQuizSheetChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        setSelectedQuizAttempt(null);
        void queryClient.invalidateQueries({ queryKey: ["material-quiz"] });
        void queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      }
    },
    [queryClient],
  );

  const deleteMaterialMutation = useDeleteStudyMaterial();
  const confirm = useConfirmDialog();

  const handleDeleteMaterial = React.useCallback(async () => {
    if (!material) return;
    const confirmed = await confirm({
      title: "Delete Study Material",
      description: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      await deleteMaterialMutation.mutateAsync(material.id);
      router.back();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to delete the study material right now.";
      showErrorToast("Delete Failed", message);
    }
  }, [confirm, deleteMaterialMutation, material, title, router]);

  const headerElement = React.useMemo(
    () => <DetailHeader title={title} onBack={handleBack} onDelete={handleDeleteMaterial} />,
    [title, handleBack, handleDeleteMaterial],
  );

  const loadingHeaderElement = React.useMemo(
    () => <DetailHeader title="Loading..." onBack={handleBack} />,
    [handleBack],
  );

  if (isMaterialLoading) {
    return (
      <AppScreen edges={["top"]} header={loadingHeaderElement} scrollable={false}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <View
          className="flex-1 items-center justify-center"
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Spinner
            variant="primary"
            size="large"
            message="Loading material..."
            center
          />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen edges={["top"]} header={headerElement} scrollable={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Swipeable & Clickable Tab Navigation */}
      <SwipeableTabView<TabType>
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dynamicHeight={false}
        tabs={[
          { id: "material", label: "Material", icon: "file-text" },
          { id: "notes", label: "AI Notes", icon: "star" },
          {
            id: "quiz",
            label: "Quiz",
            icon: isPro ? "zap" : "lock",
            badge: isPro ? undefined : "Pro",
            badgeVariant: "amber",
          },
        ]}
      >
        <MaterialTab material={material ?? null} />
        <NotesTab
          notesData={notesData}
          isLoading={isNotesLoading}
          isError={isNotesError}
          notesReady={notesReady}
          failed={failed}
          quizReady={quizReady}
          title={title}
          subject={subject}
          onReadNotes={handleReadNotes}
          onGoToQuiz={handleGoToQuiz}
          onRetry={refetchNotes}
        />
        <QuizTab
          quiz={materialQuiz}
          isLoading={isQuizzesLoading}
          quizReady={quizReady}
          quizFailed={quizFailed}
          isPro={isPro}
          isForbidden={isForbidden}
          onStartQuiz={handleStartQuiz}
          isStarting={startAttemptMutation.isPending}
          startingQuizId={startingQuizId}
          materialTitle={title}
        />
      </SwipeableTabView>

      {/* Notes Reader Bottom Sheet */}
      <NotesDetailBottomSheet
        open={showNotesSheet}
        onClose={handleCloseNotesSheet}
        title={notesData?.title ?? title}
        subjectName={notesData?.subjectName ?? subject}
        createdAt={notesData?.createdAt}
        content={
          notesData?.content ??
          material?.files?.[0]?.content ??
          (material as any)?.content ??
          (material as any)?.extractedText ??
          null
        }
        pdfUrl={(notesData as any)?.pdfUrl ?? undefined}
        isLoading={isNotesLoading}
        isError={isNotesError}
        isQuizReady={quizReady}
        onRetry={refetchNotes}
        onTakeQuiz={handleSheetTakeQuiz}
      />

      {/* Quiz Attempt Sheet */}
      {selectedQuizAttempt && (
        <StartQuizSheet
          key={selectedQuizAttempt.id}
          open
          onOpenChange={handleQuizSheetChange}
          attempt={selectedQuizAttempt}
        />
      )}
    </AppScreen>
  );
}
