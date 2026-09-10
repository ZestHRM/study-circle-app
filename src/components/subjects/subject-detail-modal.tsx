import { CommonHeader } from "@/components/ui/common-header";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { useNotesInfiniteQuery } from "@/hooks/queries/use-notes";
import { useQuizzesInfiniteQuery } from "@/hooks/queries/use-quizzes";
import { useStudyMaterialsInfinite } from "@/hooks/queries/use-study-materials";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, View } from "react-native";
import { IdeasDoodle } from "./subject-doodles";

export interface SubjectDetailModalProps {
  visible: boolean;
  onClose: () => void;
  subject?: {
    id: string | number;
    name: string;
    description?: string;
    colorHex?: string;
    bgHex?: string;
    iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  } | null;
}

export function SubjectDetailModal({
  visible,
  onClose,
  subject,
}: SubjectDetailModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"overview" | "materials" | "pyqs">("overview");

  // Fetch real API data
  const { materials, isLoading: isLoadingMaterials } = useStudyMaterialsInfinite({ limit: 50 });
  const { notes } = useNotesInfiniteQuery({ limit: 50 });
  const { quizzes } = useQuizzesInfiniteQuery({ limit: 50 });

  if (!subject) return null;

  const sId = String(subject.id);
  const colorHex = subject.colorHex ?? "#10B981";
  const bgHex = subject.bgHex ?? "#D1FAE5";
  const iconName = subject.iconName ?? "flask-outline";
  const course = subject.description || "General";

  // Filter API data specifically for this subject
  const subjectMaterials = materials.filter(
    (m) => String(m.subjectId) === sId || String(m.subject?.id) === sId
  );
  const subjectNotes = notes.filter(
    (n) => String(n.subjectId) === sId || String(n.subject?.id) === sId
  );
  const subjectQuizzes = quizzes.filter(
    (q) => String(q.subjectId) === sId || String(q.subject?.id) === sId
  );

  // Compute real progress
  const processedCount = subjectMaterials.filter(
    (m) => m.status === "PROCESSED" || m.status === "NOTES_GENERATED"
  ).length;
  const totalCount = subjectMaterials.length;
  const progressPercent = totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0;

  const handleUploadClick = () => {
    onClose();
    router.push("/materials/upload");
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Recently";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-stone-50 dark:bg-stone-950">
        {/* Common Navigation Header */}
        <CommonHeader onBack={onClose} />

        <ScrollView
          className="flex-1 px-5 pt-5"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Top Title Row with Icon & Doodle */}
          <View className="flex-row items-start justify-between mb-5">
            <View className="flex-row items-center gap-3.5 flex-1">
              <View
                style={{ backgroundColor: bgHex }}
                className="w-14 h-14 rounded-2xl items-center justify-center border border-stone-200 dark:border-stone-800 shadow-sm"
              >
                <MaterialCommunityIcons name={iconName} size={28} color={colorHex} />
              </View>

              <View className="flex-1">
                <Text variant="h1" className="tracking-tight">
                  {subject.name}
                </Text>
                <View className="bg-stone-200 dark:bg-stone-800 px-2.5 py-0.5 rounded-full self-start mt-1">
                  <Text variant="subhead">
                    {course}
                  </Text>
                </View>
              </View>
            </View>

            <IdeasDoodle />
          </View>

          {/* Overall Progress Card */}
          <View className="bg-white dark:bg-stone-900 rounded-3xl p-5 mb-5 border border-stone-200 dark:border-stone-800 shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
              <Text variant="h4">
                Overall progress
              </Text>
              <Text variant="large" className="text-emerald-600 dark:text-emerald-400 font-black">
                {progressPercent}%
              </Text>
            </View>

            {/* Progress Bar */}
            <View className="w-full h-3 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden mb-2">
              <View
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </View>

            <Text variant="muted">
              {totalCount > 0
                ? `${processedCount} of ${totalCount} materials processed successfully.`
                : "Consistent practice builds real understanding."}
            </Text>
          </View>

          {/* Sub-Tabs Pills */}
          <View className="flex-row items-center gap-2 mb-6">
            <Pressable
              onPress={() => setActiveTab("overview")}
              className={`px-5 py-2.5 rounded-xl ${
                activeTab === "overview"
                  ? "bg-blue-600 shadow-sm"
                  : "bg-stone-200 dark:bg-stone-800"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  activeTab === "overview" ? "text-white" : "text-stone-600 dark:text-stone-400"
                }`}
              >
                Overview
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab("materials")}
              className={`px-5 py-2.5 rounded-xl ${
                activeTab === "materials"
                  ? "bg-blue-600 shadow-sm"
                  : "bg-stone-200 dark:bg-stone-800"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  activeTab === "materials" ? "text-white" : "text-stone-600 dark:text-stone-400"
                }`}
              >
                Materials ({subjectMaterials.length})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab("pyqs")}
              className={`px-5 py-2.5 rounded-xl ${
                activeTab === "pyqs"
                  ? "bg-blue-600 shadow-sm"
                  : "bg-stone-200 dark:bg-stone-800"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  activeTab === "pyqs" ? "text-white" : "text-stone-600 dark:text-stone-400"
                }`}
              >
                PYQs ({subjectQuizzes.length})
              </Text>
            </Pressable>
          </View>

          {/* Materials Content */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text variant="h3">
                {activeTab === "pyqs" ? "Quizzes & PYQs" : "Recent materials"}
              </Text>
              <Pressable onPress={() => router.push(activeTab === "pyqs" ? "/quizzes" : "/materials")}>
                <Text variant="small" className="text-blue-600 font-bold">See all</Text>
              </Pressable>
            </View>

            {isLoadingMaterials ? (
              <ActivityIndicator size="small" color={APP_COLORS.quizBlue} className="my-4" />
            ) : activeTab === "pyqs" ? (
              /* Quizzes / PYQs List */
              subjectQuizzes.length === 0 ? (
                <View className="bg-white dark:bg-stone-900 rounded-2xl p-6 items-center justify-center border border-dashed border-stone-300 dark:border-stone-800">
                  <Icon name="help-circle" size={24} color={APP_COLORS.stone400} />
                  <Text variant="muted" className="mt-2">
                    No quizzes created for this subject yet.
                  </Text>
                </View>
              ) : (
                <View className="gap-3">
                  {subjectQuizzes.map((quiz) => (
                    <Pressable
                      key={quiz.id}
                      onPress={() => router.push(`/quizzes`)}
                      className="bg-white dark:bg-stone-900 rounded-2xl p-4 flex-row items-center justify-between border border-stone-200 dark:border-stone-800 shadow-sm"
                    >
                      <View className="flex-row items-center gap-3 flex-1">
                        <View className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 items-center justify-center">
                          <Icon name="check-square" size={18} color={APP_COLORS.brandPurple} />
                        </View>
                        <View className="flex-1">
                          <Text variant="h4" numberOfLines={1}>
                            {quiz.title}
                          </Text>
                          <Text variant="muted" className="mt-0.5">
                            {quiz.totalQuestions} Questions • {quiz.difficultyLevel}
                          </Text>
                        </View>
                      </View>
                      <Icon name="chevron-right" size={18} color={APP_COLORS.stone400} />
                    </Pressable>
                  ))}
                </View>
              )
            ) : (
              /* Real Study Materials List */
              subjectMaterials.length === 0 ? (
                <View className="bg-white dark:bg-stone-900 rounded-2xl p-6 items-center justify-center border border-dashed border-stone-300 dark:border-stone-800">
                  <Icon name="file-text" size={24} color={APP_COLORS.stone400} />
                  <Text variant="muted" className="mt-2 text-center">
                    No materials uploaded for this subject yet.
                  </Text>
                  <Button
                    title="Upload First Material"
                    variant="outline"
                    size="sm"
                    className="rounded-full px-4 mt-3"
                    onPress={handleUploadClick}
                  />
                </View>
              ) : (
                <View className="gap-3">
                  {subjectMaterials.map((mat) => (
                    <Pressable
                      key={mat.id}
                      onPress={() => router.push(`/materials`)}
                      className="bg-white dark:bg-stone-900 rounded-2xl p-4 flex-row items-center justify-between border border-stone-200 dark:border-stone-800 shadow-sm"
                    >
                      <View className="flex-row items-center gap-3 flex-1">
                        <View className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 items-center justify-center">
                          <Icon name="file-text" size={18} color={APP_COLORS.quizBlue} />
                        </View>
                        <View className="flex-1">
                          <Text variant="h4" numberOfLines={1}>
                            {mat.title}
                          </Text>
                          <Text variant="muted" className="mt-0.5">
                            {mat.status} • {formatDate(mat.createdAt)}
                          </Text>
                        </View>
                      </View>
                      <Icon name="chevron-right" size={18} color={APP_COLORS.stone400} />
                    </Pressable>
                  ))}
                </View>
              )
            )}
          </View>

          {/* Your AI Study Tools Section */}
          <View className="mb-6">
            <Text variant="h3" className="mb-3">
              Your AI study tools
            </Text>

            <View className="flex-row gap-3">
              {/* Generated Notes Card */}
              <Pressable
                onPress={() => router.push("/notes")}
                className="flex-1 bg-white dark:bg-stone-900 rounded-3xl p-4 border border-stone-200 dark:border-stone-800 shadow-sm justify-between"
              >
                <View className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 items-center justify-center mb-3">
                  <Icon name="file-text" size={18} color={APP_COLORS.quizBlue} />
                </View>
                <View>
                  <Text variant="h4">
                    Generated Notes
                  </Text>
                  <Text variant="small" className="text-blue-600 font-semibold mt-0.5">
                    {subjectNotes.length} created
                  </Text>
                  <Text variant="muted" className="mt-1" numberOfLines={2}>
                    Clear, structured notes from your materials.
                  </Text>
                </View>
                <View className="items-end mt-2">
                  <Icon name="chevron-right" size={16} color={APP_COLORS.stone400} />
                </View>
              </Pressable>

              {/* AI Quiz Generator Card */}
              <Pressable
                onPress={() => router.push("/quizzes")}
                className="flex-1 bg-white dark:bg-stone-900 rounded-3xl p-4 border border-stone-200 dark:border-stone-800 shadow-sm justify-between"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 items-center justify-center">
                    <Icon name="help-circle" size={18} color={APP_COLORS.warning} />
                  </View>
                  <View className="bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full flex-row items-center gap-1">
                    <Icon name="award" size={10} color={APP_COLORS.warningDark} />
                    <Text variant="caption" className="font-black text-amber-800 dark:text-amber-300 uppercase">
                      Active
                    </Text>
                  </View>
                </View>
                <View>
                  <Text variant="h4">
                    AI Quiz Generator
                  </Text>
                  <Text variant="small" className="text-amber-600 font-semibold mt-0.5">
                    {subjectQuizzes.length} available
                  </Text>
                  <Text variant="muted" className="mt-1" numberOfLines={2}>
                    Turn your materials into custom quizzes.
                  </Text>
                </View>
                <View className="items-end mt-2">
                  <Icon name="chevron-right" size={16} color={APP_COLORS.stone400} />
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Button */}
        <View className="absolute bottom-5 left-5 right-5">
          <Button
            title="Upload material →"
            icon="upload-cloud"
            variant="quiz"
            className="rounded-full h-11 shadow-md"
            onPress={handleUploadClick}
          />
        </View>
      </View>
    </Modal>
  );
}
