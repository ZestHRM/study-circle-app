import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { ExamMaterialCard, ExamMaterialsHeader } from "@/components/exam-materials";
import { AppHeaderBar } from "@/components/ui/app-header-bar";
import { AppScreen } from "@/components/ui/app-screen";
import { EmptyState } from "@/components/ui/empty-state";
import { InfiniteListFooter } from "@/components/ui/infinite-list-footer";
import { APP_COLORS } from "@/constants/colors";
import { useDeleteExamMaterial, useExamMaterialsInfinite } from "@/hooks";
import { useSubjectsQuery } from "@/hooks/queries/use-subjects";
import { showErrorToast } from "@/lib/utils/toast";
import type { ExamMaterial, ExamMaterialCategory } from "@/services/exam-materials-service";
import { useRouter } from "expo-router";
import * as React from "react";
import { FlatList, RefreshControl, View } from "react-native";

export default function ExamMaterialsScreen() {
  const router = useRouter();
  const confirm = useConfirmDialog();
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string>("");
  const [selectedCategory, setSelectedCategory] = React.useState<ExamMaterialCategory>("ALL");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const {
    materials,
    isLoading,
    isFetchingNextPage,
    isRefreshing,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useExamMaterialsInfinite({
    category: selectedCategory,
    subjectId: selectedSubjectId,
    search: searchQuery,
  });

  const { subjects } = useSubjectsQuery();

  const deleteMaterialMutation = useDeleteExamMaterial();

  const handleClearFilters = React.useCallback(() => {
    setSelectedSubjectId("");
    setSelectedCategory("ALL");
    setSearchQuery("");
  }, []);

  const handleOpenAddDialog = React.useCallback(() => {
    router.push("/materials/upload" as any);
  }, [router]);

  const handleCardPress = React.useCallback(
    (material: ExamMaterial) => {
      // Navigate to material detail if available or open viewer
      router.push(`/materials/${material.id}` as any);
    },
    [router],
  );

  const handleDeleteMaterial = React.useCallback(
    async (material: ExamMaterial) => {
      const confirmed = await confirm({
        title: "Delete Exam Material",
        description: `Are you sure you want to delete "${material.title}"? This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
      });

      if (!confirmed) return;

      try {
        await deleteMaterialMutation.mutateAsync(material.id);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to delete the exam material right now.";
        showErrorToast("Delete Failed", message);
      }
    },
    [confirm, deleteMaterialMutation],
  );

  const keyExtractor = React.useCallback((item: ExamMaterial) => item.id, []);

  const ItemSeparator = React.useCallback(() => <View className="h-3.5" />, []);

  const renderItem = React.useCallback(
    ({ item }: { item: ExamMaterial }) => (
      <ExamMaterialCard
        material={item}
        onDelete={handleDeleteMaterial}
        onPress={handleCardPress}
        isDeleting={deleteMaterialMutation.isPending}
      />
    ),
    [handleDeleteMaterial, handleCardPress, deleteMaterialMutation.isPending],
  );

  const headerElement = React.useMemo(
    () => (
      <ExamMaterialsHeader
        onUploadPress={handleOpenAddDialog}
        totalMaterialsCount={materials.length}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedSubjectId={selectedSubjectId}
        onSubjectChange={setSelectedSubjectId}
        subjects={subjects}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearFilters={handleClearFilters}
      />
    ),
    [
      handleOpenAddDialog,
      materials.length,
      selectedCategory,
      setSelectedCategory,
      selectedSubjectId,
      setSelectedSubjectId,
      subjects,
      searchQuery,
      setSearchQuery,
      handleClearFilters,
    ],
  );

  const footerElement = React.useMemo(
    () => (
      <View className="mt-4 gap-4">
        <InfiniteListFooter
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          totalLoaded={materials.length}
          itemLabel="exam materials"
        />
      </View>
    ),
    [isFetchingNextPage, hasNextPage, materials.length],
  );

  const hasActiveFilters = Boolean(
    (selectedCategory && selectedCategory !== "ALL") || selectedSubjectId || searchQuery
  );

  const emptyElement = React.useMemo(
    () =>
      !isLoading ? (
        <EmptyState
          icon="file-check"
          title={
            !hasActiveFilters
              ? "No Exam Materials Yet"
              : "No Matching Exam Materials"
          }
          description={
            !hasActiveFilters
              ? "Upload previous year question papers (PYQs), mock test papers, or model answer keys."
              : "No exam materials match your selected filters. Try clearing your search or category."
          }
          actionLabel={
            hasActiveFilters ? "Clear All Filters" : "Upload First Exam Paper +"
          }
          actionVariant="quiz"
          onAction={hasActiveFilters ? handleClearFilters : handleOpenAddDialog}
          className="mt-4"
        />
      ) : null,
    [isLoading, hasActiveFilters, handleClearFilters, handleOpenAddDialog],
  );

  const refreshControlElement = React.useMemo(
    () => (
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={refetch}
        tintColor={APP_COLORS.primary}
      />
    ),
    [isRefreshing, refetch],
  );

  return (
    <AppScreen
      edges={["top"]}
      header={<AppHeaderBar logoPosition="left" />}
      scrollable={false}
    >
      <FlatList
        data={materials}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 8,
          paddingBottom: 40,
        }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={8}
        refreshControl={refreshControlElement}
        ListHeaderComponent={headerElement}
        ListFooterComponent={footerElement}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.4}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={emptyElement}
        renderItem={renderItem}
      />
    </AppScreen>
  );
}
