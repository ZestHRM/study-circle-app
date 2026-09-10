import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as React from "react";
import { Pressable, View } from "react-native";

export interface SubjectCardMetrics {
  materialsCount?: number;
  pyqCount?: number;
  notesCount?: number;
  lastActiveText?: string;
  lastActiveTime?: string;
  lastActiveDate?: string;
}

export interface SubjectCardProps {
  id: string | number;
  name: string;
  course?: string;
  colorHex?: string;
  bgHex?: string;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  metrics?: SubjectCardMetrics;
  onPress?: () => void;
}

/**
 * Compact SubjectCard component for Subjects tab.
 * Reduced height with crisp typography and balanced padding.
 */
export const SubjectCard = React.memo(function SubjectCard({
  name,
  course,
  colorHex = "#2563EB",
  bgHex = "#DBEAFE",
  iconName = "book-open-variant",
  metrics = {},
  onPress,
}: SubjectCardProps) {
  const materials = metrics.materialsCount ?? 0;
  const pyqs = metrics.pyqCount ?? 0;
  const notes = metrics.notesCount ?? 0;

  // Extract time (top) and date (bottom)
  let timeStr = metrics.lastActiveTime ?? "";
  let dateStr = metrics.lastActiveDate ?? "";

  if (!timeStr && !dateStr) {
    const fullText = metrics.lastActiveText ?? "No activity";
    if (fullText.includes(", ")) {
      const parts = fullText.split(", ");
      dateStr = parts[0];
      timeStr = parts[1];
    } else {
      dateStr = fullText;
    }
  }

  return (
    <Pressable
      onPress={onPress}
      className="bg-white dark:bg-stone-900 rounded-2xl px-4 py-3.5 mb-3 border border-stone-200/90 dark:border-stone-800 shadow-2xs active:opacity-90 transition-all"
    >
      {/* Header Row */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1 pr-2">
          <View
            style={{ backgroundColor: bgHex }}
            className="w-10 h-10 rounded-xl items-center justify-center border border-stone-100 dark:border-stone-800"
          >
            <MaterialCommunityIcons
              name={iconName}
              size={20}
              color={colorHex}
            />
          </View>
          <View className="flex-1 justify-center">
            <Text
              variant="h3"
              className="text-base font-extrabold text-stone-900 dark:text-stone-100 tracking-tight"
              numberOfLines={1}
            >
              {name}
            </Text>
            {course ? (
              <Text
                variant="caption"
                className="text-xs text-stone-500 font-medium mt-0.5"
                numberOfLines={1}
              >
                {course}
              </Text>
            ) : null}
          </View>
        </View>

        <Icon name="chevron-right" size={16} color="muted" />
      </View>

      {/* Metrics Row - Balanced & Clean */}
      <View className="flex-row items-center justify-between pt-2.5 mt-2.5 border-t border-stone-100 dark:border-stone-800/80">
        {/* Materials */}
        <View className="flex-row items-center gap-1.5 flex-1 justify-start">
          <Icon name="file-text" size={13} color={APP_COLORS.stone600} />
          <View>
            <Text className="text-xs font-extrabold text-stone-900 dark:text-stone-100">
              {materials}
            </Text>
            <Text className="text-[10px] text-stone-400 font-medium">Materials</Text>
          </View>
        </View>

        <View className="w-[1px] h-5 bg-stone-200 dark:bg-stone-800 mx-1" />

        {/* PYQs */}
        <View className="flex-row items-center gap-1.5 flex-1 justify-center">
          <Icon name="list" size={13} color={APP_COLORS.stone600} />
          <View>
            <Text className="text-xs font-extrabold text-stone-900 dark:text-stone-100">
              {pyqs}
            </Text>
            <Text className="text-[10px] text-stone-400 font-medium">PYQs</Text>
          </View>
        </View>

        <View className="w-[1px] h-5 bg-stone-200 dark:bg-stone-800 mx-1" />

        {/* Notes */}
        <View className="flex-row items-center gap-1.5 flex-1 justify-center">
          <Icon name="edit-3" size={13} color={APP_COLORS.stone600} />
          <View>
            <Text className="text-xs font-extrabold text-stone-900 dark:text-stone-100">
              {notes}
            </Text>
            <Text className="text-[10px] text-stone-400 font-medium">Notes</Text>
          </View>
        </View>

        <View className="w-[1px] h-5 bg-stone-200 dark:bg-stone-800 mx-1" />

        {/* Last Active Timestamp (Time on top, Date on bottom) */}
        <View className="flex-row items-center gap-1.5 flex-1 justify-end">
          <Icon name="clock" size={13} color={APP_COLORS.stone500} />
          <View className="items-end">
            {timeStr ? (
              <Text
                className="text-xs font-extrabold text-stone-900 dark:text-stone-100"
                numberOfLines={1}
              >
                {timeStr}
              </Text>
            ) : null}
            <Text
              className={`text-[10px] ${
                timeStr
                  ? "text-stone-400 font-medium"
                  : "text-xs font-extrabold text-stone-900 dark:text-stone-100"
              }`}
              numberOfLines={1}
            >
              {dateStr}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
});
