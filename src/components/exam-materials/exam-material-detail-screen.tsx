import { AppScreen } from "@/components/ui/app-screen";
import { Spinner } from "@/components/ui/spinner";
import { SwipeableTabView } from "@/components/ui/swipeable-tab-view";
import { useExamMaterialDetail } from "@/hooks/queries/use-exam-materials";
import { useThemePreference } from "@/lib/theme-preference";
import { useRouter } from "expo-router";
import * as React from "react";
import { StatusBar, View } from "react-native";
import { DetailHeader } from "../materials/detail/detail-header";
import { ImportantTopicsTab } from "./important-topics-tab";
import { QuestionsTab } from "./questions-tab";

export type ExamMaterialDetailScreenProps = {
  materialId: string;
};

export type ExamMaterialTabType = "topics" | "questions";

export function ExamMaterialDetailScreen({
  materialId,
}: ExamMaterialDetailScreenProps) {
  const router = useRouter();
  const { isDark } = useThemePreference();
  const [activeTab, setActiveTab] =
    React.useState<ExamMaterialTabType>("topics");

  const { data: material, isLoading } = useExamMaterialDetail(materialId);

  const handleBack = React.useCallback(() => router.back(), [router]);

  const title = material?.title ?? "Exam Material";
  const questionsList = material?.questions ?? [];

  const headerElement = React.useMemo(
    () => <DetailHeader title={title} onBack={handleBack} />,
    [title, handleBack],
  );

  if (isLoading) {
    return (
      <AppScreen
        edges={["top"]}
        header={<DetailHeader title="Loading..." onBack={handleBack} />}
        scrollable={false}
      >
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <View className="flex-1 items-center justify-center">
          <Spinner
            variant="primary"
            size="large"
            message="Loading exam material..."
            center
          />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen edges={["top"]} header={headerElement} scrollable={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <SwipeableTabView<ExamMaterialTabType>
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dynamicHeight={false}
        tabs={[
          { id: "topics", label: "Important Topics", icon: "zap" },
          { id: "questions", label: "Questions", icon: "help-circle" },
        ]}
      >
        <ImportantTopicsTab
          examPaperId={material?.id}
          subjectId={material?.subjectId}
          materialTitle={title}
        />
        <QuestionsTab questions={questionsList} materialTitle={title} />
      </SwipeableTabView>
    </AppScreen>
  );
}
