import { AddMaterialDialog } from "@/components/add-material-dialog";
import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { MaterialCard } from "@/components/materials/material-card";
import { MaterialsHeader } from "@/components/materials/materials-header";
import { HtmlNotesView } from "@/components/notes/html-notes-view";
import {
  AppBottomSheet,
  AppBottomSheetScrollView,
} from "@/components/ui/app-bottom-sheet";
import { Text } from "@/components/ui/text";
import {
  useCreateStudyMaterial,
  useDeleteStudyMaterial,
  useStudyMaterialNotesQuery,
  useStudyMaterialsInfinite,
} from "@/hooks/queries";
import { type StudyMaterial } from "@/services";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatShortDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown date";
  }

  return parsedDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MaterialsScreen() {
  const router = useRouter();
  const confirm = useConfirmDialog();
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [selectedNoteMaterial, setSelectedNoteMaterial] =
    React.useState<StudyMaterial | null>(null);

  const {
    data: fetchedNotes,
    isLoading: isNotesLoading,
    isError: isNotesError,
    refetch: refetchNotes,
  } = useStudyMaterialNotesQuery(selectedNoteMaterial);

  const {
    materials,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isRefreshing,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useStudyMaterialsInfinite();

  const createMaterialMutation = useCreateStudyMaterial();
  const deleteMaterialMutation = useDeleteStudyMaterial();

  const handleOpenAddDialog = React.useCallback(() => {
    console.log('[MaterialsScreen] handleOpenAddDialog called, setting showAddDialog=true');
    setShowAddDialog(true);
  }, []);

  async function onDeleteMaterial(material: StudyMaterial) {
    const confirmed = await confirm({
      title: "Delete Study Material",
      description: `Are you sure you want to delete "${material.title}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteMaterialMutation.mutateAsync(material.id);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to delete the study material right now.";
      Alert.alert("Delete Failed", message);
    }
  }

  async function onCreateMaterial(payload: {
    title: string;
    description?: string;
    subjectId: string;
    file: {
      uri: string;
      name: string;
      type: string;
    };
  }) {
    return await createMaterialMutation.mutateAsync(payload);
  }

  function handleReadNotes(material: StudyMaterial) {
    console.log('[MaterialsScreen] Read notes clicked for material:', material.id, material.title);
    setSelectedNoteMaterial(material);
  }

  function handleTakeQuiz(_material: StudyMaterial) {
    router.push("/(tabs)/quizzes");
  }

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View className="py-6 items-center justify-center">
          <ActivityIndicator size="small" color="#D95B38" />
          <Text className="text-xs text-stone-500 dark:text-stone-400 mt-2">
            Loading more materials...
          </Text>
        </View>
      );
    }

    if (!hasNextPage && materials.length > 0) {
      return (
        <View className="py-6 items-center justify-center">
          <Text className="text-xs font-medium text-stone-400">
            All materials loaded ({materials.length} total)
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView
      className="bg-[#FAF8F5] dark:bg-stone-950 flex-1"
      edges={["top"]}
    >
      <FlatList
        data={materials}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 12,
          paddingBottom: 32,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            tintColor="#D95B38"
          />
        }
        ListHeaderComponent={
          <MaterialsHeader onUploadPress={handleOpenAddDialog} />
        }
        ListFooterComponent={renderFooter}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.4}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          !isLoading ? (
            <View className="bg-white dark:bg-stone-900 rounded-2xl p-7 items-center justify-center gap-3 border border-stone-200/80 dark:border-stone-800 shadow-xs mt-2">
              <View className="w-14 h-14 rounded-full bg-[#FEEAE3] items-center justify-center">
                <Feather name="file-text" size={24} color="#D95B38" />
              </View>
              <Text className="text-sm font-bold text-stone-900 dark:text-stone-100 text-center">
                No Study Materials Found
              </Text>
              <Text className="text-xs text-stone-500 dark:text-stone-400 text-center leading-5 px-2">
                Upload your first PDF or document to generate AI notes and
                practice quizzes automatically.
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleOpenAddDialog}
                className="mt-2 bg-[#D95B38] rounded-xl px-5 py-3 flex-row items-center gap-2 shadow-2xs"
              >
                <Feather name="plus" size={16} color="#FFFFFF" />
                <Text className="text-xs font-bold text-white">
                  Upload First Material
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <MaterialCard
            material={item}
            onReadNotes={handleReadNotes}
            onTakeQuiz={handleTakeQuiz}
            onDelete={onDeleteMaterial}
            isDeleting={deleteMaterialMutation.isPending}
          />
        )}
      />

      {/* Add Material Dialog Wizard */}
      <AddMaterialDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={onCreateMaterial}
        submitting={createMaterialMutation.isPending}
      />

      {/* Note Reader Bottom Sheet Modal */}
      <AppBottomSheet
        open={Boolean(selectedNoteMaterial)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedNoteMaterial(null);
          }
        }}
        title={fetchedNotes?.title || selectedNoteMaterial?.title || "Study Material Notes"}
        description={
          selectedNoteMaterial
            ? `Subject: ${fetchedNotes?.subjectName ?? selectedNoteMaterial.subject?.name ?? "General"} • ${formatShortDate(fetchedNotes?.createdAt || selectedNoteMaterial.createdAt)}`
            : "AI Generated Notes"
        }
      >
        <AppBottomSheetScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ gap: 14, paddingBottom: 16 }}
        >
          <View className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 gap-2 min-h-[160px]">
            <Text variant="terracotta" className="text-xs font-semibold">
              📄 Processed AI Notes
            </Text>

            {isNotesLoading ? (
              <View className="py-10 items-center justify-center gap-3">
                <ActivityIndicator size="small" color="#D95B38" />
                <Text className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  Fetching notes from server...
                </Text>
              </View>
            ) : isNotesError ? (
              <View className="py-6 items-center justify-center gap-2">
                <Feather name="alert-circle" size={24} color="#EF4444" />
                <Text className="text-xs font-bold text-red-500">
                  Failed to load notes from API.
                </Text>
                <TouchableOpacity
                  onPress={() => refetchNotes()}
                  className="mt-2 bg-stone-100 dark:bg-stone-800 px-4 py-2 rounded-lg"
                >
                  <Text className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Retry API Call
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <HtmlNotesView
                content={fetchedNotes?.content || selectedNoteMaterial?.processedNotes}
              />
            )}
          </View>

          <View className="flex-row items-center gap-2 pt-2">
            <Pressable
              onPress={() => {
                setSelectedNoteMaterial(null);
                router.push("/(tabs)/quizzes");
              }}
              className="flex-1 bg-[#2563EB] active:bg-[#1D4ED8] rounded-full py-3.5 flex-row items-center justify-center gap-2 shadow-sm"
            >
              <Feather name="zap" size={16} color="#FFFFFF" />
              <Text className="text-xs font-bold text-white">
                Take Quiz Now
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedNoteMaterial(null)}
              className="bg-stone-200 dark:bg-stone-800 rounded-full px-5 py-3.5 items-center justify-center"
            >
              <Text className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Close
              </Text>
            </Pressable>
          </View>
        </AppBottomSheetScrollView>
      </AppBottomSheet>
    </SafeAreaView>
  );
}

