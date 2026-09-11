import { NotesDetailBottomSheet } from "@/components/notes/notes-detail-bottom-sheet";
import { StartQuizSheet } from "@/components/quizzes";
import { AppScreen } from "@/components/ui/app-screen";
import { Spinner } from "@/components/ui/spinner";
import {
  useQuizzesInfiniteQuery,
  useStartQuizAttempt,
  useStudyMaterialDetail,
  useStudyMaterialNotesQuery,
} from "@/hooks/queries";
import { useAuth } from "@/lib/auth";
import type { Quiz, QuizAttempt } from "@/services";
import { useRouter } from "expo-router";
import * as React from "react";
import { Alert, StatusBar, View } from "react-native";
import { isFailed, isNotesReady, isQuizReady } from "../material-card";
import { DetailHeader } from "./detail-header";
import { DetailTabBar } from "./detail-tab-bar";
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

  const isPro = Boolean(
    user?.subscriptionTier && user.subscriptionTier !== "FREE",
  );

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
  const failed = material ? isFailed(material) : false;
  const title = material?.title ?? "Study Material";
  const subject = material?.subject?.name ?? "General";
  const pdfUrl = material?.files?.[0]?.url ?? undefined;

  const handleStartQuiz = React.useCallback(
    async (quiz: Quiz) => {
      if (!quiz || quiz.totalQuestions <= 0) {
        Alert.alert("No Questions", "This quiz has no questions yet.");
        return;
      }
      try {
        setStartingQuizId(quiz.id);
        const attempt = await startAttemptMutation.mutateAsync(quiz.id);
        setSelectedQuizAttempt(attempt);
      } catch (e) {
        Alert.alert(
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
  const handleQuizSheetChange = React.useCallback((open: boolean) => {
    if (!open) setSelectedQuizAttempt(null);
  }, []);

  const headerElement = React.useMemo(
    () => <DetailHeader title={title} onBack={handleBack} />,
    [title, handleBack],
  );

  const loadingHeaderElement = React.useMemo(
    () => <DetailHeader title="Loading..." onBack={handleBack} />,
    [handleBack],
  );

  if (isMaterialLoading) {
    return (
      <AppScreen edges={["top"]} header={loadingHeaderElement} scrollable={false}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
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
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Tab Navigation */}
      <DetailTabBar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Active Tab Screen Content */}
      <View className="flex-1" style={{ flex: 1 }}>
        {activeTab === "material" && (
          <MaterialTab material={material ?? null} />
        )}
        {activeTab === "notes" && (
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
        )}
        {activeTab === "quiz" && (
          <QuizTab
            quiz={materialQuiz}
            isLoading={isQuizzesLoading}
            quizReady={quizReady}
            isPro={isPro}
            isForbidden={isForbidden}
            onStartQuiz={handleStartQuiz}
            isStarting={startAttemptMutation.isPending}
            startingQuizId={startingQuizId}
            materialTitle={title}
          />
        )}
      </View>

      {/* Notes Reader Bottom Sheet */}
      <NotesDetailBottomSheet
        open={showNotesSheet}
        onClose={handleCloseNotesSheet}
        title={notesData?.title ?? title}
        subjectName={notesData?.subjectName ?? subject}
        createdAt={notesData?.createdAt}
        content={notesData?.content}
        pdfUrl={pdfUrl}
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
