import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { AppHeaderBrand } from "@/components/ui/app-logo";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { useAuth } from "@/lib/auth";
import { useThemePreference } from "@/lib/theme-preference";
import { cn } from "@/lib/utils";
import { quizzesApi, type QuizAttempt, type QuizQuestion } from "@/services";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as React from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { QuestionOptions } from "./question-options";
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
  const { isDark } = useThemePreference();
  const confirm = useConfirmDialog();
  const [secondsLeft, setSecondsLeft] = React.useState(135); // 02:15 countdown

  // Timer countdown interval
  React.useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [open]);

  const formattedTimer = React.useMemo(() => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [secondsLeft]);

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
  const subjectName = quizDetails?.subject?.name ?? quizDetails?.subjectName ?? "Physics";
  const materialTitle = quizDetails?.title ?? "Laws of Motion";
  const difficultyLevel = quizDetails?.difficultyLevel ?? "Medium";

  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<AnswerState>({});
  const [isShowingSolution, setIsShowingSolution] = React.useState(false);
  const hasInitializedIndex = React.useRef(false);

  React.useEffect(() => {
    if (!attempt) {
      hasInitializedIndex.current = false;
      setAnswers({});
      setCurrentQuestionIndex(0);
      return;
    }

    // Load all existing saved attempt answers into state
    const initialAnswers: AnswerState = {};
    for (const answer of attempt.quizAttemptAnswers ?? []) {
      if (answer.questionId && answer.userAnswer) {
        initialAnswers[answer.questionId] = {
          answer: answer.userAnswer,
          saved: true,
        };
      }
    }

    setAnswers((prev) => ({ ...initialAnswers, ...prev }));

    // Resume from first unanswered question index when questions finish loading
    const answeredCount = attempt.quizAttemptAnswers?.length ?? 0;
    if (!hasInitializedIndex.current && questions.length > 0) {
      hasInitializedIndex.current = true;
      const resumeIndex = Math.min(answeredCount, questions.length - 1);
      setCurrentQuestionIndex(Math.max(resumeIndex, 0));
      setIsShowingSolution(false);
    }
  }, [attempt, attempt?.id, questions]);

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

  const topicKeyword = React.useMemo(() => {
    if (currentQuestion?.question) {
      const words = currentQuestion.question.split(" ");
      if (words.length > 3) return words.slice(0, 3).join(" ");
    }
    return materialTitle;
  }, [currentQuestion?.question, materialTitle]);

  const answersRef = React.useRef(answers);
  React.useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const saveAllDraftAnswers = React.useCallback(
    async (answersSnapshot?: AnswerState) => {
      if (!attempt) return true;

      const sourceAnswers = answersSnapshot ?? answersRef.current;

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
    [attempt, questionTypeById, saveMutation],
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

  const onPrevious = React.useCallback(() => {
    if (isFirstQuestion) return;
    setIsShowingSolution(false);
    setCurrentQuestionIndex((value) => Math.max(0, value - 1));
  }, [isFirstQuestion]);

  const onNext = React.useCallback(async () => {
    await goToNextQuestion();
  }, [goToNextQuestion]);

  const onToggleSolution = React.useCallback(() => {
    setIsShowingSolution((v) => !v);
  }, []);

  const currentQuestionId = currentQuestion?.id;

  const onAnswerChange = React.useCallback(
    (nextValue: string) => {
      if (!currentQuestionId) return;

      setAnswers((prev) => ({
        ...prev,
        [currentQuestionId]: {
          answer: nextValue,
          saved: false,
        },
      }));
    },
    [currentQuestionId],
  );

  if (!open || !attempt) return null;

  return (
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => void onAttemptExit()}
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isDark ? "#0c0a09" : "#ffffff" }}
        className="flex-1 bg-background"
        edges={["top", "bottom"]}
      >
        {/* 1. Header Bar: Back Arrow & StudyCircleAI Logo */}
        <View className="flex-row items-center justify-between px-5 py-3 border-b border-border bg-card">
          <Pressable
            onPress={() => void onAttemptExit()}
            className="w-10 h-10 rounded-full items-center justify-center bg-muted active:opacity-70"
            hitSlop={8}
          >
            <Icon name="chevron-left" size={24} className="text-foreground" />
          </Pressable>

          <AppHeaderBrand logoSize={34} />

          <View className="w-10 h-10" />
        </View>

        {/* 2. Main Screen Scrollable Content */}
        <ScrollView
          style={{ flex: 1, backgroundColor: isDark ? "#0c0a09" : "#ffffff" }}
          className="flex-1 bg-background"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 40,
            gap: 16,
          }}
        >
          {quizQuery.isLoading ? (
            <Spinner
              variant="quiz"
              size="large"
              message="Loading Quiz Questions..."
              containerStyle={{ paddingVertical: 64 }}
            />
          ) : quizQuery.isError ? (
            <View className="py-12 items-center justify-center gap-3">
              <Feather name="alert-circle" size={24} color={APP_COLORS.error} />
              <Text variant="h4" className="text-center">
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
              <Text variant="h4" className="text-center">
                No questions found for this quiz
              </Text>
            </View>
          ) : currentQuestion ? (
            <>
              {/* Breadcrumb Row: [Icon Subject] > [Material Title] */}
              <View className="flex-row items-center gap-2">
                <View className="w-7 h-7 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 items-center justify-center">
                  <Icon name="flask-outline" size={14} color="#059669" />
                </View>
                <Text variant="subhead" className="font-bold">
                  {subjectName}
                </Text>
                <Icon name="chevron-right" size={12} className="text-muted-foreground" />
                <Text
                  variant="subhead"
                  className="text-primary font-semibold flex-1"
                  numberOfLines={1}
                >
                  {materialTitle}
                </Text>
              </View>

              {/* Title & Timer Row */}
              <View className="gap-1">
                <Text variant="h1" className="text-3xl font-black tracking-tight">
                  Practice Quiz
                </Text>

                <View className="flex-row items-center justify-between mt-1">
                  <Text variant="subhead" className="text-primary font-bold text-base">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </Text>
                  <View className="flex-row items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full border border-border">
                    <Icon name="clock" size={14} className="text-foreground" />
                    <Text variant="subhead" className="font-extrabold">
                      {formattedTimer}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Progress Bar & Percentage Pill */}
              <View className="flex-row items-center gap-3">
                <View className="flex-1 h-3 rounded-full bg-muted overflow-hidden border border-border/50">
                  <View
                    style={{ width: `${progressPercent}%` }}
                    className="h-full bg-primary rounded-full"
                  />
                </View>
                <Text variant="subhead" className="font-black text-primary">
                  {progressPercent}%
                </Text>
              </View>

              {/* Tag Pills Row: Difficulty + Topic */}
              <View className="flex-row items-center gap-2">
                <View className="bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 px-4 py-1.5 rounded-full">
                  <Text variant="caption" className="font-bold text-amber-600 dark:text-amber-400">
                    {difficultyLevel}
                  </Text>
                </View>
                <View className="bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
                  <Text
                    variant="caption"
                    className="font-bold text-primary"
                    numberOfLines={1}
                  >
                    {topicKeyword}
                  </Text>
                </View>
              </View>

              {/* Question & Options Card Container */}
              <View className="bg-card border border-border rounded-3xl p-5 gap-5 shadow-xs">
                <Text variant="h3" className="font-black leading-7 text-lg">
                  {currentQuestion.question}
                </Text>

                {/* Option Choices */}
                <QuestionOptions
                  type={currentQuestion.type}
                  options={currentQuestion.options ?? []}
                  value={currentAnswer}
                  onChange={onAnswerChange}
                />
              </View>

              {/* Navigation Action Buttons Row: Prev + Submit Answer */}
              <View className="flex-row items-center gap-3">
                <Pressable
                  onPress={onPrevious}
                  disabled={isFirstQuestion || saveMutation.isPending}
                  className="px-5 py-4 rounded-2xl border border-border bg-card flex-row items-center justify-center gap-1.5 active:opacity-80 disabled:opacity-40 shadow-2xs"
                >
                  <Icon name="chevron-left" size={18} className="text-foreground" />
                  <Text variant="subhead" className="font-bold">
                    Prev
                  </Text>
                </Pressable>

                <Pressable
                  onPress={onNext}
                  disabled={!currentAnswer.trim() || saveMutation.isPending}
                  className={cn(
                    "flex-1 rounded-2xl py-4 flex-row items-center justify-center gap-2 shadow-md active:opacity-90",
                    !currentAnswer.trim() || saveMutation.isPending
                      ? "bg-muted border border-border"
                      : "bg-primary"
                  )}
                >
                  <Text
                    variant="subhead"
                    className={cn(
                      "font-bold text-base",
                      !currentAnswer.trim() || saveMutation.isPending
                        ? "text-muted-foreground"
                        : "text-primary-foreground"
                    )}
                  >
                    {isLastQuestion ? "Submit Quiz →" : "Submit answer →"}
                  </Text>
                </Pressable>
              </View>

              {/* View Explanation Accordion Card */}
              <Pressable
                onPress={onToggleSolution}
                className="bg-card border border-border rounded-3xl p-4 gap-2 active:opacity-90 shadow-xs"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View className="w-9 h-9 rounded-2xl bg-primary/10 items-center justify-center">
                      <Icon name="bar-chart-2" size={18} color={APP_COLORS.primary} />
                    </View>
                    <Text variant="h4" className="font-bold text-base">
                      View explanation
                    </Text>
                  </View>
                  <Icon
                    name={isShowingSolution ? "chevron-up" : "chevron-down"}
                    size={20}
                    className="text-muted-foreground"
                  />
                </View>

                {isShowingSolution ? (
                  <QuizSolutionBox
                    answer={currentQuestion.answer}
                    explanation={currentQuestion.explanation}
                  />
                ) : (
                  <Text variant="muted" className="text-xs text-muted-foreground">
                    See the correct answer and a detailed explanation after you submit.
                  </Text>
                )}
              </Pressable>
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
