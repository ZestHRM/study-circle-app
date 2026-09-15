import {
  ProfileHero,
  ProfileInfoCard,
  type ProfileInfoRow,
  ProfileSecurityCard,
  ProfileStats,
} from "@/components/profile";
import { AppLogo } from "@/components/ui/app-logo";
import { AppScreen } from "@/components/ui/app-screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/auth";
import { showSuccessToast } from "@/lib/utils/toast";
import { useFocusEffect, useRouter } from "expo-router";
import * as React from "react";
import { Alert, BackHandler, Platform, View } from "react-native";

export default function ProfileScreen() {
  const { user, token, signOut } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

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
          ? window.confirm("Are you sure you want to log out of your Study Circle account?")
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

  // Data rows for info sections
  const personalRows = React.useMemo<ProfileInfoRow[]>(
    () => [
      {
        label: "Full Name",
        value: user?.name || "N/A",
        iconName: "user-check",
      },
      {
        label: "Email Address",
        value: user?.email || "N/A",
        iconName: "mail",
        verified: Boolean(user?.email),
      },
      {
        label: "Phone",
        value: user?.phone || "Not provided",
        iconName: "phone",
      },
    ],
    [user?.name, user?.email, user?.phone],
  );

  const academicRows = React.useMemo<ProfileInfoRow[]>(
    () => [
      {
        label: "Institute / University",
        value: user?.institute || "Study Circle",
        iconName: "book-open",
      },
      {
        label: "Target Exam / Field",
        value: (user as any)?.targetExam || "General Learning",
        iconName: "target",
      },
    ],
    [user?.institute, (user as any)?.targetExam],
  );

  const locationRows = React.useMemo<ProfileInfoRow[]>(() => {
    const locParts = [user?.city, user?.state, user?.country].filter(Boolean);
    const regionText =
      locParts.length > 0 ? locParts.join(", ") : "Not provided";

    const rows: ProfileInfoRow[] = [
      { label: "Region", value: regionText, iconName: "map-pin" },
    ];
    if (user?.zipcode) {
      rows.push({ label: "Zipcode", value: user.zipcode, iconName: "hash" });
    }
    return rows;
  }, [user?.city, user?.state, user?.country, user?.zipcode]);

  return (
    <AppScreen
      scrollable={true}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 48 }}
    >
      <View className="mx-auto w-full max-w-md gap-4">
        {/* Profile Hero Header */}
        <ProfileHero user={user} />

        {/* Real-time Stats Cards */}
        <ProfileStats user={user} />

        {/* Personal Details */}
        <ProfileInfoCard
          title="Personal Information"
          headerIcon="user"
          headerIconColor="primary"
          headerIconBgClass="bg-blue-500/15"
          rows={personalRows}
        />

        {/* Academic Profile */}
        <ProfileInfoCard
          title="Academic Profile"
          headerIcon="book-open"
          headerIconColor="terracotta"
          headerIconBgClass="bg-orange-500/15"
          rows={academicRows}
        />

        {/* Location Info */}
        <ProfileInfoCard
          title="Location Details"
          headerIcon="map-pin"
          headerIconColor="quiz"
          headerIconBgClass="bg-purple-500/15"
          rows={locationRows}
        />

        {/* Subscription Status Card */}
        <Card className="rounded-3xl p-4 gap-3 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/40">
          <View className="flex-row items-center justify-between">
            <View className="gap-1 flex-1 pr-2">
              <Text variant="subhead" className="font-bold">
                Subscription Plan
              </Text>
              <Text variant="muted">
                Active Tier: {user?.subscriptionTier || "Free Plan"}
              </Text>
            </View>
            <Button
              size="sm"
              variant="quiz"
              title="View Plans →"
              onPress={() => router.push("/subscriptions" as any)}
              className="rounded-xl"
            />
          </View>
        </Card>

        {/* Account & App Options */}
        <ProfileSecurityCard />

        {/* Sign Out Card */}
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
            Study Circle • Version 1.0.0
          </Text>
        </View>
      </View>
    </AppScreen>
  );
}
