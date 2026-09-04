import { QuizResultsSheet } from "@/components/quizzes/quiz-results-sheet";
import { StartQuizSheet } from "@/components/quizzes/start-quiz-sheet";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import {
  useQuizzesQuery,
  useStartQuizAttempt,
  useSubjectsQuery,
} from "@/hooks/queries";
import {
  type Quiz,
  type QuizAttempt,
  type QuizDifficultyLevel,
} from "@/services";
import { Feather } from "@expo/vector-icons";
import * as React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PAGE_SIZE = 8;

const DIFFICULTY_LABELS: Record<QuizDifficultyLevel, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

function difficultyChipClass(level: QuizDifficultyLevel) {
  switch (level) {
    case "EASY":
      return "rounded-full bg-emerald-100 px-2 py-1";
    case "MEDIUM":
      return "rounded-full bg-amber-100 px-2 py-1";
    default:
      return "rounded-full bg-rose-100 px-2 py-1";
  }
}

function difficultyTextClass(level: QuizDifficultyLevel) {
  switch (level) {
    case "EASY":
      return "text-xs text-emerald-700";
    case "MEDIUM":
      return "text-xs text-amber-700";
    default:
      return "text-xs text-rose-700";
  }
}

export default function QuizzesScreen() {
  const [page, setPage] = React.useState(1);
  const [searchText, setSearchText] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("");
  const [selectedQuizAttempt, setSelectedQuizAttempt] =
    React.useState<QuizAttempt | null>(null);
  const [selectedQuizForResults, setSelectedQuizForResults] = React.useState<{
    quizId: string;
    totalQuestions: number;
  } | null>(null);

  const {
    subjectOptions,
    isLoading: isLoadingSubjects,
    isError: isSubjectsError,
  } = useSubjectsQuery();

  const selectedSubject =
    subjectOptions.find((option) => option?.value === selectedSubjectId) ??
    null;

  const {
    quizzes,
    totalItems,
    totalPages,
    isLoading: isLoadingQuizzes,
    isFetching: isFetchingQuizzes,
    isRefreshing,
    refetch: refetchQuizzes,
  } = useQuizzesQuery({
    page,
    limit: PAGE_SIZE,
    search,
    subjectId: selectedSubjectId,
  });

  const startAttemptMutation = useStartQuizAttempt();

  const startIndex = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIndex =
    totalItems === 0 ? 0 : Math.min(page * PAGE_SIZE, totalItems);
  const isFiltered = Boolean(search) || Boolean(selectedSubjectId);

  function onRefresh() {
    refetchQuizzes();
  }

  function onPreviousPage() {
    setPage((currentPage) => Math.max(1, currentPage - 1));
  }

  function onNextPage() {
    setPage((currentPage) => Math.min(totalPages, currentPage + 1));
  }

  function onApplySearch() {
    setSearch(searchText.trim());
    setPage(1);
  }

  function onClearFilters() {
    setSearchText("");
    setSearch("");
    setSelectedSubjectId("");
    setPage(1);
  }

  async function onStartQuiz(quiz: Quiz) {
    if (quiz.totalQuestions <= 0) {
      Alert.alert("No Questions", "This quiz has no questions yet.");
      return;
    }

    try {
      const attempt = await startAttemptMutation.mutateAsync(quiz.id);
      setSelectedQuizAttempt(attempt);
      setSelectedQuizForResults(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to start quiz attempt right now.";
      Alert.alert("Start Failed", message);
    }
  }

  return (
    <SafeAreaView className="bg-background flex-1" edges={['top']}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
      >
        <View className="mx-auto w-full max-w-md gap-4 pb-8">
          <Card className="gap-2 py-4">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-base">Important Notice</CardTitle>
              <CardDescription>
                Practice sets are auto-generated from uploaded study materials.
              </CardDescription>
            </CardHeader>
          </Card>

          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-2xl font-semibold">Quizzes</Text>
              <Text className="text-muted-foreground text-sm">
                Search and filter quizzes by subject before starting an attempt.
              </Text>
            </View>
            <Button
              size="icon"
              variant="outline"
              onPress={onRefresh}
              disabled={isLoadingQuizzes || isFetchingQuizzes}
            >
              {isLoadingQuizzes || isFetchingQuizzes ? (
                <ActivityIndicator size="small" />
              ) : (
                <Feather name="refresh-cw" size={16} color="#a3a3a3" />
              )}
            </Button>
          </View>

          <View className="gap-2">
            <Text className="text-muted-foreground text-xs">Search quiz</Text>
            <View className="flex-row items-center gap-2">
              <Input
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search by title or description"
                returnKeyType="search"
                onSubmitEditing={onApplySearch}
                className="flex-1"
              />
              <Button variant="outline" onPress={onApplySearch}>
                <Feather name="search" size={16} color="#a3a3a3" />
                <Text>Search</Text>
              </Button>
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-muted-foreground text-xs">
              Filter by subject
            </Text>
            <Select
              value={selectedSubject!}
              onValueChange={(option) => {
                setSelectedSubjectId(option?.value ?? "");
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoadingSubjects
                      ? "Loading subjects..."
                      : "All subjects"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {subjectOptions.map((subject) => (
                    <SelectItem
                      key={subject?.value}
                      value={subject?.value!}
                      label={subject?.label!}
                    />
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {isSubjectsError ? (
              <Text className="text-destructive text-xs">
                Failed to load subjects for filtering.
              </Text>
            ) : null}
          </View>

          <View className="flex-row gap-2">
            <Button
              className="flex-1"
              variant="outline"
              onPress={onClearFilters}
              disabled={!isFiltered}
            >
              <Feather name="x-circle" size={16} color="#a3a3a3" />
              <Text>Clear Filters</Text>
            </Button>
          </View>

          {isLoadingQuizzes ? (
            <View className="gap-3">
              {[0, 1, 2, 3].map((item) => (
                <Card key={item} className="gap-3 py-4">
                  <CardHeader className="px-4">
                    <CardTitle className="text-base">Loading quiz...</CardTitle>
                    <CardDescription>Fetching latest quizzes</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </View>
          ) : null}

          {!isLoadingQuizzes && quizzes.length === 0 ? (
            <Card className="gap-3 py-4">
              <CardHeader className="px-4">
                <CardTitle>No Quizzes Found</CardTitle>
                <CardDescription>
                  {isFiltered
                    ? "Try adjusting your search/filter to find quizzes."
                    : "No quizzes are available right now."}
                </CardDescription>
              </CardHeader>
              {isFiltered ? (
                <CardContent className="px-4">
                  <Button
                    size="sm"
                    className="self-start"
                    onPress={onClearFilters}
                  >
                    <Feather name="rotate-ccw" size={16} color="#ffffff" />
                    <Text>Reset Filters</Text>
                  </Button>
                </CardContent>
              ) : null}
            </Card>
          ) : null}

          {!isLoadingQuizzes && quizzes.length > 0 ? (
            <>
              <FlatList
                data={quizzes}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerClassName="gap-3"
                renderItem={({ item }) => (
                  <Card className="gap-3 py-4">
                    <CardHeader className="gap-2 px-4">
                      <View className="flex-row items-start justify-between gap-2">
                        <CardTitle
                          className="text-base flex-1"
                          numberOfLines={2}
                        >
                          {item.title}
                        </CardTitle>
                        <View
                          className={difficultyChipClass(item.difficultyLevel)}
                        >
                          <Text
                            className={difficultyTextClass(
                              item.difficultyLevel,
                            )}
                          >
                            {DIFFICULTY_LABELS[item.difficultyLevel]}
                          </Text>
                        </View>
                      </View>
                      <CardDescription numberOfLines={3}>
                        {item.description?.trim() || "No description provided"}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="gap-2 px-4">
                      <View className="gap-1">
                        <Text className="text-muted-foreground text-xs">
                          Subject
                        </Text>
                        <Text className="text-sm font-medium" numberOfLines={1}>
                          {item.subject?.name ?? "N/A"}
                        </Text>
                      </View>

                      <View className="flex-row flex-wrap gap-1">
                        <View className="bg-muted rounded-full px-2 py-1">
                          <Text className="text-xs">
                            Questions: {item.totalQuestions}
                          </Text>
                        </View>
                        <View className="bg-muted rounded-full px-2 py-1">
                          <Text className="text-xs">
                            Attempts: {item._count?.quizAttempts ?? 0}
                          </Text>
                        </View>
                        {item.activeAttempt ? (
                          <View className="bg-muted rounded-full px-2 py-1">
                            <Text className="text-xs text-muted-foreground">
                              Active Attempt
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <View className="flex-row gap-2 pt-1">
                        <Button
                          size="sm"
                          className="flex-1"
                          onPress={() => onStartQuiz(item)}
                          disabled={startAttemptMutation.isPending}
                        >
                          {startAttemptMutation.isPending ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                          ) : (
                            <Feather
                              name={item.activeAttempt ? "rotate-cw" : "play"}
                              size={16}
                              color="#ffffff"
                            />
                          )}
                          <Text>
                            {item.activeAttempt ? "Resume Quiz" : "Start Quiz"}
                          </Text>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onPress={() => {
                            setSelectedQuizForResults({
                              quizId: item.id,
                              totalQuestions: item.totalQuestions,
                            });
                            setSelectedQuizAttempt(null);
                          }}
                          disabled={(item._count?.quizAttempts ?? 0) <= 0}
                        >
                          <Feather name="eye" size={16} color="#a3a3a3" />
                          <Text>Results</Text>
                        </Button>
                      </View>
                    </CardContent>
                  </Card>
                )}
              />

              <Card className="gap-3 py-4">
                <CardHeader className="gap-2 px-4">
                  <CardTitle className="text-base">Page {page}</CardTitle>
                  <CardDescription>
                    Showing {startIndex}-{endIndex} of {totalItems} quizzes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-row items-center justify-between gap-2 px-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onPress={onPreviousPage}
                    disabled={page <= 1 || isFetchingQuizzes}
                  >
                    <Feather name="chevron-left" size={16} color="#a3a3a3" />
                    <Text>Previous</Text>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onPress={onNextPage}
                    disabled={page >= totalPages || isFetchingQuizzes}
                  >
                    <Text>Next</Text>
                    <Feather name="chevron-right" size={16} color="#a3a3a3" />
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : null}
        </View>
      </ScrollView>

      {selectedQuizAttempt ? (
        <StartQuizSheet
          key={selectedQuizAttempt.id}
          open
          onOpenChange={(open) => {
            if (!open) {
              setSelectedQuizAttempt(null);
            }
          }}
          attempt={selectedQuizAttempt}
        />
      ) : null}

      {selectedQuizForResults ? (
        <QuizResultsSheet
          key={selectedQuizForResults.quizId}
          open
          onOpenChange={(open) => {
            if (!open) {
              setSelectedQuizForResults(null);
            }
          }}
          quizId={selectedQuizForResults.quizId}
          totalQuestions={selectedQuizForResults.totalQuestions}
        />
      ) : null}
    </SafeAreaView>
  );
}
