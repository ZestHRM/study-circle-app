import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { View } from "react-native";

export interface ActionBannerWidgetProps {
  /** Emoji string (e.g. "☀️") or React Node for icon */
  icon?: React.ReactNode;
  /** Uppercase tracking-widest caption text (e.g. "DAILY CHECK-IN", "NEXT EXAM") */
  badgeText?: string;
  /** Main title text */
  title: string;
  /** Subtitle or description text */
  subtitle?: string;
  /** Primary button title (e.g. "Start check-in →") */
  buttonTitle?: string;
  /** Primary button press handler */
  onButtonPress?: () => void;
  /** Optional custom right column content (e.g. countdown stat) */
  rightContent?: React.ReactNode;
  /** Additional container classes */
  className?: string;
  /** Custom children to render inside card */
  children?: React.ReactNode;
}

/**
 * Reusable Action/Info Banner Widget Card component.
 * Standardized across Home, Subjects, and Onboarding screens.
 */
export const ActionBannerWidget = React.memo(function ActionBannerWidget({
  icon,
  badgeText,
  title,
  subtitle,
  buttonTitle,
  onButtonPress,
  rightContent,
  className = "",
  children,
}: ActionBannerWidgetProps) {
  return (
    <View
      className={`bg-blue-50/70  border border-blue-100/90 rounded-3xl p-4.5 gap-3 shadow-2xs ${className}`}
    >
      {rightContent ? (
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3 gap-1">
            {(badgeText || icon) && (
              <View className="flex-row items-center gap-2">
                {typeof icon === "string" ? (
                  <Text className="text-lg">{icon}</Text>
                ) : (
                  icon
                )}
                {badgeText && (
                  <Text
                    variant="caption"
                    className="uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold"
                  >
                    {badgeText}
                  </Text>
                )}
              </View>
            )}
            <Text variant="h3">{title}</Text>
            {subtitle && <Text variant="muted">{subtitle}</Text>}
          </View>

          <View className="border-l border-blue-200/60 dark:border-blue-800/40 pl-4 items-center justify-center">
            {rightContent}
          </View>
        </View>
      ) : (
        <>
          {(badgeText || icon) && (
            <View className="flex-row items-center gap-2">
              {typeof icon === "string" ? (
                <Text className="text-lg">{icon}</Text>
              ) : (
                icon
              )}
              {badgeText && (
                <Text
                  variant="caption"
                  className="uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold"
                >
                  {badgeText}
                </Text>
              )}
            </View>
          )}

          <View className="gap-0.5">
            <Text variant="h3">{title}</Text>
            {subtitle && <Text variant="muted">{subtitle}</Text>}
          </View>

          {children}

          {buttonTitle && (
            <Button
              title={buttonTitle}
              variant="quiz"
              size="lg"
              className="w-full mt-1"
              onPress={onButtonPress}
            />
          )}
        </>
      )}
    </View>
  );
});
