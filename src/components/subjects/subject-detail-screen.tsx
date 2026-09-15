import { AppScreen } from "@/components/ui/app-screen";
import { SwipeableTabView } from "@/components/ui/swipeable-tab-view";
import { Button } from "@/components/ui/button";
import { CommonHeader } from "@/components/ui/common-header";
import { EmptyState } from "@/components/ui/empty-state";
import { FeatureCard } from "@/components/ui/feature-card";
import { Icon } from "@/components/ui/icon";
import { ListItemCard } from "@/components/ui/list-item-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionHeader } from "@/components/ui/section-header";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { getSubjectTheme } from "@/constants/subject-themes";
import { useNotesInfiniteQuery } from "@/hooks/queries/use-notes";
import { useQuizzesInfiniteQuery } from "@/hooks/queries/use-quizzes";
import { useStudyMaterialsInfinite } from "@/hooks/queries/use-study-materials";
import { useSubjectsQuery } from "@/hooks/queries/use-subjects";
import { formatRelativeOrShortDate } from "@/lib/utils/formatters";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as React from "react";
import { View } from "react-native";
import { PRESET_THEMES } from "./create-subject-screen";
import { IdeasDoodle } from "./subject-doodles";

export interface SubjectDetailScreenProps {
  id?: string;
  onBack?: () => void;
}

