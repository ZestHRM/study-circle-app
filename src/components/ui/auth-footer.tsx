import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Pressable, View } from "react-native";

export interface AuthFooterProps {
  promptText?: string;
  actionText?: string;
  onActionPress?: () => void;
  tagline?: string;
  className?: string;
}

export function AuthFooter({
  promptText,
  actionText,
  onActionPress,
  tagline = "SAME CURIOSITY. HIGHER HORIZONS.",
  className,
}: AuthFooterProps) {
  return (
    <View className={cn("gap-3.5 mt-auto", className)}>
      {promptText && actionText && onActionPress ? (
        <View className="flex-row items-center justify-center gap-1.5 pt-0.5">
          <Text variant="caption">{promptText}</Text>
          <Pressable onPress={onActionPress}>
            <Text
              variant="caption"
              className="font-bold text-blue-600 dark:text-blue-400"
            >
              {actionText}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {tagline ? (
        <Text
          variant="caption"
          className="text-center tracking-[0.25em] uppercase mt-1"
        >
          {tagline}
        </Text>
      ) : null}
    </View>
  );
}
