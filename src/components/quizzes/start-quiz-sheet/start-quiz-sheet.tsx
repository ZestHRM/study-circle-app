import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import {
  AppBottomSheet,
  AppBottomSheetScrollView,
} from "@/components/ui/app-bottom-sheet";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { useAuth } from "@/lib/auth";
import { quizzesApi, type QuizAttempt, type QuizQuestion } from "@/services";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as React from "react";
import { Spinner } from "@/components/ui/spinner";
import { View } from "react-native";

import { QuestionOptions } from "./question-options";
import { QuizAttemptControls } from "./quiz-attempt-controls";
import { QuizProgressHeader } from "./quiz-progress-header";
import { QuizQuestionCard } from "./quiz-question-card";
import { QuizSolutionBox } from "./quiz-solution-box";

type AnswerState = Record<string, { answer: string; saved: boolean }>;

function normalizeAnswerOption(option: string) {
  return option.trim().toLowerCase();
}

export function StartQuizSheet({
  open,
  onOpenChange,
  attempt,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attempt: QuizAttempt | null;
}) {
  const { token } = useAuth();
  const confirm = useConfirmDialog();

  const quizQuery = useQuery({
    queryKey: ["quiz-details", token, attempt?.quizId],
    queryFn: async () =>
      quizzesApi.getById(token as string, attempt?.quizId as string),
    enabled: open && Boolean(token) && Boolean(attempt?.quizId),
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      quizId: string;
      attemptId: string;
      answers: { questionId: string; answer: string }[];
    }) => {
      return quizzesApi.saveAnswers(
        token as string,
        payload.quizId,
        payload.attemptId,
        {
          answers: payload.answers,
        },
      );
    },
  });

  const rawData = quizQuery.data as any;
  const quizDetails = rawData?.data ?? rawData;
  const questions: QuizQuestion[] = quizDetails?.quizQuestions ?? [];

  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<AnswerState>({});
  const [isShowingSolution, setIsShowingSolution] = React.useState(false);

  React.useEffect(() => {
    if (!attempt) return;

    const initialAnswers: AnswerState = {};
    for (const answer of attempt.quizAttemptAnswers ?? []) {
      initialAnswers[answer.questionId] = {
        answer: answer.userAnswer,
        saved: true,
      };
    }

    setAnswers(initialAnswers);
    setCurrentQuestionIndex(
      Math.max((attempt.quizAttemptAnswers?.length ?? 1) - 1, 0),
    );
    setIsShowingSolution(false);
  }, [attempt, attempt?.id]);

  const currentQuestion: QuizQuestion | null =
    questions.length > 0 ? (questions[currentQuestionIndex] ?? null) : null;

  const questionTypeById = React.useMemo(() => {
    const entries = questions.map(
      (question) => [question.id, question.type] as const,
    );
    return new Map(entries);
  }, [questions]);

  const currentAnswer = currentQuestion
    ? (answers[currentQuestion.id]?.answer ?? "")
    : "";
  const currentAnswerState = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;

  const totalQuestions = questions.length;
  const isFirstQuestion = currentQuestionIndex <= 0;
  const isLastQuestion =
    totalQuestions > 0 && currentQuestionIndex >= totalQuestions - 1;

  const hasUnsavedAnswers = React.useMemo(
    () =>
      Object.values(answers).some(
        (value) => !value.saved && value.answer.trim().length > 0,
      ),
    [answers],
  );

  const progressPercent =
    totalQuestions > 0
      ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)
      : 0;

  const saveAllDraftAnswers = React.useCallback(
    async (answersSnapshot?: AnswerState) => {
      if (!attempt) return true;

      const sourceAnswers = answersSnapshot ?? answers;

      const draftAnswers = Object.entries(sourceAnswers)
        .filter(([, value]) => value.answer.trim().length > 0)
        .map(([questionId, value]) => ({
          questionId,
          answer:
            questionTypeById.get(questionId) === "TRUE_FALSE"
              ? normalizeAnswerOption(value.answer)
              : value.answer,
        }));

      if (draftAnswers.length === 0) return true;

      try {
        await saveMutation.mutateAsync({
          quizId: attempt.quizId,
          attemptId: attempt.id,
          answers: draftAnswers,
        });
        setAnswers((previous) => {
          const next: AnswerState = { ...previous };
          for (const key of Object.keys(next)) {
            next[key] = { ...next[key], saved: true };
          }
          return next;
        });
        return true;
      } catch (error) {
        return false;
      }
    },
    [answers, attempt, questionTypeById, saveMutation],
  );

  React.useEffect(() => {
    if (!open || !hasUnsavedAnswers || saveMutation.isPending) return;

    const timeout = setTimeout(() => {
      void saveAllDraftAnswers();
    }, 800);

    return () => clearTimeout(timeout);
  }, [open, hasUnsavedAnswers, saveMutation.isPending, saveAllDraftAnswers]);

  const onAttemptExit = React.useCallback(async () => {
    if (!hasUnsavedAnswers) {
      onOpenChange(false);
      return;
    }

    const confirmed = await confirm({
      title: "Discard Unsaved Answers?",
      description:
        "You have unsaved answers. Leaving now may lose your latest changes. Do you still want to exit?",
      confirmText: "Exit Quiz",
      cancelText: "Stay",
    });

    if (!confirmed) return;

    onOpenChange(false);
  }, [confirm, hasUnsavedAnswers, onOpenChange]);

  const goToNextQuestion = React.useCallback(
    async (answersSnapshot?: AnswerState) => {
      const saved = await saveAllDraftAnswers(answersSnapshot);
      if (!saved) return;

      setIsShowingSolution(false);

      if (isLastQuestion) {
        onOpenChange(false);
        return;
      }

      setCurrentQuestionIndex((value) => value + 1);
    },
    [isLastQuestion, onOpenChange, saveAllDraftAnswers],
  );

  const onNext = React.useCallback(async () => {
    await goToNextQuestion();
  }, [goToNextQuestion]);

  const onPrevious = React.useCallback(() => {
    if (isFirstQuestion) return;
    setIsShowingSolution(false);
    setCurrentQuestionIndex((value) => Math.max(0, value - 1));
  }, [isFirstQuestion]);

  const onToggleSolution = React.useCallback(() => {
    setIsShowingSolution((v) => !v);
  }, []);

  const onAnswerChange = React.useCallback(
    (nextValue: string) => {
      if (!currentQuestion) return;

      const nextAnswers: AnswerState = {
        ...answers,
        [currentQuestion.id]: {
          answer: nextValue,
          saved: false,
        },
      };

      setAnswers(nextAnswers);

      if (["MULTIPLE_CHOICE", "TRUE_FALSE"].includes(currentQuestion.type)) {
        void goToNextQuestion(nextAnswers);
      }
    },
    [answers, currentQuestion, goToNextQuestion],
  );

  const questionTypeLabel = React.useMemo(() => {
    if (!currentQuestion) return "Question";
    switch (currentQuestion.type) {
      case "MULTIPLE_CHOICE":
        return "Multiple Choice";
      case "TRUE_FALSE":
        return "True / False";
      case "SHORT_ANSWER":
        return "Short Answer";
      default:
        return "Question";
    }
  }, [currentQuestion]);

  return (
    <AppBottomSheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          void onAttemptExit();
          return;
        }
        onOpenChange(nextOpen);
      }}
      title={quizDetails?.title || "Practice Quiz"}
      description={
        totalQuestions > 0
          ? `Question ${currentQuestionIndex + 1} of ${totalQuestions}`
          : "Loading quiz questions..."
      }
      snapPoints={["90%"]}
      initialIndex={0}
      enablePanDownToClose={true}
      enableContentPanningGesture={true}
      backdropPressBehavior="close"
    >
      {/* Top Header Progress & Save Status Row */}
      <QuizProgressHeader
        progressPercent={progressPercent}
        isPending={saveMutation.isPending}
        isSaved={currentAnswerState?.saved}
        hasAnswer={Boolean(currentAnswerState?.answer?.trim())}
      />

      {/* Main Scrollable Content */}
      <AppBottomSheetScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 14, paddingTop: 4, paddingBottom: 16 }}
      >
        {quizQuery.isLoading ? (
          <Spinner
            variant="primary"
            size="large"
            message="Loading Quiz Questions..."
            containerStyle={{ paddingVertical: 64 }}
          />
        ) : quizQuery.isError ? (
          <View className="py-12 items-center justify-center gap-3">
            <Feather name="alert-circle" size={24} color={APP_COLORS.error} />
            <Text className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Failed to load quiz details
            </Text>
            <Button variant="outline" title="Close" onPress={onAttemptExit} />
          </View>
        ) : totalQuestions === 0 ? (
          <View className="py-12 items-center justify-center gap-3">
            <Feather
              name="help-circle"
              size={24}
              color={APP_COLORS.grayMuted}
            />
            <Text className="text-sm font-bold text-stone-900 dark:text-stone-100">
              No questions found for this quiz
            </Text>
          </View>
        ) : currentQuestion ? (
          <View className="gap-4">
            {/* Question Card */}
            <QuizQuestionCard
              questionIndex={currentQuestionIndex}
              questionTypeLabel={questionTypeLabel}
              questionText={currentQuestion.question}
            />

            {/* Question Option Choices */}
            <QuestionOptions
              type={currentQuestion.type}
              options={currentQuestion.options ?? []}
              value={currentAnswer}
              onChange={onAnswerChange}
            />

            {/* Solution & Explanation Box */}
            {isShowingSolution ? (
              <QuizSolutionBox
                answer={currentQuestion.answer}
                explanation={currentQuestion.explanation}
              />
            ) : null}
          </View>
        ) : null}
      </AppBottomSheetScrollView>

      {/* Modern Bottom Action Buttons */}
      {currentQuestion ? (
        <QuizAttemptControls
          isFirstQuestion={isFirstQuestion}
          isLastQuestion={isLastQuestion}
          isShowingSolution={isShowingSolution}
          isSavePending={saveMutation.isPending}
          hasAnswer={Boolean(currentAnswer.trim())}
          onPrevious={onPrevious}
          onToggleSolution={onToggleSolution}
          onNext={onNext}
        />
      ) : null}
    </AppBottomSheet>
  );
}
