import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { useFilePicker } from "@/hooks/use-file-picker";
import { useAuth } from "@/lib/auth";
import { getErrorMessage, profileApi, type User } from "@/services";
import * as React from "react";
import { Image, Pressable, View } from "react-native";

export interface ProfileHeroProps {
  user: User | null;
  onBack: () => void;
  onAvatarChange?: (imageUri: string) => void;
}

export const ProfileHero = React.memo(function ProfileHero({
  user,
  onBack,
  onAvatarChange,
}: ProfileHeroProps) {
  const { token } = useAuth();
  const [copiedReferral, setCopiedReferral] = React.useState(false);
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
      console.log("Uploading profile picture to /profile/picture API...");

      const response = await profileApi.uploadPicture({
        uri: picked.uri,
        name: picked.name,
        type: picked.mimeType,
      });

      console.log("[Profile Picture API Response]", response);

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
    <View
      style={{ backgroundColor: APP_COLORS.primaryDark }}
      className="relative overflow-hidden pt-4 pb-10 px-5 rounded-b-[36px] shadow-lg mb-6"
    >
      {/* Decorative Subtle Background Accents */}
      <View className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10" />
      <View className="absolute -bottom-16 -left-12 w-40 h-40 rounded-full bg-black/10" />

      {/* Top Header Action Bar */}
      <View className="flex-row items-center justify-between mb-4 z-20">
        <Button
          variant="ghost"
          icon="arrow-left"
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-black/20 items-center justify-center p-0 border border-white/20 active:opacity-80"
          iconColor={APP_COLORS.white}
        />
        <Text variant="h3" className="text-white text-center">
          Profile
        </Text>
        <View className="w-10" />
      </View>

      {/* Profile Hero Content */}
      <View className="items-center z-10">
        {/* AVATAR RING WITH PICTURE UPLOADER OVERLAY */}
        <View className="relative mb-3">
          <View className="w-24 h-24 rounded-full border-4 border-amber-400 bg-white/20 items-center justify-center shadow-md overflow-hidden">
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                className="w-full h-full rounded-full"
                resizeMode="cover"
              />
            ) : (
              <Text
                variant="h1"
                className="text-white text-3xl font-extrabold tracking-wider"
              >
                {initials}
              </Text>
            )}
          </View>

          {/* Online Indicator Badge */}
          <View className="absolute top-1 right-1 w-4 h-4 rounded-full border-2 border-purple-900 bg-emerald-500" />

          {/* Camera / Edit Profile Picture Button */}
          <Pressable
            onPress={handlePickAvatar}
            disabled={isUploading}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-600 border-2 border-white items-center justify-center shadow-lg active:opacity-80"
            hitSlop={8}
          >
            {isUploading ? (
              <Spinner size="small" variant="white" />
            ) : (
              <Icon name="camera" size="xs" color="white" />
            )}
          </Pressable>
        </View>

        {/* User Name & Email */}
        <Text variant="h2" className="text-white tracking-tight text-center">
          {user?.name || "Student User"}
        </Text>
        <Text
          variant="caption"
          className="text-purple-200 text-sm font-medium mt-0.5 text-center"
        >
          {user?.email || "student@studycircle.ai"}
        </Text>

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

        {/* Referral Code Chip */}
        {user?.referralCode ? (
          <Pressable
            onPress={handleCopyReferral}
            className="mt-4 flex-row items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-black/30 active:opacity-80"
          >
            <Icon name="gift" size="xs" color="warning" />
            <Text
              variant="caption"
              className="text-purple-100 text-xs font-medium"
            >
              Ref Code:{" "}
              <Text className="font-bold text-amber-400">
                {user.referralCode}
              </Text>
            </Text>
            <Icon
              name={copiedReferral ? "check" : "copy"}
              size="xs"
              color="white"
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});
