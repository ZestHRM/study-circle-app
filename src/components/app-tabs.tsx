import { Icon } from "@/components/ui/icon";
import { APP_COLORS } from "@/constants/colors";
import { useSubjectsQuery } from "@/hooks/queries/use-subjects";
import { useThemePreference } from "@/lib/theme-preference";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AppTabs() {
  const { isDark } = useThemePreference();
  const insets = useSafeAreaInsets();
  const { subjects, isLoading } = useSubjectsQuery();

  const activeColor = APP_COLORS.primary;
  const inactiveColor = isDark ? APP_COLORS.stone400 : APP_COLORS.stone500;
  const backgroundColor = isDark ? APP_COLORS.stone900 : APP_COLORS.white;
  const borderTopColor = isDark ? APP_COLORS.stone800 : APP_COLORS.stone200;

  const bottomInset = Math.max(insets.bottom, Platform.OS === "ios" ? 12 : 10);
  const tabBarHeight = 56 + bottomInset;

  const hasNoSubjects = !isLoading && subjects.length === 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor,
          borderTopColor,
          borderTopWidth: 1,
          elevation: 8,
          height: tabBarHeight,
          paddingBottom: Math.max(bottomInset, 6),
          paddingTop: 6,
          display: hasNoSubjects ? "none" : "flex",
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          paddingBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="subjects"
        options={{
          title: "Subjects",
          tabBarIcon: ({ color, size }) => (
            <Icon name="book-open" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="materials"
        options={{
          title: "Study Material",
          tabBarIcon: ({ color, size }) => (
            <Icon name="file-text" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="exam-materials"
        options={{
          title: "Exam Material",
          tabBarIcon: ({ color, size }) => (
            <Icon name="award" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) => (
            <Icon name="trending-up" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="circles"
        options={{
          title: "Circles",
          tabBarIcon: ({ color, size }) => (
            <Icon name="users" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Icon name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
