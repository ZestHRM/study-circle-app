import { AppBottomSheet, AppBottomSheetScrollView } from '@/components/ui/app-bottom-sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { APP_COLORS } from '@/constants/colors';
import {
    quizzesApi,
    type QuizAnswerCorrectness,
    type QuizAnswerGrading,
} from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { QuizResultCardItem } from './quiz-result-card-item';

const MAX_QUIZ_ATTEMPTS = 10;

export function QuizResultsSheet({
  open,
  onOpenChange,
  quizId,
  totalQuestions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizId: string | null;
  totalQuestions: number;
}) {
  const { token } = useAuth();
  const [selectedAttemptId, setSelectedAttemptId] = React.useState('');

  const attemptsQuery = useQuery({
    queryKey: ['quiz-attempts', token, quizId],
    queryFn: async () =>
      quizzesApi.getAttempts(token as string, quizId as string, {
        page: 1,
        limit: MAX_QUIZ_ATTEMPTS,
      }),
    enabled: open && Boolean(token) && Boolean(quizId),
  });

  React.useEffect(() => {
    if (!open) {
      setSelectedAttemptId('');
      return;
    }

    const firstAttempt = attemptsQuery.data?.data?.[0];
    if (firstAttempt && !selectedAttemptId) {
      setSelectedAttemptId(firstAttempt.id);
    }
  }, [open, attemptsQuery.data?.data, selectedAttemptId]);

  const resultsLimit = Math.max(totalQuestions, 1);

  const resultsQuery = useQuery({
    queryKey: ['quiz-attempt-results', token, quizId, selectedAttemptId, resultsLimit],
    queryFn: async () =>
      quizzesApi.getAttemptResults(token as string, quizId as string, selectedAttemptId, {
        page: 1,
        limit: resultsLimit,
      }),
    enabled: open && Boolean(token) && Boolean(quizId) && Boolean(selectedAttemptId),
  });

  const results = resultsQuery.data?.data ?? [];

  const correctnessStats = React.useMemo(() => {
    const initial = {
      CORRECT: 0,
      INCORRECT: 0,
      PARTIALLY_CORRECT: 0,
      NONE: 0,
    } as Record<QuizAnswerCorrectness, number>;

    for (const result of results) {
      if (initial[result.correctness as QuizAnswerCorrectness] !== undefined) {
        initial[result.correctness as QuizAnswerCorrectness] += 1;
      }
    }

    return initial;
  }, [results]);

  const graderStats = React.useMemo(() => {
    const initial = {
      EMBEDDING: 0,
      GPT: 0,
      NONE: 0,
      MATCH: 0,
    } as Record<QuizAnswerGrading, number>;

    for (const result of results) {
      if (initial[result.gradingMethod as QuizAnswerGrading] !== undefined) {
        initial[result.gradingMethod as QuizAnswerGrading] += 1;
      }
    }

    return initial;
  }, [results]);

  const totalAnswered = results.length;
  const scorePercent =
    totalAnswered > 0
      ? Math.round(
          ((correctnessStats.CORRECT + correctnessStats.PARTIALLY_CORRECT * 0.5) /
            totalAnswered) *
            100
        )
      : 0;

  return (
    <AppBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Practice Set Results"
      description="Review past attempt scores and AI grading breakdown."
      snapPoints={['90%']}
      initialIndex={0}
      enablePanDownToClose={true}
      enableContentPanningGesture={true}
      backdropPressBehavior="close"
    >
      <AppBottomSheetScrollView
        style={{ flex: 1 }}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 14, paddingTop: 4, paddingBottom: 24 }}
      >
        {/* Attempts Selection Bar */}
        <View className="gap-2 pb-1">
          <Text className="text-stone-500 dark:text-stone-400 text-xs font-semibold">
            Select Attempt:
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {attemptsQuery.isLoading ? (
              <View className="py-2 flex-row items-center gap-2">
                <ActivityIndicator size="small" color={APP_COLORS.primary} />
                <Text className="text-xs text-stone-500">Loading attempts...</Text>
              </View>
            ) : null}

            {!attemptsQuery.isLoading && (attemptsQuery.data?.data ?? []).length === 0 ? (
              <Text className="text-stone-400 text-xs italic">No attempts found.</Text>
            ) : null}

            {(attemptsQuery.data?.data ?? []).map((attempt, index) => {
              const label = `Attempt ${(attemptsQuery.data?.data.length ?? 0) - index}`;
              const isSelected = attempt.id === selectedAttemptId;
              return (
                <Button
                  key={attempt.id}
                  size="sm"
                  variant={isSelected ? 'quiz' : 'outline'}
                  onPress={() => setSelectedAttemptId(attempt.id)}
                  className="h-9 rounded-xl px-3.5"
                >
                  <Feather
                    name={attempt.completedAt ? 'check-circle' : 'clock'}
                    size={13}
                    color={isSelected ? '#ffffff' : '#78716c'}
                  />
                  <Text className={isSelected ? 'text-white font-bold text-xs' : 'text-stone-700 dark:text-stone-300 text-xs'}>
                    {label}
                  </Text>
                </Button>
              );
            })}
          </View>
        </View>

        {resultsQuery.isLoading ? (
          <View className="py-16 items-center justify-center gap-3">
            <ActivityIndicator size="large" color={APP_COLORS.primary} />
            <Text className="text-sm font-semibold text-stone-600 dark:text-stone-400">
              Loading Quiz Results...
            </Text>
          </View>
        ) : null}

        {resultsQuery.isError ? (
          <View className="py-12 items-center justify-center gap-3">
            <Feather name="alert-circle" size={24} color={APP_COLORS.error} />
            <Text className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Failed to load results for this attempt
            </Text>
            <Text className="text-xs text-stone-500">Please select a different attempt above.</Text>
          </View>
        ) : null}

        {!resultsQuery.isLoading && !resultsQuery.isError && results.length > 0 ? (
          <>
            {/* Quick Stats Summary Card */}
            <Card className="gap-3 p-4 bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl shadow-2xs">
              <CardHeader className="p-0 gap-1">
                <View className="flex-row items-center justify-between">
                  <CardTitle className="text-base font-bold text-stone-900 dark:text-stone-100">
                    Attempt Summary
                  </CardTitle>
                  <Badge
                    label={`${scorePercent}% Score`}
                    variant={scorePercent >= 70 ? 'emerald' : scorePercent >= 40 ? 'amber' : 'destructive'}
                    icon={scorePercent >= 70 ? 'award' : 'pie-chart'}
                  />
                </View>
                <CardDescription className="text-xs text-stone-500">
                  Detailed answer breakdown and AI grading stats.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0 gap-3 pt-1">
                {/* Score Bar */}
                <View className="bg-stone-200 dark:bg-stone-800 h-2 w-full rounded-full overflow-hidden">
                  <View
                    className={`h-2 rounded-full ${
                      scorePercent >= 70
                        ? 'bg-emerald-500'
                        : scorePercent >= 40
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${scorePercent}%` }}
                  />
                </View>

                {/* Stat Chips Row */}
                <View className="flex-row flex-wrap gap-2 pt-0.5">
                  <Badge label={`Correct: ${correctnessStats.CORRECT}`} variant="emerald" icon="check-circle" />
                  <Badge label={`Partial: ${correctnessStats.PARTIALLY_CORRECT}`} variant="amber" icon="alert-circle" />
                  <Badge label={`Incorrect: ${correctnessStats.INCORRECT}`} variant="destructive" icon="x-circle" />
                  <Badge label={`Unanswered: ${correctnessStats.NONE}`} variant="outline" icon="help-circle" />
                </View>

                {/* Grading Distribution */}
                <View className="flex-row flex-wrap gap-2 pt-1 border-t border-stone-100 dark:border-stone-800/80">
                  <Text className="text-xs text-stone-400 font-medium self-center mr-1">Grader:</Text>
                  <Badge label={`GPT: ${graderStats.GPT}`} variant="blue" />
                  <Badge label={`Vector: ${graderStats.EMBEDDING}`} variant="purple" />
                  <Badge label={`Match: ${graderStats.MATCH}`} variant="emerald" />
                  {graderStats.NONE > 0 ? (
                    <Badge label={`Auto: ${graderStats.NONE}`} variant="outline" />
                  ) : null}
                </View>
              </CardContent>
            </Card>

            {/* Individual Question Results */}
            <View className="gap-3 pt-1">
              <Text className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Question Details ({results.length}):
              </Text>

              {results.map((result: any, index: number) => (
                <QuizResultCardItem key={result.id} index={index} result={result} />
              ))}
            </View>
          </>
        ) : null}
      </AppBottomSheetScrollView>
    </AppBottomSheet>
  );
}
