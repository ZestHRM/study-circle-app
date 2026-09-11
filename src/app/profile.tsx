import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import {
  ProfileHero,
  ProfileInfoCard,
  type ProfileInfoRow,
  ProfileSecurityCard,
  ProfileStats,
} from "@/components/profile";
import { AppLogo } from "@/components/ui/app-logo";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/auth";
import { useFocusEffect, useRouter } from "expo-router";
import * as React from "react";
import { Alert, BackHandler, ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user, token, signOut } = useAuth();
  const router = useRouter();
  const confirm = useConfirmDialog();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  React.useEffect(() => {
    if (!token) {
      router.replace("/sign-in");
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
    } catch (error) {
      console.warn("SignOut error:", error);
    } finally {
      setIsSigningOut(false);
      router.replace("/sign-in");
    }
  }, [signOut, router]);

  const onRequestSignOut = React.useCallback(() => {
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
        label: "Phone Number",
        value: user?.phone || "Not linked",
        iconName: "phone",
      },
    ],
    [user?.name, user?.email, user?.phone],
  );

  const academicRows = React.useMemo<ProfileInfoRow[]>(
    () => [
      { label: "Institute", value: user?.institute || "N/A", iconName: "home" },
      {
        label: "Education Level",
        value: user?.level || "N/A",
        iconName: "layers",
      },
      {
        label: "Class / Standard",
        value: user?.classOrStandard || "N/A",
        iconName: "bookmark",
      },
    ],
    [user?.institute, user?.level, user?.classOrStandard],
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
    <SafeAreaView className="flex-1 bg-background relative" edges={["top"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
        translucent={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* Hero Header */}
        <ProfileHero user={user} />

        <View className="px-4 gap-5">
          {/* Quick Stats Summary Grid */}
          <ProfileStats user={user} />

          {/* Personal Information */}
          <ProfileInfoCard
            title="Personal Information"
            headerIcon="user"
            headerIconColor="primary"
            headerIconBgClass="bg-purple-500/15"
            rows={personalRows}
          />

          {/* Academic Profile */}
          <ProfileInfoCard
            title="Academic Profile"
            headerIcon="book-open"
            headerIconColor="warning"
            headerIconBgClass="bg-amber-500/15"
            rows={academicRows}
          />

          {/* Location & Address */}
          <ProfileInfoCard
            title="Location & Address"
            headerIcon="map"
            headerIconColor="success"
            headerIconBgClass="bg-emerald-500/15"
            rows={locationRows}
          />

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
      </ScrollView>
    </SafeAreaView>
  );
}
