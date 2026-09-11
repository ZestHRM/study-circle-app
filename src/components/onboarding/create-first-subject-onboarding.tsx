import { AppHeaderBar } from "@/components/ui/app-header-bar";
import { AppScreen } from "@/components/ui/app-screen";
import { Button } from "@/components/ui/button";
import { HeroBanner } from "@/components/ui/hero-banner";
import { MoodSelector } from "@/components/ui/mood-selector";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import * as React from "react";
import { Image, View } from "react-native";
export interface CreateFirstSubjectOnboardingProps {
  onCreateSubject?: () => void;
  onCheckInSentiment?: (feeling: "focused" | "okay" | "stressed") => void;
}

export const CreateFirstSubjectOnboarding = React.memo(
  function CreateFirstSubjectOnboarding({
    onCreateSubject = () => router.push("/create-subject"),
    onCheckInSentiment,
  }: CreateFirstSubjectOnboardingProps) {
    const [selectedMood, setSelectedMood] = React.useState<string>("okay");

    return (
      <AppScreen edges={[]} contentContainerClassName="pb-12">
        <AppHeaderBar logoPosition="left" />

        <View className="gap-5 pt-4 pb-6">
          <HeroBanner
            title={"Hi there,\n"}
            titleHighlight={"let's get started 👋"}
            subtitle="A small step today can make a big difference tomorrow."
            hideIllustration
          />

          {/* Daily Check-in Mood Widget */}
          <View className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100/90 dark:border-blue-900/40 rounded-3xl p-4.5 gap-3 shadow-2xs">
            <View className="flex-row items-center gap-2">
              <Text className="text-lg">☀️</Text>
              <Text variant="caption" className="uppercase tracking-widest">
                DAILY CHECK-IN
              </Text>
            </View>

            <View className="gap-0.5">
              <Text variant="h3">How are you feeling today?</Text>
              <Text variant="muted">
                A quick check-in helps us support you better.
              </Text>
            </View>

            <View className="mt-1">
              <MoodSelector
                variant="button"
                value={selectedMood}
                onChange={(mood) => {
                  setSelectedMood(mood.id);
                  onCheckInSentiment?.(
                    mood.id as "focused" | "okay" | "stressed",
                  );
                }}
              />
            </View>
          </View>

          {/* Create First Subject Callout */}
          <View className="items-center gap-4 pt-2">
            <Image
              source={require("../../../assets/images/subjects-doodle.png")}
              style={{ width: "100%", height: 160 }}
              resizeMode="contain"
            />

            <View className="gap-1.5 w-full">
              <Text variant="h2">Create your first subject</Text>
              <Text variant="muted">
                Materials, notes, quizzes and past year questions live inside
                subjects, so everything stays organised and easy to find.
              </Text>
            </View>

            <Button
              variant="quiz"
              size="lg"
              icon="plus"
              title="Create your first subject"
              onPress={onCreateSubject}
              className="w-full mt-1"
            />
          </View>
        </View>
      </AppScreen>
    );
  },
);
