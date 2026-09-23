import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { HeroBanner } from "@/components/ui/hero-banner";
import { Icon } from "@/components/ui/icon";
import { SearchInput } from "@/components/ui/search-input";
import { SectionHeader } from "@/components/ui/section-header";
import { SubjectSelectDropdown } from "@/components/ui/subject-select-dropdown";
import { Text } from "@/components/ui/text";
import { UploadActionCard } from "@/components/ui/upload-action-card";
import { APP_COLORS } from "@/constants/colors";
import { formatInputDate } from "@/lib/utils/formatters";
import * as React from "react";
import { Pressable, View } from "react-native";

export interface MaterialsHeaderProps {
  onUploadPress: () => void;
  totalMaterialsCount?: number;
  selectedSubjectId?: string;
  onSubjectChange?: (subjectId: string) => void;
  subjects?: Array<any>;
  selectedDate?: Date | null;
  onDateChange?: (date: Date | null) => void;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  onClearFilters?: () => void;
}

const BENEFITS = [
  {
    icon: "file-text",
    iconColor: APP_COLORS.emerald600,
    bgClass: "bg-emerald-50 dark:bg-emerald-950/40",
    title: "AI notes",
    desc: "Well structured & easy to follow",
  },
  {
    icon: "lightbulb",
    iconColor: APP_COLORS.warningDark,
    bgClass: "bg-warning-bg",
    title: "Key concepts",
    desc: "Focus on what matters",
  },
  {
    icon: "target",
    iconColor: APP_COLORS.brandPurple,
    bgClass: "bg-purple-50 dark:bg-purple-950/40",
    title: "Practice ready",
    desc: "Build confidence step by step",
  },
] as const;

const StaticHeroHeader = React.memo(function StaticHeroHeader() {
  return (
    <HeroBanner
      title={
        <Text variant="h1" className="tracking-tight leading-tight">
          Turn your material{"\n"}into a{" "}
          <Text variant="primary" className="text-3xl font-extrabold">
            study plan
          </Text>
        </Text>
      }
      subtitle="Upload your notes or PDFs and we'll turn them into clear AI notes + practice."
      imageSource={require("../../../assets/images/student-study-hero.png")}
      imageWidth={140}
      imageHeight={115}
    />
  );
});

const BenefitsRow = React.memo(function BenefitsRow() {
  return (
    <View className="flex-row items-center justify-between gap-2.5">
      {BENEFITS.map((benefit) => (
        <Card
          key={benefit.title}
          className="flex-1 p-3 items-start justify-start shadow-2xs"
        >
          <View
            className={`w-8 h-8 rounded-xl ${benefit.bgClass} items-center justify-center mb-2`}
          >
            <Icon
              name={benefit.icon as any}
              size={16}
              color={benefit.iconColor}
            />
          </View>
          <Text variant="subhead" className="font-extrabold">
            {benefit.title}
          </Text>
          <Text
            variant="muted"
            className="text-[10px] leading-3 mt-0.5"
            numberOfLines={2}
          >
            {benefit.desc}
          </Text>
        </Card>
      ))}
    </View>
  );
});

export const MaterialsHeader = React.memo(function MaterialsHeader({
  onUploadPress,
  totalMaterialsCount = 0,
  selectedSubjectId = "",
  onSubjectChange,
  subjects = [],
  selectedDate = null,
  onDateChange,
  searchQuery = "",
  onSearchChange,
  onClearFilters,
}: MaterialsHeaderProps) {
  const [showFilters, setShowFilters] = React.useState(false);
  const isSubjectActive = Boolean(selectedSubjectId);
  const isDateActive = Boolean(selectedDate);
  const isSearchActive = Boolean(searchQuery);
  const hasActiveFilters = isSubjectActive || isDateActive || isSearchActive;

  const selectedSubjectObj = React.useMemo(() => {
    if (!selectedSubjectId) return null;
    return subjects.find((s) => String(s.id) === String(selectedSubjectId));
  }, [subjects, selectedSubjectId]);

  const handleClearSubject = React.useCallback(() => {
    onSubjectChange?.("");
  }, [onSubjectChange]);

  const handleClearDate = React.useCallback(() => {
    onDateChange?.(null);
  }, [onDateChange]);

  return (
    <View className="mb-4 gap-4">
      <StaticHeroHeader />
      <UploadActionCard onPress={onUploadPress} />
      <BenefitsRow />

      <View className="pt-2 gap-3">
        <SectionHeader
          title="Your recent materials"
          actionLabel={hasActiveFilters ? "Clear filters" : undefined}
          onAction={hasActiveFilters ? onClearFilters : undefined}
        />

        {onSearchChange ? (
          <SearchInput
            placeholder="Search materials..."
            value={searchQuery}
            onChangeText={onSearchChange}
            onFilterPress={() => setShowFilters((prev) => !prev)}
            isFilterActive={showFilters || isSubjectActive || isDateActive}
          />
        ) : null}
      </View>

      {(showFilters || isSubjectActive || isDateActive) ? (
        <Card className="p-3 rounded-2xl gap-2.5">
          <View className="flex-row items-center gap-2">
            {onSubjectChange ? (
              <View className="flex-1">
                <SubjectSelectDropdown
                  value={selectedSubjectId}
                  onValueChange={onSubjectChange}
                  subjects={subjects}
                  showAllOption={true}
                  allOptionLabel="All Subjects"
                  placeholder="Filter by Subject..."
                  triggerClassName="h-11 px-3 rounded-xl text-xs bg-card border-border"
                />
              </View>
            ) : null}

            {onDateChange ? (
              <View className="flex-1">
                <DatePicker
                  value={selectedDate}
                  onChange={onDateChange}
                  placeholder="Filter by Date..."
                  clearable={true}
                />
              </View>
            ) : null}
          </View>

          {hasActiveFilters ? (
            <View className="flex-row items-center gap-1.5 flex-wrap pt-1 border-t border-border">
              <Text className="text-[11px] font-bold text-muted-foreground">
                Active:
              </Text>
              {isSubjectActive ? (
                <Pressable onPress={handleClearSubject}>
                  <Badge
                    label={`Subject: ${selectedSubjectObj?.name ?? selectedSubjectId}`}
                    variant="purple"
                    icon="x"
                    iconSize={10}
                  />
                </Pressable>
              ) : null}

              {isDateActive && selectedDate ? (
                <Pressable onPress={handleClearDate}>
                  <Badge
                    label={`Date: ${formatInputDate(selectedDate)}`}
                    variant="blue"
                    icon="x"
                    iconSize={10}
                  />
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </Card>
      ) : null}
    </View>
  );
});
