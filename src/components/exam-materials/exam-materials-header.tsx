import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { HeroBanner } from "@/components/ui/hero-banner";
import { SearchInput } from "@/components/ui/search-input";
import { SectionHeader } from "@/components/ui/section-header";
import { SubjectSelectDropdown } from "@/components/ui/subject-select-dropdown";
import { Text } from "@/components/ui/text";
import { UploadActionCard } from "@/components/ui/upload-action-card";
import type { ExamMaterialCategory } from "@/services/exam-materials-service";
import type { Subject } from "@/services/subjects-service";
import * as React from "react";
import { Pressable, View } from "react-native";
export interface ExamMaterialsHeaderProps {
  onUploadPress: () => void;
  totalMaterialsCount?: number;
  selectedCategory?: ExamMaterialCategory;
  selectedSubjectId: string;
  onSubjectChange: (subjectId: string) => void;
  subjects: Subject[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}

const StaticHeroHeader = React.memo(function StaticHeroHeader() {
  return (
    <HeroBanner
      title={
        <Text variant="h1" className="tracking-tight leading-tight">
          Exam Materials
        </Text>
      }
      subtitle="Upload your exam papers and let AI find the important topics for you."
      imageSource={require("../../../assets/images/student-study-hero.png")}
      imageWidth={140}
      imageHeight={115}
    />
  );
});

export const ExamMaterialsHeader = React.memo(function ExamMaterialsHeader({
  onUploadPress,
  selectedCategory,
  selectedSubjectId,
  onSubjectChange,
  subjects,
  searchQuery,
  onSearchChange,
  onClearFilters,
}: ExamMaterialsHeaderProps) {
  const [showFilters, setShowFilters] = React.useState(false);

  const isSubjectActive = Boolean(selectedSubjectId);
  const isCategoryActive = Boolean(
    selectedCategory && selectedCategory !== "ALL",
  );
  const isSearchActive = Boolean(searchQuery);
  const hasActiveFilters =
    isSubjectActive || isCategoryActive || isSearchActive;

  const selectedSubjectObj = React.useMemo(() => {
    if (!selectedSubjectId) return null;
    return subjects.find((s) => String(s.id) === String(selectedSubjectId));
  }, [subjects, selectedSubjectId]);

  const handleClearSubject = React.useCallback(() => {
    onSubjectChange("");
  }, [onSubjectChange]);

  return (
    <View className="mb-4 gap-4">
      <StaticHeroHeader />
      <UploadActionCard
        title="Upload exam paper"
        subtitle="Upload PYQs, mock test PDFs or question sheets"
        onPress={onUploadPress}
      />

      <View className="pt-2 gap-3">
        <SectionHeader
          title="All Exam Papers & PYQs"
          actionLabel={hasActiveFilters ? "Clear filters" : undefined}
          onAction={hasActiveFilters ? onClearFilters : undefined}
        />

        <SearchInput
          placeholder="Search exam materials..."
          value={searchQuery}
          onChangeText={onSearchChange}
          onFilterPress={() => setShowFilters((prev) => !prev)}
          isFilterActive={showFilters || isSubjectActive}
        />
      </View>

      {(showFilters || isSubjectActive) && subjects.length > 0 ? (
        <Card className="p-3 rounded-2xl gap-2.5">
          <SubjectSelectDropdown
            value={selectedSubjectId}
            onValueChange={onSubjectChange}
            subjects={subjects}
            showAllOption={true}
            allOptionLabel="All Subjects"
            placeholder="Filter by Subject..."
            triggerClassName="h-11 px-3 rounded-xl text-xs bg-card border-border"
          />

          {isSubjectActive ? (
            <View className="flex-row items-center gap-1.5 flex-wrap pt-1 border-t border-border">
              <Text className="text-[11px] font-bold text-muted-foreground">
                Active:
              </Text>
              <Pressable onPress={handleClearSubject}>
                <Badge
                  label={`Subject: ${selectedSubjectObj?.name ?? selectedSubjectId}`}
                  variant="purple"
                  icon="x"
                  iconSize={10}
                />
              </Pressable>
            </View>
          ) : null}
        </Card>
      ) : null}
    </View>
  );
});
