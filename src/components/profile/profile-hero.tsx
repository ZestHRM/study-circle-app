import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { useFilePicker } from "@/hooks/use-file-picker";
import { useAuth } from "@/lib/auth";
import { getErrorMessage, profileApi, type User } from "@/services";
import { useRouter } from "expo-router";
import * as React from "react";
import { Image, Pressable, View } from "react-native";

export interface ProfileHeroProps {
  user: User | null;
  onBack?: () => void;
  onAvatarChange?: (imageUri: string) => void;
}

export const ProfileHero = React.memo(function ProfileHero({
  user,
  onBack,
  onAvatarChange,
}: ProfileHeroProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [copiedReferral, setCopiedReferral] = React.useState(false);

  const handleBackPress = React.useCallback(() => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  }, [onBack, router]);

  const [uploadSuccessMessage, setUploadSuccessMessage] = React.useState<
    string | null
  >(null);
  const [uploadErrorMessage, setUploadErrorMessage] = React.useState<
    string | null
  >(null);
  const [avatarUri, setAvatarUri] = React.useState<string | null>(
    (user as any)?.avatarUrl || (user as any)?.avatar || null,
  );
  const [isUploading, setIsUploading] = React.useState(false);

  const filePicker = useFilePicker({
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/*"],
  });

  const initials = React.useMemo(() => {
    if (!user?.name) return "SC";
    const parts = user.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [user?.name]);

  const handleCopyReferral = React.useCallback(() => {
    if (!user?.referralCode) return;
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
  }, [user?.referralCode]);

  const handlePickAvatar = React.useCallback(async () => {
    setUploadSuccessMessage(null);
    setUploadErrorMessage(null);

    const picked = await filePicker.pickFile();
    if (!picked?.uri) return;

    // Immediately show preview
    setAvatarUri(picked.uri);

    if (!token) return;

    try {
      setIsUploading(true);
      const response = await profileApi.uploadPicture({
        uri: picked.uri,
        name: picked.name,
        type: picked.mimeType,
      });

      const serverAvatar =
        response?.url || response?.avatarUrl || response?.avatar;
      if (serverAvatar) {
        setAvatarUri(serverAvatar);
        onAvatarChange?.(serverAvatar);
      } else {
        onAvatarChange?.(picked.uri);
      }

      setUploadSuccessMessage(
        response?.message || "Profile picture updated successfully!",
      );
      setTimeout(() => setUploadSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Failed to upload profile picture:", err);
      const msg = getErrorMessage(err, "Failed to upload profile picture. Please try again.");
      setUploadErrorMessage(msg);
      setTimeout(() => setUploadErrorMessage(null), 4000);
    } finally {
      setIsUploading(false);
    }
  }, [filePicker, token, onAvatarChange]);

  return (
    <View className="bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 pt-3 pb-6 px-5 mb-5 rounded-b-[28px] shadow-2xs">
      {/* Top Header Action Bar */}
      <View className="flex-row items-center justify-between mb-4">
        <Button
          variant="ghost"
          icon="arrow-left"
          onPress={handleBackPress}
          className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 items-center justify-center p-0 active:opacity-80"
          iconColor={APP_COLORS.stone800}
        />
        <Text variant="h3" className="text-stone-900 dark:text-stone-100 font-extrabold text-lg text-center">
          My Profile
        </Text>
        <View className="w-10" />
      </View>

      {/* Profile Hero Content */}
      <View className="items-center">
        {/* AVATAR RING WITH PICTURE UPLOADER OVERLAY */}
        <View className="relative mb-3">
          <View className="w-24 h-24 rounded-full border-2 border-purple-500/40 bg-purple-50 dark:bg-purple-950/40 items-center justify-center shadow-xs overflow-hidden">
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                className="w-full h-full rounded-full"
                resizeMode="cover"
              />
            ) : (
              <Text
                variant="h1"
                className="text-purple-600 dark:text-purple-400 text-3xl font-extrabold tracking-wider"
              >
                {initials}
              </Text>
            )}
          </View>

          {/* Online Indicator Badge */}
          <View className="absolute top-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-stone-900 bg-emerald-500" />

          {/* Camera / Edit Profile Picture Button */}
          <Pressable
            onPress={handlePickAvatar}
            disabled={isUploading}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-600 border-2 border-white dark:border-stone-900 items-center justify-center shadow-md active:opacity-80"
            hitSlop={8}
          >
            {isUploading ? (
              <Spinner size="small" variant="white" />
            ) : (
              <Icon name="camera" size="xs" color="white" />
            )}
          </Pressable>
        </View>

        {/* Badges Row */}
        <View className="flex-row items-center gap-2 mt-3 flex-wrap justify-center">
          <Badge
            label={user?.subscriptionTier || "PRO MEMBER"}
            icon="star"
            variant="amber"
          />
          {user?.level ? (
            <Badge label={user.level} icon="book-open" variant="purple" />
          ) : null}
        </View>

        {/* Feedback Alerts */}
        {uploadSuccessMessage ? (
          <Text className="text-xs text-emerald-600 font-semibold mt-2 text-center">
            {uploadSuccessMessage}
          </Text>
        ) : null}

        {uploadErrorMessage ? (
          <Text className="text-xs text-red-600 font-semibold mt-2 text-center">
            {uploadErrorMessage}
          </Text>
        ) : null}

        {/* Referral Code Chip */}
        {user?.referralCode ? (
          <Pressable
            onPress={handleCopyReferral}
            className="mt-3 flex-row items-center gap-2 px-3.5 py-1.5 rounded-full border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800 active:opacity-80"
          >
            <Icon name="gift" size="xs" color="warning" />
            <Text
              variant="caption"
              className="text-stone-700 dark:text-stone-300 text-xs font-medium"
            >
              Ref Code:{" "}
              <Text className="font-bold text-purple-600 dark:text-purple-400">
                {user.referralCode}
              </Text>
            </Text>
            <Icon
              name={copiedReferral ? "check" : "copy"}
              size="xs"
              color={APP_COLORS.stone500}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});
