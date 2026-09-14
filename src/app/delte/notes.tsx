import { AddNoteDialog } from "@/components/add-note-dialog";
import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { NoteCard, NotesDetailBottomSheet } from "@/components/notes";
import { AppHeaderBar } from "@/components/ui/app-header-bar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { HeroBanner } from "@/components/ui/hero-banner";
import { Icon } from "@/components/ui/icon";
import { InfiniteListFooter } from "@/components/ui/infinite-list-footer";
import { Spinner } from "@/components/ui/spinner";
import { SubjectSelectDropdown } from "@/components/ui/subject-select-dropdown";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import {
  useCreateNote,
  useDeleteNote,
  useNotesInfiniteQuery,
  useStudyNotesQuery,
  useSubjectsQuery,
  useUpdateNote,
} from "@/hooks/queries";
import { type Note } from "@/services";
import { useFocusEffect } from "expo-router";
import * as React from "react";
import { Alert, FlatList, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PAGE_SIZE = 10;

export default function NotesScreen() {
  const confirm = useConfirmDialog();

  const [selectedSubjectId, setSelectedSubjectId] = React.useState("");
  const [showNoteDialog, setShowNoteDialog] = React.useState(false);
  const [editingNote, setEditingNote] = React.useState<Note | null>(null);
  const [detailsNote, setDetailsNote] = React.useState<Note | null>(null);

  // Auto-close dialogs and bottom sheets when navigating away from this tab
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setShowNoteDialog(false);
        setEditingNote(null);
        setDetailsNote(null);
      };
    }, []),
  );

  const {
    subjectOptions,
    isLoading: isLoadingSubjects,
  } = useSubjectsQuery();

  const {
    notes,
    isLoading: isLoadingNotes,
    isFetchingNextPage,
    isRefreshing,
    hasNextPage,
    fetchNextPage,
    refetch: refetchNotes,
  } = useNotesInfiniteQuery({
    limit: PAGE_SIZE,
    subjectId: selectedSubjectId,
  });

  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  const handleRefresh = React.useCallback(() => {
    refetchNotes();
  }, [refetchNotes]);

  const handleClearFilters = React.useCallback(() => {
    setSelectedSubjectId("");
  }, []);

  const handleStartCreateNote = React.useCallback(() => {
    setEditingNote(null);
    setShowNoteDialog(true);
  }, []);

  const handleStartEditNote = React.useCallback((note: Note) => {
    setEditingNote(note);
    setShowNoteDialog(true);
  }, []);

  const handleOpenNoteDetails = React.useCallback((note: Note) => {
    setDetailsNote(note);
  }, []);

  const handleCloseNoteDetails = React.useCallback(() => {
    setDetailsNote(null);
  }, []);

  const handleNoteDialogChange = React.useCallback((open: boolean) => {
    setShowNoteDialog(open);
    if (!open) {
      setEditingNote(null);
    }
  }, []);

  const handleDeleteNote = React.useCallback(
    async (note: Note) => {
      const confirmed = await confirm({
        title: "Delete Note",
        description: `Are you sure you want to delete this note? This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
      });

      if (!confirmed) return;

      try {
        await deleteNoteMutation.mutateAsync(note.id);
        Alert.alert("Success", "Note deleted successfully.");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to delete the note right now.";
        Alert.alert("Delete Failed", message);
      }
    },
    [confirm, deleteNoteMutation],
  );

  const handleSubmitNote = React.useCallback(
    async (payload: { content: string; subjectId: number }) => {
      if (editingNote?.id) {
        await updateNoteMutation.mutateAsync({
          id: editingNote.id,
          ...payload,
        });
        return;
      }
      await createNoteMutation.mutateAsync(payload);
    },
    [editingNote?.id, updateNoteMutation, createNoteMutation],
  );

  const isSubmitting =
    createNoteMutation.isPending || updateNoteMutation.isPending;

  const renderNoteItem = React.useCallback(
    ({ item }: { item: Note }) => (
      <NoteCard
        note={item}
        onOpenDetails={handleOpenNoteDetails}
        onEdit={handleStartEditNote}
        onDelete={handleDeleteNote}
        isSubmitting={isSubmitting}
        isDeleting={deleteNoteMutation.isPending}
      />
    ),
    [
      handleOpenNoteDetails,
      handleStartEditNote,
      handleDeleteNote,
      isSubmitting,
      deleteNoteMutation.isPending,
    ],
  );

  const keyExtractor = React.useCallback((item: Note) => item.id, []);

  const {
    data: singleNoteDetail,
    isLoading: isNoteDetailLoading,
    isError: isNoteDetailError,
    refetch: refetchNoteDetail,
  } = useStudyNotesQuery(detailsNote?.id);

  const listHeaderComponent = React.useMemo(
    () => (
      <View className="mb-3 gap-3">
        {/* Clean Hero Banner using preset="notes" */}
        <HeroBanner
          preset="notes"
          action={
            <Button
              title="Create custom note +"
              icon="plus"
              variant="quiz"
              className="rounded-full h-11 shadow-xs"
              onPress={handleStartCreateNote}
            />
          }
        />

        {/* Subject Select & Search Filter */}
        <View className="gap-2 pt-1">
          <View className="flex-row items-center justify-between">
            <Text variant="h3">Filter by Subject</Text>
            {selectedSubjectId ? (
              <Button
                variant="outline"
                onPress={handleClearFilters}
                className="rounded-full px-3 h-8 flex-row items-center gap-1 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800"
              >
                <Icon name="x-circle" size={12} color={APP_COLORS.stone500} />
                <Text className="text-xs">Clear Filter</Text>
              </Button>
            ) : null}
          </View>

          <SubjectSelectDropdown
            value={selectedSubjectId}
            onValueChange={setSelectedSubjectId}
            subjects={subjectOptions}
            isLoading={isLoadingSubjects}
            placeholder="All Subjects (Select to Filter)"
            triggerClassName="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 rounded-2xl h-12 shadow-xs"
          />
        </View>
      </View>
    ),
    [
      handleStartCreateNote,
      selectedSubjectId,
      handleClearFilters,
      subjectOptions,
      isLoadingSubjects,
    ],
  );

  const listEmptyComponent = React.useMemo(
    () =>
      isLoadingNotes ? (
        <View className="py-12">
          <Spinner
            variant="quiz"
            size="large"
            message="Loading study notes..."
          />
        </View>
      ) : (
        <EmptyState
          icon="book-open"
          title={
            selectedSubjectId
              ? "No Notes for Selected Subject"
              : "No AI Notes Found"
          }
          description={
            selectedSubjectId
              ? "No notes found for this subject. Try selecting a different subject or clear filter."
              : "Upload study materials or create your first custom note to start tracking key formulas & summaries."
          }
          actionLabel={
            selectedSubjectId ? "Clear Filter" : "Create First Note +"
          }
          actionVariant="quiz"
          onAction={
            selectedSubjectId ? handleClearFilters : handleStartCreateNote
          }
          className="mt-4"
        />
      ),
    [isLoadingNotes, selectedSubjectId, handleClearFilters, handleStartCreateNote],
  );

  const listFooterComponent = React.useMemo(
    () => (
      <InfiniteListFooter
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        totalLoaded={notes.length}
        itemLabel="notes"
      />
    ),
    [isFetchingNextPage, hasNextPage, notes.length],
  );

  const refreshControlComponent = React.useMemo(
    () => (
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        tintColor={APP_COLORS.quizBlue}
      />
    ),
    [isRefreshing, handleRefresh],
  );

  return (
    <SafeAreaView
      className="bg-[#FAF8F5] dark:bg-stone-950 flex-1"
      edges={["top"]}
    >
      {/* Shared Common Header Bar */}
      <AppHeaderBar logoPosition="left" />
      <FlatList
        data={notes}
        keyExtractor={keyExtractor}
        renderItem={renderNoteItem}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 8,
          paddingBottom: 36,
          gap: 14,
        }}
        refreshControl={refreshControlComponent}
        ListHeaderComponent={listHeaderComponent}
        ListEmptyComponent={listEmptyComponent}
        ListFooterComponent={listFooterComponent}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.2}
      />

      {/* Add / Edit Note Form Dialog */}
      <AddNoteDialog
        key={editingNote?.id ?? "create"}
        open={showNoteDialog}
        onOpenChange={handleNoteDialogChange}
        editingNote={editingNote}
        onSubmit={handleSubmitNote}
        submitting={isSubmitting}
      />

      {/* Reusable Notes Detail Reader Bottom Sheet */}
      <NotesDetailBottomSheet
        open={Boolean(detailsNote)}
        onClose={handleCloseNoteDetails}
        title={
          singleNoteDetail?.studyMaterial?.title || detailsNote?.subject?.name
            ? `${detailsNote?.subject?.name} Notes`
            : "Note Details"
        }
        subjectName={
          singleNoteDetail?.subject?.name ||
          detailsNote?.subject?.name ||
          "General"
        }
        createdAt={singleNoteDetail?.createdAt || detailsNote?.createdAt}
        content={singleNoteDetail?.content || detailsNote?.content}
        isLoading={isNoteDetailLoading}
        isError={isNoteDetailError}
        onRetry={refetchNoteDetail}
      />
    </SafeAreaView>
  );
}
