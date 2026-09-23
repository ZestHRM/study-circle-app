import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Text } from "@/components/ui/text";
import type { ExamMaterialCategory } from "@/services/exam-materials-service";
import type { Subject } from "@/services/subjects-service";
import * as React from "react";
import { Pressable, ScrollView, View } from "react-native";
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

export const ExamMaterialsHeader = React.memo(function ExamMaterialsHeader({
  onUploadPress,
  totalMaterialsCount = 0,
  selectedCategory,
  selectedSubjectId,
  onSubjectChange,
  subjects,
  searchQuery,
  onSearchChange,
  onClearFilters,
}: ExamMaterialsHeaderProps) {
  const hasActiveFilters = Boolean(
    (selectedCategory && selectedCategory !== "ALL") ||
    selectedSubjectId ||
    searchQuery,
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
          </View>
          <Text
            variant="muted"
            className="text-xs text-muted-foreground mt-0.5"
          >
            Previous year papers, mock tests & exam prep guides
          </Text>
        </View>

        <Button
          variant="default"
          size="sm"
          title="Upload +"
          icon="plus"
          iconSize={15}
          onPress={onUploadPress}
        />
      </View>

      {/* Search Input */}
      <SearchInput
        placeholder="Search PYQ, mock paper, or exam note..."
        value={searchQuery}
        onChangeText={onSearchChange}
      />

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
                ? "bg-primary/10 border-primary/30"
                : "bg-transparent border-border"
            }`}
          >
            <Text
              className={`text-[11px] font-medium ${
                !selectedSubjectId
                  ? "text-primary font-bold"
                  : "text-muted-foreground"
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
                    ? "bg-primary/10 border-primary/30"
                    : "bg-transparent border-border"
                }`}
              >
                <Text
                  className={`text-[11px] font-medium ${
                    isSelected
                      ? "text-primary font-bold"
                      : "text-muted-foreground"
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
