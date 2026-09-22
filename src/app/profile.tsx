import {
  ProfileHero,
  ProfileInfoCard,
  ProfileSecurityCard,
  ProfileStats,
} from "@/components/profile";
import { AppLogo } from "@/components/ui/app-logo";
import { AppScreen } from "@/components/ui/app-screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { THEME_OPTIONS } from "@/constants/profile";
import { useProfileInfoSections } from "@/hooks";
import { useAuth } from "@/lib/auth";
import {
  type ThemePreference,
  useThemePreference,
} from "@/lib/theme-preference";
import { showSuccessToast } from "@/lib/utils/toast";
import { getFormattedSubscriptionTier } from "@/services";
import * as Application from "expo-application";
import { useFocusEffect, useRouter } from "expo-router";
import * as React from "react";
import { Alert, BackHandler, Platform, Pressable, View } from "react-native";

export default function ProfileScreen() {
  const { user, token, signOut } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const { preference, setPreference } = useThemePreference();
  const infoCardSections = useProfileInfoSections(user);

  React.useEffect(() => {
    if (!token) {
      router.replace("/(auth)/sign-in" as any);
    }
  }, [token, router]);

  // Intercept Android hardware back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(tabs)");
        }
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, [router]),
  );

  const onSignOut = React.useCallback(async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      showSuccessToast("Signed Out", "You have been logged out successfully.");
    } catch (error) {
      console.warn("SignOut error:", error);
    } finally {
      setIsSigningOut(false);
      router.replace("/(auth)/sign-in" as any);
    }
  }, [signOut, router]);

  const onRequestSignOut = React.useCallback(() => {
    if (Platform.OS === "web") {
      const confirmed =
        typeof window !== "undefined"
          ? window.confirm(
              "Are you sure you want to log out of your Study Circle account?",
            )
          : true;
      if (confirmed) {
        void onSignOut();
      }
      return;
    }

    Alert.alert(
      "Sign Out Confirmation",
      "Are you sure you want to log out of your Study Circle account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => {
            void onSignOut();
          },
        },
      ],
      { cancelable: true },
    );
  }, [onSignOut]);

  const handleNavigateSubscriptions = React.useCallback(() => {
    router.push("/subscriptions" as any);
  }, [router]);

  const handleNavigateChangePassword = React.useCallback(() => {
    router.push("/change-password");
  }, [router]);

  const handleNavigateEditProfile = React.useCallback(() => {
    router.push("/edit-profile");
  }, [router]);

  const activeTierLabel = React.useMemo(
    () => getFormattedSubscriptionTier(user),
    [user],
  );
  const buildVersion = Application.nativeBuildVersion;
  const appVersion = Application.nativeApplicationVersion;

  return (
    <AppScreen
      scrollable={true}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 48,
      }}
    >
      <View className="mx-auto w-full max-w-md gap-4">
        {/* Profile Hero Header */}
        <ProfileHero user={user} onEditPress={handleNavigateEditProfile} />

        {/* Real-time Stats Cards */}
        <ProfileStats user={user} />

        {/* Personal / Academic / Location Info Cards */}
        {infoCardSections.map((section) => (
          <ProfileInfoCard
            key={section.key}
            title={section.title}
            headerIcon={section.headerIcon}
            headerIconColor={section.headerIconColor}
            headerIconBgClass={section.headerIconBgClass}
            rows={section.rows}
          />
        ))}

        {/* Subscription Status Card */}
        <SubscriptionCard
          tier={activeTierLabel}
          onPressPlans={handleNavigateSubscriptions}
        />

        {/* Account & Security Options */}
        <ProfileSecurityCard
          onChangePasswordPress={handleNavigateChangePassword}
        />

        {/* Theme Preference Selector */}
        <ThemeSelector preference={preference} onChange={setPreference} />

        {/* Sign Out Action Button */}
        <Button
          variant="destructive"
          icon="log-out"
          title={isSigningOut ? "Signing out..." : "Sign Out of Account"}
          loading={isSigningOut}
          disabled={isSigningOut}
          onPress={onRequestSignOut}
          className="w-full h-12 rounded-2xl justify-center items-center shadow-2xs"
        />

        {/* App Brand Footer */}
        <View className="items-center justify-center gap-2 pt-2 pb-4">
          <AppLogo size={36} />
          <Text variant="caption" className="font-medium">
            Study Circle • {appVersion}. build: {buildVersion}
          </Text>
        </View>
      </View>
    </AppScreen>
  );
}

const SubscriptionCard = React.memo(function SubscriptionCard({
  tier,
  onPressPlans,
}: {
  tier: string;
  onPressPlans: () => void;
}) {
  return (
    <Card className="rounded-3xl p-4 gap-3 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/40">
      <View className="flex-row items-center justify-between">
        <View className="gap-1 flex-1 pr-2">
          <Text variant="subhead" className="font-bold">
            Subscription Plan
          </Text>
          <Text variant="muted">Active Tier: {tier}</Text>
        </View>
        <Button
          size="sm"
          variant="quiz"
          title="View Plans →"
          onPress={onPressPlans}
          className="rounded-xl"
        />
      </View>
    </Card>
  );
});

const ThemeSelector = React.memo(function ThemeSelector({
  preference,
  onChange,
}: {
  preference: ThemePreference;
  onChange: (value: ThemePreference) => Promise<void>;
}) {
  return (
    <Card className="rounded-3xl p-4 gap-3">
      <View className="flex-row items-center gap-2.5 border-b border-border pb-3">
        <View className="w-8 h-8 rounded-xl bg-blue-500/15 items-center justify-center">
          <Icon name="palette" size="sm" color="quiz" />
        </View>
        <View className="flex-1">
          <Text variant="h3">Appearance</Text>
          <Text variant="caption">Choose how StudyCircle looks</Text>
        </View>
      </View>
      <View className="flex-row gap-2">
        {THEME_OPTIONS.map((option) => {
          const selected = preference === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => void onChange(option.value)}
              className={`flex-1 rounded-2xl border py-3 items-center gap-1.5 active:opacity-75 ${
                selected ? "bg-primary border-primary" : "bg-card border-border"
              }`}
            >
              <Icon
                name={option.icon}
                size="sm"
                color={selected ? "white" : "muted"}
              />
              <Text
                className={
                  selected
                    ? "text-white text-xs font-bold"
                    : "text-foreground text-xs font-bold"
                }
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
});
