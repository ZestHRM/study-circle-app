import { AddMaterialDialog } from "@/components/add-material-dialog";
import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import {
  useCreateStudyMaterial,
  useDeleteStudyMaterial,
  useStudyMaterialsInfinite,
} from "@/hooks/queries";
import {
  type StudyMaterial,
  type StudyMaterialQuizStatus,
  type StudyMaterialStatus,
} from "@/services";
import { Feather } from "@expo/vector-icons";
import * as React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STATUS_LABELS: Record<StudyMaterialStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  PROCESSED: "Processed",
  PROCESSING_FAILED: "Failed",
  GENERATING_NOTES: "Generating Notes",
  NOTES_GENERATED: "Notes Ready",
  NOTES_GENERATION_FAILED: "Notes Failed",
  ARCHIVED: "Archived",
};

const QUIZ_STATUS_LABELS: Record<StudyMaterialQuizStatus, string> = {
  PENDING: "Pending",
  GENERATING: "Generating",
  GENERATED: "Generated",
  GENERATION_FAILED: "Failed",
};

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

function summarizeStatuses(material: StudyMaterial) {
  const statuses = material.files.map((file) => file.status);
  if (statuses.length === 0) {
    return STATUS_LABELS[material.status];
  }

  const hasFailed = statuses.some(
    (status) =>
      status === "PROCESSING_FAILED" || status === "NOTES_GENERATION_FAILED",
  );
  if (hasFailed) {
    return "Needs Attention";
  }

  const hasProcessing = statuses.some(
    (status) => status === "PROCESSING" || status === "GENERATING_NOTES",
  );
  if (hasProcessing) {
    return "In Progress";
  }

  const hasReady = statuses.some(
    (status) => status === "PROCESSED" || status === "NOTES_GENERATED",
  );
  if (hasReady) {
    return "Ready";
  }

  return STATUS_LABELS[material.status];
}

function summarizeQuiz(material: StudyMaterial) {
  const quizStatuses = material.files.map((file) => file.quizStatus);

  if (quizStatuses.length === 0) {
    return QUIZ_STATUS_LABELS[material.quizStatus];
  }

  const generatedCount = quizStatuses.filter(
    (status) => status === "GENERATED",
  ).length;
  const failedCount = quizStatuses.filter(
    (status) => status === "GENERATION_FAILED",
  ).length;
  const generatingCount = quizStatuses.filter(
    (status) => status === "GENERATING",
  ).length;

  if (generatedCount === quizStatuses.length) {
    return "All Generated";
  }

  if (generatingCount > 0) {
    return "Generating";
  }

  if (failedCount > 0) {
    return "Some Failed";
  }

  return `${generatedCount}/${quizStatuses.length} Generated`;
}

export default function MaterialsScreen() {
  const confirm = useConfirmDialog();
  const [showAddDialog, setShowAddDialog] = React.useState(false);

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
      Alert.alert("Deleted", "Study material deleted successfully.");
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
    await createMaterialMutation.mutateAsync(payload);
  }

  const renderHeader = () => (
    <View className="gap-4 pb-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-2xl font-semibold">Study Materials</Text>
          <Text className="text-muted-foreground text-sm">
            Scroll down to automatically load more materials.
          </Text>
        </View>
        <Button
          size="icon"
          variant="outline"
          onPress={refetch}
          disabled={isLoading || isFetching}
        >
          {isLoading || isFetching ? (
            <ActivityIndicator size="small" />
          ) : (
            <Feather name="refresh-cw" size={16} color="#a3a3a3" />
          )}
        </Button>
      </View>

      <View className="flex-row gap-2">
        <Button
          className="flex-1"
          variant="outline"
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "Buy from Library will be available soon.",
            )
          }
        >
          <Feather name="shopping-bag" size={16} color="#a3a3a3" />
          <Text>Buy from Library</Text>
        </Button>
        <Button className="flex-1" onPress={() => setShowAddDialog(true)}>
          <Feather name="plus" size={16} color="#000000" />
          <Text>Add Material</Text>
        </Button>
      </View>

      {isLoading ? (
        <View className="gap-3">
          {[0, 1, 2, 3].map((item) => (
            <Card key={item} className="gap-3 py-4">
              <CardHeader className="px-4">
                <CardTitle className="text-base">Loading material...</CardTitle>
                <CardDescription>Fetching latest materials</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </View>
      ) : null}

      {!isLoading && materials.length === 0 ? (
        <Card className="gap-3 py-4">
          <CardHeader className="px-4">
            <CardTitle>No Materials Found</CardTitle>
            <CardDescription>
              Upload your first study material to start organizing your learning
              content.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            <Button
              size="sm"
              className="self-start"
              onPress={() => setShowAddDialog(true)}
            >
              <Feather name="plus" size={16} color="#ffffff" />
              <Text>Upload Material</Text>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </View>
  );

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View className="py-4 items-center justify-center">
          <ActivityIndicator size="small" />
          <Text className="text-muted-foreground text-xs mt-2">
            Loading more materials...
          </Text>
        </View>
      );
    }

    if (!hasNextPage && materials.length > 0) {
      return (
        <View className="py-4 items-center justify-center">
          <Text className="text-muted-foreground text-xs">
            You've reached the end of all materials ({materials.length} total)
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView className="bg-background flex-1" edges={["top"]}>
      <FlatList
        data={materials}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 24,
        }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refetch} />
        }
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.4}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => (
          <Card className="gap-3 py-4">
            <CardHeader className="gap-2 px-4">
              <View className="flex-row items-start justify-between gap-2">
                <CardTitle className="text-base flex-1" numberOfLines={2}>
                  {item.title}
                </CardTitle>
                <Button
                  size="icon"
                  variant="destructive"
                  onPress={() => onDeleteMaterial(item)}
                  disabled={deleteMaterialMutation.isPending}
                >
                  {deleteMaterialMutation.isPending ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Feather name="trash-2" size={16} color="#ffffff" />
                  )}
                </Button>
              </View>
              <CardDescription numberOfLines={3}>
                {item.description?.trim() || "No description provided"}
              </CardDescription>
            </CardHeader>

            <CardContent className="gap-2 px-4">
              <View className="gap-1">
                <Text className="text-muted-foreground text-xs">Subject</Text>
                <Text className="text-sm font-medium" numberOfLines={1}>
                  {item.subject?.name ?? "N/A"}
                </Text>
              </View>

              <View className="gap-1">
                <Text className="text-muted-foreground text-xs">Created</Text>
                <Text className="text-sm">
                  {formatShortDate(item.createdAt)}
                </Text>
              </View>

              <View className="flex-row flex-wrap gap-1">
                <View className="bg-muted rounded-full px-2 py-1">
                  <Text className="text-xs">
                    Files: {item._count?.files ?? item.files.length}
                  </Text>
                </View>
                <View className="rounded-full bg-orange-100 px-2 py-1">
                  <Text className="text-xs text-orange-700">
                    {summarizeStatuses(item)}
                  </Text>
                </View>
                <View className="rounded-full bg-blue-100 px-2 py-1">
                  <Text className="text-xs text-blue-700">
                    Quiz: {summarizeQuiz(item)}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>
        )}
      />

      <AddMaterialDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={onCreateMaterial}
        submitting={createMaterialMutation.isPending}
      />
    </SafeAreaView>
  );
}