export const SubjectDetailScreen = React.memo(function SubjectDetailScreen({
  id: propId,
  onBack,
}: SubjectDetailScreenProps) {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const subjectId = propId || params.id;

  const [activeTab, setActiveTab] = React.useState<
    "overview" | "materials" | "pyqs"
  >("overview");

  // Fetch real API data
  const { subjects, isLoading: isLoadingSubjects } = useSubjectsQuery();
  const { materials, isLoading: isLoadingMaterials } =
    useStudyMaterialsInfinite({ limit: 100 });
  const { notes } = useNotesInfiniteQuery({ limit: 100 });
  const { quizzes } = useQuizzesInfiniteQuery({ limit: 100 });

  const goBackToSubjects = React.useCallback(() => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/subjects");
    }
  }, [onBack, router]);

  // Find target subject
  const currentSubjectIndex = React.useMemo(() => {
    if (!subjects || !subjectId) return -1;
    return subjects.findIndex((s) => String(s.id) === String(subjectId));
  }, [subjects, subjectId]);

  const subject =
    currentSubjectIndex >= 0 ? subjects[currentSubjectIndex] : null;
  const sId = subject ? String(subject.id) : "";

  // Memoize filtered items to prevent re-filtering on every render
  const {
    subjectMaterials,
    subjectNotes,
    subjectQuizzes,
  } = React.useMemo(() => {
    if (!sId) {
      return {
        subjectMaterials: [],
        subjectNotes: [],
        subjectQuizzes: [],
      };
    }
    const filteredMaterials = materials.filter(
      (m) => String(m.subjectId) === sId || String(m.subject?.id) === sId,
    );
    const filteredNotes = notes.filter(
      (n) => String(n.subjectId) === sId || String(n.subject?.id) === sId,
    );
    const filteredQuizzes = quizzes.filter(
      (q) => String(q.subjectId) === sId || String(q.subject?.id) === sId,
    );

    return {
      subjectMaterials: filteredMaterials,
      subjectNotes: filteredNotes,
      subjectQuizzes: filteredQuizzes,
    };
  }, [materials, notes, quizzes, sId]);

  const handleUploadClick = React.useCallback(() => {
    router.push(`/materials/upload`);
  }, [router]);

  if (isLoadingSubjects && !subject) {
    return (
      <AppScreen
        edges={["top"]}
        header={
          <CommonHeader onBack={onBack} fallbackRoute="/(tabs)/subjects" />
        }
      >
        <View className="flex-1 justify-center items-center py-20">
          <Spinner
            variant="quiz"
            size="large"
            message="Loading subject details..."
          />
        </View>
      </AppScreen>
    );
  }

  if (!subject) {
    return (
      <AppScreen
        edges={["top"]}
        header={
          <CommonHeader onBack={onBack} fallbackRoute="/(tabs)/subjects" />
        }
      >
        <EmptyState
          icon="book-open"
          title="Subject not found"
          description="We couldn't find the subject details you were looking for."
          actionLabel="Back to Subjects"
          onAction={goBackToSubjects}
          className="mt-12"
        />
      </AppScreen>
    );
  }

  const presetTheme = getSubjectTheme(subject.name, currentSubjectIndex);

  const colorHex = presetTheme.colorHex;
  const bgHex = presetTheme.bgHex;
  const iconName = presetTheme.iconName as string;
  const course = subject.description || "General";

  return (
    <AppScreen
      edges={["top"]}
      header={<CommonHeader onBack={onBack} fallbackRoute="/(tabs)/subjects" />}
      contentContainerClassName="px-5 pt-4 pb-24"
    >
      {/* Top Title Row with Icon & Doodle */}
      <View className="flex-row items-start justify-between mb-5">
        <View className="flex-row items-center gap-3.5 flex-1">
          <View
            style={{ backgroundColor: bgHex }}
            className="w-14 h-14 rounded-2xl items-center justify-center border border-border shadow-xs"
          >
            <Icon name={iconName} size={28} color={colorHex} />
          </View>

          <View className="flex-1">
            <Text variant="h1" className="tracking-tight">
              {subject.name}
            </Text>
            <View className="bg-muted px-2.5 py-0.5 rounded-full self-start mt-1">
              <Text variant="subhead">{course}</Text>
            </View>
          </View>
        </View>

        <IdeasDoodle />
      </View>

      {/* Swipeable & Clickable Tab Navigation */}
      <SwipeableTabView<"overview" | "materials" | "pyqs">
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabBarClassName="mb-6"
        tabs={[
          { id: "overview", label: "Overview", icon: "grid" },
          {
            id: "materials",
            label: "Materials",
            icon: "file-text",
            badge: subjectMaterials.length > 0 ? subjectMaterials.length : undefined,
            badgeVariant: "blue",
          },
          {
            id: "pyqs",
            label: "PYQs & Quizzes",
            icon: "zap",
            badge: subjectQuizzes.length > 0 ? subjectQuizzes.length : undefined,
            badgeVariant: "purple",
          },
        ]}
      >
        {/* Tab 1: Overview */}
        <View className="px-1 gap-6">
          <View>
            <SectionHeader
              title="Recent materials"
              actionLabel="See all"
              onAction={() => router.push("/materials" as any)}
            />
            {isLoadingMaterials ? (
              <Spinner variant="quiz" size="small" containerStyle={{ marginVertical: 16 }} />
            ) : subjectMaterials.length === 0 ? (
              <EmptyState
                icon="file-text"
                title="No materials uploaded yet"
                description="Upload notes or past year papers to get started."
                actionLabel="Upload First Material"
                actionVariant="quiz"
                onAction={handleUploadClick}
              />
            ) : (
              <View className="gap-3">
                {subjectMaterials.slice(0, 3).map((mat) => (
                  <ListItemCard
                    key={mat.id}
                    title={mat.title}
                    subtitle={`${mat.status} • ${formatRelativeOrShortDate(mat.createdAt)}`}
                    iconName="file-text"
                    iconBgClass="bg-blue-50 dark:bg-blue-950/40"
                    iconColor={APP_COLORS.quizBlue}
                    onPress={() => router.push(`/materials` as any)}
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Tab 2: Materials */}
        <View className="px-1">
          <SectionHeader
            title="All Materials"
            actionLabel="Upload"
            onAction={handleUploadClick}
          />
          {isLoadingMaterials ? (
            <Spinner variant="quiz" size="small" containerStyle={{ marginVertical: 16 }} />
          ) : subjectMaterials.length === 0 ? (
            <EmptyState
              icon="file-text"
              title="No materials uploaded yet"
              description="No materials uploaded for this subject yet."
              actionLabel="Upload Material"
              actionVariant="quiz"
              onAction={handleUploadClick}
            />
          ) : (
            <View className="gap-3">
              {subjectMaterials.map((mat) => (
                <ListItemCard
                  key={mat.id}
                  title={mat.title}
                  subtitle={`${mat.status} • ${formatRelativeOrShortDate(mat.createdAt)}`}
                  iconName="file-text"
                  iconBgClass="bg-blue-50 dark:bg-blue-950/40"
                  iconColor={APP_COLORS.quizBlue}
                  onPress={() => router.push(`/materials` as any)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Tab 3: PYQs & Quizzes */}
        <View className="px-1">
          <SectionHeader
            title="Quizzes & PYQs"
            actionLabel="View All"
            onAction={() => router.push("/pyqs" as any)}
          />
          {subjectQuizzes.length === 0 ? (
            <EmptyState
              icon="help-circle"
              title="No quizzes created yet"
              description="No quizzes created for this subject yet. Upload materials to generate quizzes."
              actionLabel="Upload Material"
              actionVariant="quiz"
              onAction={handleUploadClick}
            />
          ) : (
            <View className="gap-3">
              {subjectQuizzes.map((quiz) => (
                <ListItemCard
                  key={quiz.id}
                  title={quiz.title}
                  subtitle={`${quiz.totalQuestions} Questions • ${quiz.difficultyLevel}`}
                  iconName="check-square"
                  iconBgClass="bg-blue-50 dark:bg-blue-950/40"
                  iconColor={APP_COLORS.quizBlue}
                  onPress={() => router.push(`/quizzes` as any)}
                />
              ))}
            </View>
          )}
        </View>
      </SwipeableTabView>

      {/* Your AI Study Tools Section */}
      <View className="mb-6 mt-6">
        <Text variant="h3" className="mb-3">
          Your AI study tools
        </Text>

        <View className="flex-row gap-3">
          <FeatureCard
            title="Generated Notes"
            countText={`${subjectNotes.length} created`}
            description="Clear, structured notes from your materials."
            iconName="file-text"
            iconBgClass="bg-primary/10 border border-primary/20"
            iconColor="primary"
          />

          <FeatureCard
            title="AI Quiz Generator"
            countText={`${subjectQuizzes.length} available`}
            description="Turn your materials into custom quizzes."
            iconName="help-circle"
            iconBgClass="bg-warning/10 border border-warning/20"
            iconColor="warning"
            badgeLabel="Active"
            badgeIconName="award"
          />
        </View>
      </View>

      {/* Primary Action Button at bottom */}
      <Button
        title="Upload material →"
        icon="upload-cloud"
        variant="quiz"
        className="rounded-full h-12 shadow-md mt-2"
        onPress={handleUploadClick}
      />
    </AppScreen>
  );
});
