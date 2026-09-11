import { AppScreen } from "@/components/ui/app-screen";
import { Button } from "@/components/ui/button";
import { CommonHeader } from "@/components/ui/common-header";
import { Input } from "@/components/ui/input";
import { MoodSelector } from "@/components/ui/mood-selector";
import { Text } from "@/components/ui/text";
import { CENTRAL_MOOD_OPTIONS, MoodItem } from "@/constants/moods";
import { useCreateDashboardCheckIn } from "@/hooks/queries/use-dashboard";
import { router } from "expo-router";
import * as React from "react";
import { Alert, Image, View } from "react-native";

export function DailyCheckinScreen() {
  const createCheckInMutation = useCreateDashboardCheckIn();

  const [selectedMood, setSelectedMood] = React.useState<MoodItem>(
    CENTRAL_MOOD_OPTIONS[1], // Default "okay"
  );
  const [note, setNote] = React.useState("");
  const [studyHours, setStudyHours] = React.useState("1");
  const [completedTasks, setCompletedTasks] = React.useState("1");

  const handleSubmit = async () => {
    const parsedHours = parseFloat(studyHours) || 0;
    const parsedTasks = parseInt(completedTasks, 10) || 0;

    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);

    createCheckInMutation.mutate(
      {
        date: localDate,
        studyHours: parsedHours,
        completedTasks: parsedTasks,
        mood: selectedMood.apiMood,
        todayGoals: note.trim() ? note.trim() : undefined,
      },
      {
        onSuccess: () => {
          Alert.alert("Success 🎉", "Daily check-in submitted successfully!", [
            {
              text: "OK",
              onPress: () => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/(tabs)");
                }
              },
            },
          ]);
        },
      },
    );
  };

  return (
    <AppScreen
      edges={["top"]}
      header={<CommonHeader logoPosition="center" fallbackRoute="/(tabs)" />}
      contentContainerClassName="px-5 pt-4 pb-12"
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-6">
        <Text variant="h1" className="leading-tight">
          How ready{"\n"}do you feel today?
        </Text>
        <Text variant="muted" className="mt-1.5">
          Be honest — this helps us give you better support.
        </Text>
      </View>

      {/* Reusable Central Mood Selector */}
      <MoodSelector
        value={selectedMood.id}
        onChange={(m) => setSelectedMood(m)}
        variant="card"
        className="mb-6"
      />

      <View className="mb-5">
        <View className="flex-row items-center gap-1 mb-1.5">
          <Text variant="subhead">Want to add a note?</Text>
          <Text variant="muted">(optional)</Text>
        </View>

        <View className="bg-card border border-border rounded-2xl p-3 shadow-2xs">
          <Input
            value={note}
            onChangeText={(text) => {
              if (text.length <= 200) {
                setNote(text);
              }
            }}
            placeholder="e.g. I feel a bit tired but motivated to revise algebra today."
            multiline
            numberOfLines={3}
            style={{ minHeight: 70, textAlignVertical: "top" }}
            className="bg-transparent dark:bg-transparent border-0 p-0 shadow-none text-sm text-stone-900 dark:text-stone-100 h-auto"
          />
          <View className="items-end mt-1">
            <Text variant="caption">{note.length}/200</Text>
          </View>
        </View>
      </View>

      <View className="flex-row gap-3 mb-6">
        <View className="flex-1">
          <Input
            label="Study Hours"
            value={studyHours}
            onChangeText={setStudyHours}
            placeholder="e.g. 2"
            keyboardType="decimal-pad"
          />
        </View>

        <View className="flex-1">
          <Input
            label="Tasks Completed"
            value={completedTasks}
            onChangeText={setCompletedTasks}
            placeholder="e.g. 3"
            keyboardType="number-pad"
          />
        </View>
      </View>

      <Button
        title={
          createCheckInMutation.isPending
            ? "Submitting..."
            : "Submit Check-in"
        }
        disabled={createCheckInMutation.isPending}
        isLoading={createCheckInMutation.isPending}
        variant="quiz"
        size="lg"
        className="w-full mb-6"
        onPress={handleSubmit}
      />

      <View className="items-center justify-center pt-2 pb-4">
        <Image
          source={require("../../../assets/images/create-subject-doodle.png")}
          style={{ width: 220, height: 110 }}
          resizeMode="contain"
        />
      </View>
    </AppScreen>
  );
}
