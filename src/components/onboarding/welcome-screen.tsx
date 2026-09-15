import { AppHeaderBrand, WatermarkBackground } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WELCOME_PLANT_IMAGE = require("@/assets/images/welcome-plant-clean.png");

interface FeatureItemProps {
  title: string;
  subtitle: string;
  iconName: React.ComponentProps<typeof Icon>["name"];
  iconColor: React.ComponentProps<typeof Icon>["color"];
  bgClass: string;
}

const FEATURES: FeatureItemProps[] = [
  {
    title: "Stay organised",
    subtitle: "All your study materials in one place",
    iconName: "book-open",
    iconColor: "primary",
    bgClass: "bg-blue-100 dark:bg-blue-950/60",
  },
  {
    title: "Practice smarter",
    subtitle: "Quizzes, PYQs and instant feedback",
    iconName: "zap",
    iconColor: "success",
    bgClass: "bg-lime-100 dark:bg-lime-950/60",
  },
  {
    title: "Make real progress",
    subtitle: "Turn effort into results",
    iconName: "bar-chart-2",
    iconColor: "error",
    bgClass: "bg-rose-100 dark:bg-rose-950/60",
  },
];

const FeatureRow = React.memo(function FeatureRow({
  title,
  subtitle,
  iconName,
  iconColor,
  bgClass,
}: FeatureItemProps) {
  return (
    <View className="flex-row items-center gap-3.5">
      <View
        className={`w-11 h-11 rounded-full items-center justify-center ${bgClass}`}
      >
        <Icon name={iconName} size="md" color={iconColor} />
      </View>
      <View className="flex-1">
        <Text variant="h4">{title}</Text>
        <Text variant="caption" className="mt-0.5">
          {subtitle}
        </Text>
      </View>
    </View>
  );
});

export function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAF9] dark:bg-stone-950 relative overflow-hidden">
      <WatermarkBackground className="-right-16" />

      <View className="absolute -right-8 top-44 w-72 h-[480px] pointer-events-none z-0">
        <Image
          source={WELCOME_PLANT_IMAGE}
          style={{ width: "100%", height: "100%" }}
          contentFit="contain"
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
        className="z-10"
      >
        <View className="flex-1 justify-between gap-6">
          {/* Header Branding */}
          <View className="gap-2 items-start">
            <AppHeaderBrand logoSize={44} />
            <Text variant="caption" className="tracking-[0.25em] uppercase">
              SUBJECTS TODAY BRIGHTER TOMORROWS
            </Text>
          </View>

          {/* Hero Headline & Subtitle */}
          <View className="gap-3.5">
            <Text variant="h1" className="text-4xl leading-[44px]">
              Turn your{"\n"}
              syllabus into{"\n"}
              <Text variant="primary" className="text-4xl">
                a study plan
              </Text>
            </Text>
            <Text variant="p">
              Organise your subjects, add your materials, get personalised
              practice and past year questions — and study smarter with AI.
            </Text>
          </View>

          {/* Features Container */}
          <View className="relative flex-row items-end justify-between my-2 min-h-[200px]">
            <View className="gap-4.5 flex-1 pr-24">
              {FEATURES.map((item) => (
                <FeatureRow key={item.title} {...item} />
              ))}
            </View>
          </View>

          <View className="gap-3.5 mt-4">
            <Button
              variant="quiz"
              size="lg"
              title="Create account"
              icon="arrow-right"
              iconPosition="right"
              onPress={() => router.push("/(auth)/sign-up")}
              className="w-full "
            />

            <Button
              variant="outline"
              size="lg"
              title="Log in"
              onPress={() => router.push("/(auth)/sign-in")}
              className="w-full"
            />

            <Text
              variant="caption"
              className="text-center tracking-[0.25em] uppercase mt-1"
            >
              SAME CURIOSITY. HIGHER HORIZONS.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
