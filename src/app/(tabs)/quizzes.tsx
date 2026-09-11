import {
  QuizCard,
  QuizResultsSheet,
  StartQuizSheet,
} from "@/components/quizzes";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { InfiniteListFooter } from "@/components/ui/infinite-list-footer";
import { Input } from "@/components/ui/input";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Spinner } from "@/components/ui/spinner";
import { SubjectSelectDropdown } from "@/components/ui/subject-select-dropdown";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import {
  useQuizzesInfiniteQuery,
  useStartQuizAttempt,
  useSubjectsQuery,
} from "@/hooks/queries";
import { type Quiz, type QuizAttempt } from "@/services";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import * as React from "react";
import {
  Alert,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PAGE_SIZE = 8;

export default function QuizzesScreen() {
  const [searchText, setSearchText] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("");
  const [startingQuizId, setStartingQuizId] = React.useState<string | null>(null);

  const [selectedQuizAttempt, setSelectedQuizAttempt] =
    React.useState<QuizAttempt | null>(null);
  const [selectedQuizForResults, setSelectedQuizForResults] = React.useState<{
    quizId: string;
    totalQuestions: number;
  } | null>(null);

  // Auto-close quiz sheets when navigating away from this tab
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setSelectedQuizAttempt(null);
        setSelectedQuizForResults(null);
      };
    }, [])
  );

  const {
    subjectOptions,
    isLoading: isLoadingSubjects,
    isError: isSubjectsError,
  } = useSubjectsQuery();

  const {
    quizzes,
    isLoading: isLoadingQuizzes,
    isForbidden,
    forbiddenMessage,
    isFetchingNextPage,
    isRefreshing,
    hasNextPage,
    fetchNextPage,
    refetch: refetchQuizzes,
  } = useQuizzesInfiniteQuery({
    limit: PAGE_SIZE,
    search,
    subjectId: selectedSubjectId,
  });

  const startAttemptMutation = useStartQuizAttempt();

  const isFiltered = Boolean(search) || Boolean(selectedSubjectId);

  const handleRefresh = React.useCallback(() => {
    refetchQuizzes();
  }, [refetchQuizzes]);

  const handleApplySearch = React.useCallback(() => {
    setSearch(searchText.trim());
  }, [searchText]);

  const handleClearSearch = React.useCallback(() => {
    setSearchText("");
    setSearch("");
  }, []);

  const handleClearFilters = React.useCallback(() => {
    setSearchText("");
    setSearch("");
    setSelectedSubjectId("");
  }, []);

  const handleStartQuiz = React.useCallback(
    async (quiz: Quiz) => {
      if (quiz.totalQuestions <= 0) {
        Alert.alert("No Questions", "This quiz has no questions yet.");
        return;
      }

      try {
        setStartingQuizId(quiz.id);
        const attempt = await startAttemptMutation.mutateAsync(quiz.id);
        setSelectedQuizAttempt(attempt);
        setSelectedQuizForResults(null);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to start quiz attempt right now.";
        Alert.alert("Start Failed", message);
      } finally {
        setStartingQuizId(null);
      }
    },
    [startAttemptMutation]
  );

  const handleViewResults = React.useCallback((quiz: Quiz) => {
    setSelectedQuizForResults({
      quizId: quiz.id,
      totalQuestions: quiz.totalQuestions,
    });
    setSelectedQuizAttempt(null);
  }, []);

  const handleStartSheetOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      setSelectedQuizAttempt(null);
      refetchQuizzes();
    }
  }, [refetchQuizzes]);

  const handleResultsSheetOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      setSelectedQuizForResults(null);
    }
  }, []);

  const keyExtractor = React.useCallback((item: Quiz) => item.id, []);

  const ItemSeparator = React.useCallback(() => <View className="h-3" />, []);

  const renderItem = React.useCallback(
    ({ item }: { item: Quiz }) => (
      <QuizCard
        quiz={item}
        onStartQuiz={handleStartQuiz}
        onViewResults={handleViewResults}
        isStarting={startAttemptMutation.isPending && startingQuizId === item.id}
      />
    ),
    [handleStartQuiz, handleViewResults, startAttemptMutation.isPending, startingQuizId]
  );

  const ListHeaderComponent = React.useMemo(
    () => (
      <View className="gap-3.5 pb-2">
        <ScreenHeader
          welcomeText="Practice & Test"
          title="Quizzes"
          subtitle="Auto-generated practice sets from your study materials"
        />

        {/* AI Quiz Notice Banner */}
        <View className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 flex-row items-center gap-3">
          <View className="w-8 h-8 rounded-xl bg-amber-500/20 items-center justify-center">
            <Feather name="zap" size={16} color={APP_COLORS.warningDark} />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-semibold text-amber-900 dark:text-amber-300">
              Smart Practice Sets
            </Text>
            <Text className="text-xs text-amber-800/80 dark:text-amber-400 mt-0.5">
              Quizzes are generated from your uploaded study materials.
            </Text>
          </View>
        </View>

        {/* Search & Subject Filters */}
        <View className="gap-2.5">
          {/* Search Input Bar */}
          <View className="flex-row items-center gap-2">
            <View className="flex-1 relative justify-center">
              <Input
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search by title..."
                returnKeyType="search"
                onSubmitEditing={handleApplySearch}
                className="pr-9 h-11 rounded-xl text-sm"
              />
              {searchText ? (
                <Pressable
                  onPress={handleClearSearch}
                  className="absolute right-3 p-1 active:opacity-70"
                >
                  <Feather name="x" size={16} color={APP_COLORS.iconLight} />
                </Pressable>
              ) : null}
            </View>

            <Button
              variant="outline"
              onPress={handleApplySearch}
              className="h-11 rounded-xl px-3.5"
            >
              <Feather name="search" size={16} color={APP_COLORS.grayMuted} />
            </Button>
          </View>

          {/* Subject Dropdown & Clear Filters Row */}
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <SubjectSelectDropdown
                value={selectedSubjectId}
                onValueChange={(val) => setSelectedSubjectId(val)}
                subjects={subjectOptions}
                isLoading={isLoadingSubjects}
                showAllOption
                allOptionLabel="All subjects"
                placeholder="Filter by subject"
              />
            </View>

            {isFiltered ? (
              <Button
                variant="ghost"
                onPress={handleClearFilters}
                className="h-10 rounded-xl px-3"
              >
                <Feather name="x-circle" size={15} color={APP_COLORS.error} />
                <Text variant="error" className="text-xs font-semibold">
                  Clear
                </Text>
              </Button>
            ) : null}
          </View>

          {isSubjectsError ? (
            <Text variant="error" className="text-xs">
              Failed to load subjects for filtering.
            </Text>
          ) : null}
        </View>
      </View>
    ),
    [
      searchText,
      handleApplySearch,
      handleClearSearch,
      selectedSubjectId,
      subjectOptions,
      isLoadingSubjects,
      isFiltered,
      handleClearFilters,
      isSubjectsError,
    ]
  );

  const listEmptyComponent = React.useMemo(
    () =>
      isForbidden ? (
        <View className="py-8 px-4 items-center gap-4 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-3xl">
          <View className="w-12 h-12 rounded-2xl bg-amber-500/20 items-center justify-center border border-amber-500/30">
            <Feather name="lock" size={24} color={APP_COLORS.warningDark} />
          </View>

          <View className="gap-1 items-center">
            <Text className="text-base font-bold text-amber-950 dark:text-amber-200 text-center">
              Plan Upgrade Required
            </Text>
            <Text className="text-xs text-amber-900/80 dark:text-amber-300 text-center px-2 leading-5 font-medium">
              {forbiddenMessage || "Access denied. Upgrade your plan to access this feature."}
            </Text>
          </View>

          <Button
            variant="terracotta"
            icon="external-link"
            iconPosition="right"
            title="Upgrade Plan on Billing →"
            onPress={() => {
              void Linking.openURL("https://app.usestudycircle.ai/billings");
            }}
            className="w-full h-11 rounded-2xl justify-center items-center mt-1"
          />
        </View>
      ) : !isLoadingQuizzes ? (
        <EmptyState
          icon="zap"
          title="No Quizzes Found"
          description={
            isFiltered
              ? "No quizzes matched your search filter. Try clearing filters."
              : "Upload a study material document to automatically generate your first practice quiz."
          }
          actionLabel={isFiltered ? "Clear Filters" : undefined}
          onAction={isFiltered ? handleClearFilters : undefined}
        />
      ) : (
        <View className="py-12">
          <Spinner
            variant="primary"
            size="large"
            message="Loading quizzes..."
          />
        </View>
      ),
    [isForbidden, forbiddenMessage, isLoadingQuizzes, isFiltered, handleClearFilters],
  );

  const listFooterComponent = React.useMemo(
    () => (
      <InfiniteListFooter
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        totalLoaded={quizzes.length}
        itemLabel="quizzes"
      />
    ),
    [isFetchingNextPage, hasNextPage, quizzes.length],
  );

  const refreshControlComponent = React.useMemo(
    () => (
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        tintColor={APP_COLORS.primary}
        colors={[APP_COLORS.primary]}
      />
    ),
    [isRefreshing, handleRefresh],
  );

  return (
    <SafeAreaView className="bg-stone-50 dark:bg-stone-950 flex-1" edges={["top"]}>
      <FlatList
        data={quizzes}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={listFooterComponent}
        ListEmptyComponent={listEmptyComponent}
        refreshControl={refreshControlComponent}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.4}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
      />

      {/* Quiz Attempt Bottom Sheet */}
      {selectedQuizAttempt ? (
        <StartQuizSheet
          key={selectedQuizAttempt.id}
          open={Boolean(selectedQuizAttempt)}
          onOpenChange={handleStartSheetOpenChange}
          attempt={selectedQuizAttempt}
        />
      ) : null}

      {/* Quiz Results Bottom Sheet */}
      {selectedQuizForResults ? (
        <QuizResultsSheet
          key={selectedQuizForResults.quizId}
          open
          onOpenChange={handleResultsSheetOpenChange}
          quizId={selectedQuizForResults.quizId}
          totalQuestions={selectedQuizForResults.totalQuestions}
        />
      ) : null}
    </SafeAreaView>
  );
}
