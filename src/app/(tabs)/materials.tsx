import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { MaterialCard, MaterialsHeader } from "@/components/materials";
import { AppHeaderBar } from "@/components/ui/app-header-bar";
import { AppScreen } from "@/components/ui/app-screen";
import { EmptyState } from "@/components/ui/empty-state";
import { InfiniteListFooter } from "@/components/ui/infinite-list-footer";
import { APP_COLORS } from "@/constants/colors";
import { useDeleteStudyMaterial, useStudyMaterialsInfinite } from "@/hooks";
import { useSubjectsQuery } from "@/hooks/queries/use-subjects";
import { showErrorToast } from "@/lib/utils/toast";
import { type StudyMaterial } from "@/services";
import { useRouter } from "expo-router";
import * as React from "react";
import { FlatList, RefreshControl, View } from "react-native";

export default function MaterialsScreen() {
  const router = useRouter();
  const confirm = useConfirmDialog();
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string>("");
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const {
    materials,
    isLoading,
    isFetchingNextPage,
    isRefreshing,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useStudyMaterialsInfinite({
    subjectId: selectedSubjectId,
    search: searchQuery,
  });

  const { subjects } = useSubjectsQuery();

  const deleteMaterialMutation = useDeleteStudyMaterial();

  const filteredMaterials = React.useMemo(() => {
    return materials.filter((m) => {
      if (selectedDate) {
        if (m.createdAt) {
          const itemDateStr = new Date(m.createdAt).toISOString().split("T")[0];
          const filterDateStr = selectedDate.toISOString().split("T")[0];
          if (itemDateStr !== filterDateStr) return false;
        }
      }

      return true;
    });
  }, [materials, selectedDate]);

  const handleClearFilters = React.useCallback(() => {
    setSelectedSubjectId("");
    setSelectedDate(null);
    setSearchQuery("");
  }, []);

  const handleOpenAddDialog = React.useCallback(() => {
    router.push("/materials/upload");
  }, [router]);

  const handleDeleteMaterial = React.useCallback(
    async (material: StudyMaterial) => {
      const confirmed = await confirm({
        title: "Delete Study Material",
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
            : "Unable to delete the study material right now.";
        showErrorToast("Delete Failed", message);
      }
    },
    [confirm, deleteMaterialMutation],
  );

  const keyExtractor = React.useCallback((item: StudyMaterial) => item.id, []);

  const ItemSeparator = React.useCallback(() => <View className="h-3.5" />, []);

  const renderItem = React.useCallback(
    ({ item }: { item: StudyMaterial }) => (
      <MaterialCard
        material={item}
        onDelete={handleDeleteMaterial}
        isDeleting={deleteMaterialMutation.isPending}
      />
    ),
    [handleDeleteMaterial, deleteMaterialMutation.isPending],
  );

  const headerElement = React.useMemo(
    () => (
      <MaterialsHeader
        onUploadPress={handleOpenAddDialog}
        totalMaterialsCount={materials.length}
        selectedSubjectId={selectedSubjectId}
        onSubjectChange={setSelectedSubjectId}
        subjects={subjects}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearFilters={handleClearFilters}
      />
    ),
    [
      handleOpenAddDialog,
      materials.length,
      selectedSubjectId,
      setSelectedSubjectId,
      subjects,
      selectedDate,
      setSelectedDate,
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
          totalLoaded={filteredMaterials.length}
          itemLabel="materials"
        />
      </View>
    ),
    [isFetchingNextPage, hasNextPage, filteredMaterials.length],
  );

  const hasActiveFilters = Boolean(selectedSubjectId || selectedDate);

  const emptyElement = React.useMemo(
    () =>
      !isLoading ? (
        <EmptyState
          icon="file-text"
          title={
            !hasActiveFilters
              ? "No Study Materials Yet"
              : "No Matching Materials"
          }
          description={
            !hasActiveFilters
              ? "Upload your first PDF or document to generate AI notes and practice quizzes automatically."
              : "No materials found matching your selected subject or date filters. Try clearing filters."
          }
          actionLabel={
            hasActiveFilters ? "Clear All Filters" : "Upload First Material +"
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
        tintColor={APP_COLORS.quizBlue}
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
        data={filteredMaterials}
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
