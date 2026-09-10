import { AppHeaderBar } from "@/components/ui/app-header-bar";
import { HeroBanner } from "@/components/ui/hero-banner";
import { View } from "react-native";

export interface HomeGreetingProps {
  name?: string | null;
}

export function HomeGreeting({ name }: HomeGreetingProps) {
  const firstName = name ? name.split(" ")[0] : "Sam";

  // Dynamic greeting time-of-day string
  const currentHour = new Date().getHours();
  const timeOfDayGreeting =
    currentHour < 12
      ? "Good morning!"
      : currentHour < 17
        ? "Good afternoon!"
        : "Good evening!";

  return (
    <View className="gap-3 pb-2">
      {/* Standardized Top Header Bar using Reusable AppHeaderBar */}
      <AppHeaderBar
        logoPosition="left"
        rightSubtitle={timeOfDayGreeting}
        showAvatar
        className="px-0 pt-1 pb-1 bg-transparent dark:bg-transparent border-0"
      />

      {/* Main Reusable Hero Banner using Design System Presets */}
      <HeroBanner
        title={"Hi there,\n"}
        titleHighlight={`${firstName} 👋`}
        subtitle={"Small steps today.\nA brighter tomorrow."}
      />
    </View>
  );
}
