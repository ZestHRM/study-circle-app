import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { CENTRAL_MOOD_OPTIONS, MoodItem } from "@/constants/moods";
import * as React from "react";
import { Pressable, View } from "react-native";

export interface MoodSelectorProps {
  /** Selected mood ID (e.g. "focused", "okay", "stressed") */
  value?: string;
  /** Callback fired when a mood is selected */
  onChange?: (mood: MoodItem) => void;
  /** List of mood options (defaults to CENTRAL_MOOD_OPTIONS) */
  options?: readonly MoodItem[];
  /** Display style: "card" (large card with icon badge) or "button" (compact button) */
  variant?: "card" | "button";
  /** Additional container styling */
  className?: string;
}
export const MoodSelector = React.memo(function MoodSelector({
  value = "okay",
  onChange,
  options = CENTRAL_MOOD_OPTIONS,
  variant = "card",
  className = "",
}: MoodSelectorProps) {
  return (
    <View className={`flex-row items-center gap-2.5 ${className}`}>
      {options.map((item) => {
        const isSelected = value === item.id;

        if (variant === "button") {
          return (
            <Pressable
              key={item.id}
              onPress={() => onChange?.(item)}
              className={`flex-1 rounded-2xl py-2.5 items-center justify-center gap-1 active:opacity-80 ${
                item.buttonClass ?? ""
              } ${isSelected ? "border-2 border-blue-600" : ""}`}
            >
              <Text className="text-lg">{item.emoji}</Text>
              <Text
                variant="subhead"
                className={`font-bold ${item.textClass ?? ""}`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        }

        // Default variant = "card"
        return (
          <Pressable
            key={item.id}
            onPress={() => onChange?.(item)}
            className={`flex-1 rounded-2xl py-3.5 px-2 items-center justify-center gap-1.5 border active:opacity-80 ${
              isSelected ? item.selectedCardClass : item.unselectedCardClass
            }`}
          >
            <View
              className={`w-10 h-10 rounded-full items-center justify-center ${
                item.badgeClass ?? ""
              }`}
            >
              {item.icon ? (
                <Icon name={item.icon} size={22} color={item.iconColor} />
              ) : (
                <Text className="text-lg">{item.emoji}</Text>
              )}
            </View>
            <Text
              variant="subhead"
              className={isSelected ? item.textClass : ""}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});
