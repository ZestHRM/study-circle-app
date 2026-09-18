import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import type { ExamMaterialCategory } from "@/services/exam-materials-service";
import type { Subject } from "@/services/subjects-service";
import * as React from "react";
import { Pressable, ScrollView, View } from "react-native";

export interface ExamMaterialsHeaderProps {
  onUploadPress: () => void;
  totalMaterialsCount: number;
  selectedCategory: ExamMaterialCategory;
  onCategoryChange: (category: ExamMaterialCategory) => void;
  selectedSubjectId: string;
  onSubjectChange: (subjectId: string) => void;
  subjects: Subject[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}

const CATEGORIES: { label: string; value: ExamMaterialCategory; icon: string }[] = [
  { label: "All Papers", value: "ALL", icon: "layers" },
  { label: "PYQs", value: "PYQ", icon: "file-check" },
  { label: "Mock Tests", value: "MOCK_TEST", icon: "file-text" },
  { label: "Model Papers", value: "MODEL_PAPER", icon: "book-open" },
  { label: "Revision Sheets", value: "REVISION_SHEET", icon: "award" },
  { label: "Syllabus", value: "SYLLABUS", icon: "list" },
];

export const ExamMaterialsHeader = React.memo(function ExamMaterialsHeader({
  onUploadPress,
  totalMaterialsCount,
  selectedCategory,
  onCategoryChange,
  selectedSubjectId,
  onSubjectChange,
  subjects,
  searchQuery,
  onSearchChange,
  onClearFilters,
}: ExamMaterialsHeaderProps) {
  const hasActiveFilters = Boolean(
    (selectedCategory && selectedCategory !== "ALL") || selectedSubjectId || searchQuery
  );

  return (
    <View className="gap-3.5 mb-4">
      {/* Top Banner & Header */}
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text variant="h2" className="text-xl font-bold text-foreground">
              Exam Materials
            </Text>
            <View className="px-2 py-0.5 rounded-full bg-primary/10">
              <Text className="text-xs font-semibold text-primary">
                {totalMaterialsCount}
              </Text>
            </View>
          </View>
          <Text variant="muted" className="text-xs text-muted-foreground mt-0.5">
            Previous year papers, mock tests & exam prep guides
          </Text>
        </View>

        <Button
          variant="default"
          size="sm"
          onPress={onUploadPress}
          className="bg-primary flex-row items-center gap-1.5 px-3 py-2 rounded-xl"
        >
          <Icon name="plus" size={15} color="#FFFFFF" />
          <Text className="text-xs font-bold text-white">Upload +</Text>
        </Button>
      </View>

      {/* Search Input */}
      <View className="relative flex-row items-center">
        <Input
          placeholder="Search PYQ, mock paper, or exam note..."
          value={searchQuery}
          onChangeText={onSearchChange}
          className="pl-9 pr-9 py-2 text-sm bg-stone-50 dark:bg-stone-900 border-border rounded-xl"
        />
        <View className="absolute left-3">
          <Icon name="search" size={16} color={APP_COLORS.stone400} />
        </View>
        {searchQuery ? (
          <Pressable
            onPress={() => onSearchChange("")}
            className="absolute right-3 p-1 active:opacity-70"
          >
            <Icon name="x" size={16} color={APP_COLORS.stone400} />
          </Pressable>
        ) : null}
      </View>

      {/* Exam Category Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 4 }}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.value;
          return (
            <Pressable
              key={cat.value}
              onPress={() => onCategoryChange(cat.value)}
              className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                isSelected
                  ? "bg-primary border-primary"
                  : "bg-stone-100 dark:bg-stone-800 border-transparent"
              }`}
            >
              <Icon
                name={cat.icon as any}
                size={14}
                color={isSelected ? "#FFFFFF" : APP_COLORS.stone400}
              />
              <Text
                className={`text-xs font-semibold ${
                  isSelected ? "text-white" : "text-stone-700 dark:text-stone-300"
                }`}
              >
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Subject Filter Pills */}
      {subjects.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6, paddingRight: 4 }}
        >
          <Pressable
            onPress={() => onSubjectChange("")}
            className={`px-2.5 py-1 rounded-lg border ${
              !selectedSubjectId
                ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900"
                : "bg-transparent border-border"
            }`}
          >
            <Text
              className={`text-[11px] font-medium ${
                !selectedSubjectId ? "text-primary font-bold" : "text-muted-foreground"
              }`}
            >
              All Subjects
            </Text>
          </Pressable>

          {subjects.map((subj) => {
            const subjIdStr = String(subj.id);
            const isSelected = selectedSubjectId === subjIdStr;
            return (
              <Pressable
                key={subjIdStr}
                onPress={() => onSubjectChange(isSelected ? "" : subjIdStr)}
                className={`px-2.5 py-1 rounded-lg border ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900"
                    : "bg-transparent border-border"
                }`}
              >
                <Text
                  className={`text-[11px] font-medium ${
                    isSelected ? "text-primary font-bold" : "text-muted-foreground"
                  }`}
                >
                  {subj.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {/* Active Filter Clear Bar */}
      {hasActiveFilters ? (
        <View className="flex-row items-center justify-between pt-1">
          <Text variant="muted" className="text-xs">
            Showing filtered results
          </Text>
          <Pressable onPress={onClearFilters} className="active:opacity-70">
            <Text className="text-xs font-semibold text-primary">
              Clear Filters
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
});
