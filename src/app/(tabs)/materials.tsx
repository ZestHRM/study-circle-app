import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { MaterialCard, MaterialsHeader } from "@/components/materials";
import { NotesDetailBottomSheet } from "@/components/notes";
import { APP_COLORS } from "@/constants/colors";
import {
  useDeleteStudyMaterial,
  useStudyMaterialDetail,
  useStudyMaterialNotesQuery,
  useStudyMaterialsInfinite,
} from "@/hooks/queries";
import { type StudyMaterial } from "@/services";
import { useFocusEffect, useRouter } from "expo-router";
import * as React from "react";
import { Alert, FlatList, RefreshControl, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/ui/empty-state";
import { InfiniteListFooter } from "@/components/ui/infinite-list-footer";

export default function MaterialsScreen() {
  const router = useRouter();
  const confirm = useConfirmDialog();
  const [selectedNoteMaterial, setSelectedNoteMaterial] =
    React.useState<StudyMaterial | null>(null);

  // Auto-close bottom sheets when navigating away from this tab
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setSelectedNoteMaterial(null);
      };
    }, []),
  );

  const { data: singleMaterialDetail } = useStudyMaterialDetail(
    selectedNoteMaterial?.id,
  );

  const activeMaterial = singleMaterialDetail || selectedNoteMaterial;

  const {
    data: fetchedNotes,
    isLoading: isNotesLoading,
    isError: isNotesError,
    refetch: refetchNotes,
  } = useStudyMaterialNotesQuery(activeMaterial);

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

  const handleReadNotes = React.useCallback((material: StudyMaterial) => {
    setSelectedNoteMaterial(material);
  }, []);

  const handleTakeQuiz = React.useCallback(
    (_material: StudyMaterial) => {
      router.push("/(tabs)/quizzes");
    },
    [router],
  );

  const handleCloseNotesModal = React.useCallback(() => {
    setSelectedNoteMaterial(null);
  }, []);

  const handleNotesModalTakeQuiz = React.useCallback(() => {
    setSelectedNoteMaterial(null);
    router.push("/(tabs)/quizzes");
  }, [router]);

  const keyExtractor = React.useCallback((item: StudyMaterial) => item.id, []);

  const ItemSeparator = React.useCallback(() => <View className="h-3" />, []);

  const getItemLayout = React.useCallback(
    (_data: ArrayLike<StudyMaterial> | null | undefined, index: number) => ({
      length: 168,
      offset: 168 * index,
      index,
    }),
    [],
  );

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

  const noteTitle = React.useMemo(
    () =>
      fetchedNotes?.title || activeMaterial?.title || "Study Material Notes",
    [fetchedNotes?.title, activeMaterial?.title],
  );

  const noteSubjectName = React.useMemo(
    () =>
      fetchedNotes?.subjectName ?? activeMaterial?.subject?.name ?? "General",
    [fetchedNotes?.subjectName, activeMaterial?.subject?.name],
  );

  const noteCreatedAt = React.useMemo(
    () => fetchedNotes?.createdAt || activeMaterial?.createdAt,
    [fetchedNotes?.createdAt, activeMaterial?.createdAt],
  );

  const noteContent = React.useMemo(
    () => fetchedNotes?.content || activeMaterial?.processedNotes,
    [fetchedNotes?.content, activeMaterial?.processedNotes],
  );

  const notePdfUrl = React.useMemo(
    () => activeMaterial?.files?.[0]?.url,
    [activeMaterial?.files],
  );

  const isSelectedMaterialQuizReady = React.useMemo(
    () =>
      Boolean(
        activeMaterial?.quizId ||
        (activeMaterial?.quizzes && activeMaterial.quizzes.length > 0) ||
        activeMaterial?.quizStatus === "GENERATED" ||
        activeMaterial?.files?.some((f) => f.quizStatus === "GENERATED"),
      ),
    [activeMaterial],
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#ffffff" }}
      className="bg-white dark:bg-stone-950 flex-1"
      edges={["top"]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
        translucent={false}
      />
      <FlatList
        data={materials}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 12,
          paddingBottom: 32,
        }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={8}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            tintColor={APP_COLORS.terracotta}
          />
        }
        ListHeaderComponent={
          <MaterialsHeader onUploadPress={handleOpenAddDialog} />
        }
        ListFooterComponent={
          <InfiniteListFooter
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            totalLoaded={materials.length}
            itemLabel="materials"
          />
        }
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.4}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="file-text"
              title="No Study Materials Found"
              description="Upload your first PDF or document to generate AI notes and practice quizzes automatically."
              actionLabel="Upload First Material"
              onAction={handleOpenAddDialog}
            />
          ) : null
        }
        renderItem={renderItem}
      />

      {/* Reusable Notes Detail Bottom Sheet */}
      <NotesDetailBottomSheet
        open={Boolean(selectedNoteMaterial)}
        onClose={handleCloseNotesModal}
        title={noteTitle}
        subjectName={noteSubjectName}
        createdAt={noteCreatedAt}
        content={noteContent}
        pdfUrl={notePdfUrl}
        isLoading={isNotesLoading}
        isError={isNotesError}
        isQuizReady={isSelectedMaterialQuizReady}
        onRetry={refetchNotes}
        onTakeQuiz={handleNotesModalTakeQuiz}
      />
    </SafeAreaView>
  );
}
