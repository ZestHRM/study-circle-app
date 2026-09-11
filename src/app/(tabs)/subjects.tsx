import { PRESET_THEMES, SubjectCard } from "@/components/subjects";
import { AppHeaderBar } from "@/components/ui/app-header-bar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { HeroBanner } from "@/components/ui/hero-banner";
import { Spinner } from "@/components/ui/spinner";
import { useNotesInfiniteQuery } from "@/hooks/queries/use-notes";
import { useQuizzesInfiniteQuery } from "@/hooks/queries/use-quizzes";
import { useStudyMaterialsInfinite } from "@/hooks/queries/use-study-materials";
import { useSubjectsQuery } from "@/hooks/queries/use-subjects";
import { formatDateTimeSplit } from "@/lib/utils/formatters";
import { Subject } from "@/services/subjects-service";
import { router } from "expo-router";
import * as React from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SubjectsScreen() {
  const insets = useSafeAreaInsets();

  // Fetch pure API data for subjects, materials, notes, quizzes
  const {
    subjects,
    isLoading: isLoadingSubjects,
    refetch: refetchSubjects,
  } = useSubjectsQuery();
  const { materials, refetch: refetchMaterials } = useStudyMaterialsInfinite({
    limit: 200,
  });
  const { notes, refetch: refetchNotes } = useNotesInfiniteQuery({
    limit: 200,
  });
  const { quizzes, refetch: refetchQuizzes } = useQuizzesInfiniteQuery({
    limit: 200,
  });

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchSubjects(),
      refetchMaterials(),
      refetchNotes(),
      refetchQuizzes(),
    ]);
    setIsRefreshing(false);
  }, [refetchSubjects, refetchMaterials, refetchNotes, refetchQuizzes]);

  const handleAddSubject = React.useCallback(() => {
    router.push("/create-subject");
  }, []);

  const handleSubjectPress = React.useCallback((id: string) => {
    router.push(`/subjects/${id}`);
  }, []);

  // Compute dynamic metrics strictly from real API data
  const displaySubjects = React.useMemo(() => {
    if (!subjects || subjects.length === 0) {
      return [];
    }

    return subjects.map((subj: Subject, idx: number) => {
      const sId = String(subj.id);
      const presetTheme = PRESET_THEMES[idx % PRESET_THEMES.length];

      const subjMaterials = materials.filter(
        (m) => String(m.subjectId) === sId || String(m.subject?.id) === sId,
      );
      const subjNotes = notes.filter(
        (n) => String(n.subjectId) === sId || String(n.subject?.id) === sId,
      );
      const subjQuizzes = quizzes.filter(
        (q) => String(q.subjectId) === sId || String(q.subject?.id) === sId,
      );

      // Parse date & time directly from backend API subject.createdAt
      let lastActiveTime = "";
      let lastActiveDate = "No activity";
      if (subj.createdAt) {
        const split = formatDateTimeSplit(subj.createdAt);
        lastActiveTime = split.time ?? "";
        lastActiveDate = split.date;
      }

      return {
        rawSubject: subj,
        id: sId,
        name: subj.name,
        course: subj.description || "General",
        colorHex: presetTheme.colorHex,
        bgHex: presetTheme.bgHex,
        iconName: presetTheme.icon as any,
        metrics: {
          materialsCount: subjMaterials.length,
          pyqCount: subjQuizzes.length,
          notesCount: subjNotes.length,
          lastActiveTime,
          lastActiveDate,
        },
      };
    });
  }, [subjects, materials, notes, quizzes]);

  const refreshControlComponent = React.useMemo(
    () => <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />,
    [isRefreshing, handleRefresh],
  );

  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      {/* Reusable Header Bar */}
      <AppHeaderBar logoPosition="left" />

      <ScrollView
        className="flex-1 px-5 pt-5"
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={refreshControlComponent}
      >
        {/* Header Section using Reusable HeroBanner with preset="subjects" */}
        <HeroBanner
          preset="subjects"
          action={
            <Button
              title="Add subject"
              icon="plus"
              variant="quiz"
              className="rounded-full h-11 mb-2"
              onPress={handleAddSubject}
            />
          }
        />

        {isLoadingSubjects && !isRefreshing ? (
          <View className="py-12">
            <Spinner
              variant="quiz"
              size="large"
              message="Loading your subjects from API..."
            />
          </View>
        ) : displaySubjects.length === 0 ? (
          /* Shared UI Empty State */
          <EmptyState
            icon="book-open"
            title="No subjects added yet"
            description="Create your subjects to organize your study materials, PYQs, and AI generated notes in one place."
            actionLabel="Add your first subject"
            actionVariant="quiz"
            onAction={handleAddSubject}
            className="mb-6"
          />
        ) : (
          <View className="mb-4">
            {displaySubjects.map((item) => (
              <SubjectCard
                key={item.id}
                id={item.id}
                name={item.name}
                course={item.course}
                colorHex={item.colorHex}
                bgHex={item.bgHex}
                iconName={item.iconName}
                metrics={item.metrics}
                onPress={() => handleSubjectPress(item.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
