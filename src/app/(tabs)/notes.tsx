import { AddNoteDialog } from "@/components/add-note-dialog";
import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { NoteCard, NotesDetailBottomSheet } from "@/components/notes";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { InfiniteListFooter } from "@/components/ui/infinite-list-footer";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Spinner } from "@/components/ui/spinner";
import { SubjectSelectDropdown } from "@/components/ui/subject-select-dropdown";
import { Text } from "@/components/ui/text";
import {
  useCreateNote,
  useDeleteNote,
  useNotesInfiniteQuery,
  useStudyNotesQuery,
  useSubjectsQuery,
  useUpdateNote,
} from "@/hooks/queries";
import { APP_COLORS } from "@/constants/colors";
import { type Note } from "@/services";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import * as React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PAGE_SIZE = 8;

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
    }, [])
  );

  const {
    subjects,
    subjectOptions,
    isLoading: isLoadingSubjects,
  } = useSubjectsQuery();

  const selectedSubjectOption = React.useMemo(
    () =>
      subjectOptions.find((opt) => opt?.value === selectedSubjectId) ?? null,
    [subjectOptions, selectedSubjectId],
  );

  const {
    notes,
    totalItems,
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

  return (
    <SafeAreaView
      className="bg-[#FAF8F5] dark:bg-stone-950 flex-1"
      edges={["top"]}
    >
      <FlatList
        data={notes}
        keyExtractor={keyExtractor}
        renderItem={renderNoteItem}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 36,
          gap: 12,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={APP_COLORS.terracotta}
          />
        }
        ListHeaderComponent={
          <ScreenHeader
            title="Study Notes"
            subtitle="Organize, read & manage your AI notes"
            actionLabel="Add Note"
            actionIcon="plus"
            onAction={handleStartCreateNote}
          >
            {/* Subject Filter Select Dropdown */}
            <View className="flex-row items-center gap-2 pt-1">
              <View className="flex-1">
                <SubjectSelectDropdown
                  value={selectedSubjectId}
                  onValueChange={setSelectedSubjectId}
                  subjects={subjectOptions}
                  isLoading={isLoadingSubjects}
                  placeholder="Filter by Subject (All Subjects)"
                  triggerClassName="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 rounded-xl"
                />
              </View>

              {selectedSubjectId ? (
                <Button
                  variant="outline"
                  onPress={handleClearFilters}
                  className="rounded-xl px-3 py-2.5 flex-row items-center gap-1 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800"
                >
                  <Feather name="x-circle" size={14} color={APP_COLORS.stone500} />
                  <Text className="text-xs">Clear</Text>
                </Button>
              ) : null}
            </View>
          </ScreenHeader>
        }
        ListEmptyComponent={
          isLoadingNotes ? (
            <View className="py-12">
              <Spinner
                variant="terracotta"
                size="large"
                message="Loading notes..."
              />
            </View>
          ) : (
            <EmptyState
              icon="book-open"
              title={
                selectedSubjectId
                  ? "No Notes for Selected Subject"
                  : "No Notes Found"
              }
              description={
                selectedSubjectId
                  ? "No notes found for this subject. Try selecting a different subject or clear filter."
                  : "Add your first note to start tracking key ideas, formulas and summaries."
              }
              actionLabel={
                selectedSubjectId ? "Clear Filter" : "Add First Note"
              }
              onAction={
                selectedSubjectId ? handleClearFilters : handleStartCreateNote
              }
            />
          )
        }
        ListFooterComponent={
          <InfiniteListFooter
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            totalLoaded={notes.length}
            itemLabel="notes"
          />
        }
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.2}
      />

      {/* Add / Edit Note Form Dialog */}
      <AddNoteDialog
        key={editingNote?.id ?? "create"}
        open={showNoteDialog}
        onOpenChange={(open) => {
          setShowNoteDialog(open);
          if (!open) {
            setEditingNote(null);
          }
        }}
        editingNote={editingNote}
        onSubmit={handleSubmitNote}
        submitting={isSubmitting}
      />

      {/* Reusable Notes Detail Reader Bottom Sheet */}
      <NotesDetailBottomSheet
        open={Boolean(detailsNote)}
        onClose={() => setDetailsNote(null)}
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
