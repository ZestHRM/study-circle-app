import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import {
  MaterialCard,
  MaterialFilterType,
  MaterialsHeader,
  isNotesReady,
  isQuizReady,
} from "@/components/materials";
import { AppHeaderBar } from "@/components/ui/app-header-bar";
import { AppScreen } from "@/components/ui/app-screen";
import { EmptyState } from "@/components/ui/empty-state";
import { InfiniteListFooter } from "@/components/ui/infinite-list-footer";
import { APP_COLORS } from "@/constants/colors";
import { useDeleteStudyMaterial, useStudyMaterialsInfinite } from "@/hooks";
import { type StudyMaterial } from "@/services";
import { useRouter } from "expo-router";
import * as React from "react";
import { Alert, FlatList, RefreshControl, View } from "react-native";

export default function MaterialsScreen() {
  const router = useRouter();
  const confirm = useConfirmDialog();
  const [activeFilter, setActiveFilter] =
    React.useState<MaterialFilterType>("all");

  const {
    materials,
    isLoading,
    isFetchingNextPage,
    isRefreshing,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useStudyMaterialsInfinite();

  const deleteMaterialMutation = useDeleteStudyMaterial();

  const filteredMaterials = React.useMemo(() => {
    if (activeFilter === "notes_ready") {
      return materials.filter((m) => isNotesReady(m));
    }
    if (activeFilter === "quiz_ready") {
      return materials.filter((m) => isQuizReady(m));
    }
    if (activeFilter === "processing") {
      return materials.filter((m) => !isNotesReady(m));
    }
    return materials;
  }, [materials, activeFilter]);

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
        Alert.alert("Delete Failed", message);
      }
    },
    [confirm, deleteMaterialMutation],
  );

  const handleReadNotes = React.useCallback(
    (material: StudyMaterial) => {
      router.push(`/materials/${material.id}` as any);
    },
    [router],
  );

  const handleTakeQuiz = React.useCallback(
    (material: StudyMaterial) => {
      router.push(`/materials/${material.id}` as any);
    },
    [router],
  );

  const keyExtractor = React.useCallback((item: StudyMaterial) => item.id, []);

  const ItemSeparator = React.useCallback(() => <View className="h-3.5" />, []);

  const renderItem = React.useCallback(
    ({ item }: { item: StudyMaterial }) => (
      <MaterialCard
        material={item}
        onReadNotes={handleReadNotes}
        onTakeQuiz={handleTakeQuiz}
        onDelete={handleDeleteMaterial}
        isDeleting={deleteMaterialMutation.isPending}
      />
    ),
    [
      handleReadNotes,
      handleTakeQuiz,
      handleDeleteMaterial,
      deleteMaterialMutation.isPending,
    ],
  );

  const headerElement = React.useMemo(
    () => (
      <MaterialsHeader
        onUploadPress={handleOpenAddDialog}
        onPasteTextPress={handleOpenAddDialog}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        totalMaterialsCount={materials.length}
      />
    ),
    [handleOpenAddDialog, activeFilter, setActiveFilter, materials.length],
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

  const emptyElement = React.useMemo(
    () =>
      !isLoading ? (
        <EmptyState
          icon="file-text"
          title={
            activeFilter === "all"
              ? "No Study Materials Yet"
              : "No Matching Materials"
          }
          description={
            activeFilter === "all"
              ? "Upload your first PDF or document to generate AI notes and practice quizzes automatically."
              : `No materials found under '${activeFilter.replace("_", " ")}'. Try switching filters or uploading a new file.`
          }
          actionLabel="Upload First Material +"
          actionVariant="quiz"
          onAction={handleOpenAddDialog}
          className="mt-4"
        />
      ) : null,
    [isLoading, activeFilter, handleOpenAddDialog],
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
