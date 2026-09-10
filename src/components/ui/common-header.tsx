import { AppHeaderBrand } from "@/components/ui/app-logo";
import { Icon, IconProps } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { useAuth } from "@/lib/auth";
import * as React from "react";
import { Pressable, View } from "react-native";

export interface CommonHeaderProps {
  /** Callback fired when left back arrow button is pressed */
  onBack?: () => void;
  /** Custom icon name for back button (defaults to "chevron-left") */
  backIcon?: IconProps["name"];
  /** Custom left element to render instead of back button */
  leftElement?: React.ReactNode;
  /** Custom screen title (if omitted and showLogo is true, displays brand logo) */
  title?: string;
  /** Custom subtitle text under title */
  subtitle?: string;
  /** Whether to show the brand logo badge when title is not provided (defaults to true) */
  showLogo?: boolean;
  /** Position of logo/title: "center" (default) or "left" */
  logoPosition?: "center" | "left";
  /** Custom right element */
  rightElement?: React.ReactNode;
  /** Optional right-side subtitle text next to avatar */
  rightSubtitle?: string;
  /** Optional callback when right-side avatar is pressed */
  onAvatarPress?: () => void;
  /** Whether to show user avatar on right if rightElement is not provided */
  showAvatar?: boolean;
  /** Extra container styling */
  className?: string;
}

export const CommonHeader = React.memo(function CommonHeader({
  onBack,
  backIcon = "chevron-left",
  leftElement,
  title,
  subtitle,
  showLogo = true,
  logoPosition = "center",
  rightElement,
  rightSubtitle,
  onAvatarPress,
  showAvatar = false,
  className = "",
}: CommonHeaderProps) {
  const { user } = useAuth();
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "S";

  const renderBackButton = () => {
    if (!onBack) return null;
    return (
      <Pressable
        onPress={onBack}
        hitSlop={8}
        className="w-10 h-10 rounded-full items-center justify-center bg-stone-100 dark:bg-stone-800 active:opacity-70"
      >
        <Icon name={backIcon} size={22} color={APP_COLORS.stone800} />
      </Pressable>
    );
  };

  const renderBrandOrTitle = () => {
    if (title) {
      return (
        <View
          className={
            logoPosition === "center"
              ? "items-center justify-center"
              : "justify-center"
          }
        >
          <Text variant="h3" className="text-base font-bold">
            {title}
          </Text>
          {subtitle ? (
            <Text variant="muted" className="text-xs mt-0.5">
              {subtitle}
            </Text>
          ) : null}
        </View>
      );
    }

    if (showLogo) {
      return <AppHeaderBrand logoSize={42} />;
    }

    return null;
  };

  const renderRight = () => {
    if (rightElement) return rightElement;

    if (showAvatar || rightSubtitle || onAvatarPress) {
      return (
        <Pressable
          onPress={onAvatarPress}
          disabled={!onAvatarPress}
          className="flex-row items-center gap-2 active:opacity-80"
        >
          <View className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800 items-center justify-center border border-stone-300/50 dark:border-stone-700/50">
            <Text className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
              {userInitial}
            </Text>
          </View>
          {rightSubtitle ? (
            <Text variant="muted" className="text-xs font-medium">
              {rightSubtitle}
            </Text>
          ) : null}
        </Pressable>
      );
    }

    // If logo is in center and there is a left back button, render spacer to balance layout
    if (logoPosition === "center" && (onBack || leftElement)) {
      return <View className="w-10" />;
    }

    return null;
  };

  // IF logo is on the left
  if (logoPosition === "left") {
    const rightNode = renderRight();
    return (
      <View
        className={`flex-row items-center justify-between px-5 pt-3 pb-3 ${className}`}
      >
        {/* Left Side: Back button + Logo/Title */}
        <View className="flex-row items-center gap-3">
          {leftElement ? leftElement : renderBackButton()}
          {renderBrandOrTitle()}
        </View>

        {/* Right Side */}
        {rightNode}
      </View>
    );
  }

  // DEFAULT: logo is in center
  const leftNode = leftElement ? leftElement : renderBackButton();
  const rightNode = renderRight();

  return (
    <View
      className={`flex-row items-center justify-between px-5 pt-3 pb-3 bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 ${className}`}
    >
      {/* Left Slot */}
      {leftNode ? leftNode : !rightNode ? null : <View className="w-10" />}

      {/* Center Slot */}
      {renderBrandOrTitle()}

      {/* Right Slot */}
      {rightNode ? rightNode : !leftNode ? null : <View className="w-10" />}
    </View>
  );
});
