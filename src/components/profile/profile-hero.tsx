import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { useFilePicker } from "@/hooks/use-file-picker";
import { useThemePreference } from "@/lib/theme-preference";
import {
  getFormattedSubscriptionTier,
  getUserAvatarUrl,
  profileApi,
  type User,
} from "@/services";
import { useRouter } from "expo-router";
import * as React from "react";
import { Pressable, View } from "react-native";

export type ProfileHeroProps = {
  user: User | null;
  onBack?: () => void;
  onEditPress?: () => void;
  onAvatarChange?: (imageUri: string) => void;
};

export const ProfileHero = React.memo(function ProfileHero({
  user,
  onBack,
  onEditPress,
  onAvatarChange,
}: ProfileHeroProps) {
  const router = useRouter();
  const { isDark } = useThemePreference();
  const [copiedReferral, setCopiedReferral] = React.useState(false);
  const [localAvatarUri, setLocalAvatarUri] = React.useState<string | null>(
    null,
  );
  const [isUploading, setIsUploading] = React.useState(false);

  const filePicker = useFilePicker({
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/*"],
  });

  const avatarUri = localAvatarUri || getUserAvatarUrl(user);

  const handleBackPress = React.useCallback(() => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  }, [onBack, router]);

  const handleCopyReferral = React.useCallback(() => {
    if (!user?.referralCode) return;
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
  }, [user?.referralCode]);

  const handlePickAvatar = React.useCallback(async () => {
    const picked = await filePicker.pickFile();
    if (!picked?.uri) return;

    setLocalAvatarUri(picked.uri);

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
        setLocalAvatarUri(serverAvatar);
        onAvatarChange?.(serverAvatar);
      } else {
        onAvatarChange?.(picked.uri);
      }
    } catch {
      // Ignore image upload network error silently
    } finally {
      setIsUploading(false);
    }
  }, [filePicker, onAvatarChange]);

  return (
    <View className="bg-card border-b border-border pt-3 pb-6 mb-5 rounded-b-[28px] shadow-2xs">
      <View className="flex-row items-center justify-between mb-4">
        <Button
          variant="ghost"
          icon="arrow-left"
          onPress={handleBackPress}
          className="w-10 h-10 rounded-full bg-muted items-center justify-center active:opacity-80"
          iconColor={isDark ? "#f5f5f4" : APP_COLORS.stone800}
        />
        <Text
          variant="h3"
          className="text-foreground font-extrabold text-lg text-center"
        >
          My Profile
        </Text>
        {onEditPress ? (
          <Button
            variant="ghost"
            icon="edit"
            onPress={onEditPress}
            className="w-10 h-10 rounded-full bg-muted items-center justify-center p-0 active:opacity-80"
            iconColor={isDark ? "#f5f5f4" : APP_COLORS.stone800}
          />
        ) : (
          <View className="w-10" />
        )}
      </View>

      <View className="items-center">
        <View className="relative mb-3">
          <Avatar
            uri={avatarUri}
            name={user?.name}
            className="w-24 h-24 border-2 border-primary/30 shadow-xs"
            fallbackClassName="bg-primary/10"
            textClassName="text-primary text-3xl font-extrabold tracking-wider"
          />
          <Pressable
            onPress={handlePickAvatar}
            disabled={isUploading}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary border-2 border-background items-center justify-center shadow-md active:opacity-80"
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
            label={getFormattedSubscriptionTier(user).toUpperCase()}
            icon="star"
            variant="amber"
          />
          {user?.level ? (
            <Badge label={user.level} icon="book-open" variant="blue" />
          ) : null}
        </View>

        {/* {user?.referralCode ? (
          <Pressable
            onPress={handleCopyReferral}
            className="mt-3 flex-row items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-muted active:opacity-80"
          >
            <Icon name="gift" size="xs" color="warning" />
            <Text
              variant="caption"
              className="text-muted-foreground text-xs font-medium"
            >
              Ref Code:{" "}
              <Text className="font-bold text-primary">
                {user.referralCode}
              </Text>
            </Text>
            <Icon
              name={copiedReferral ? "check" : "copy"}
              size="xs"
              color={APP_COLORS.stone500}
            />
          </Pressable>
        ) : null} */}
      </View>
    </View>
  );
});
