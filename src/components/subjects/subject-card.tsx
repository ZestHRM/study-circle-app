import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { getSubjectTheme } from "@/constants/subject-themes";
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
  iconName?: string;
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
  colorHex,
  bgHex,
  iconName,
  metrics = {},
  onPress,
}: SubjectCardProps) {
  const theme = React.useMemo(() => getSubjectTheme(name), [name]);
  const finalColorHex = colorHex || theme.colorHex;
  const finalBgHex = bgHex || theme.bgHex;
  const finalIconName = iconName || theme.iconName;
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
      className="bg-card rounded-2xl px-4 py-3.5 mb-3 border border-border shadow-2xs active:opacity-90 transition-all"
    >
      {/* Header Row */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1 pr-2">
          <View
            style={{ backgroundColor: finalBgHex }}
            className="w-10 h-10 rounded-xl items-center justify-center border border-border"
          >
            <Icon
              name={finalIconName}
              size={20}
              color={finalColorHex}
            />
          </View>
          <View className="flex-1 justify-center">
            <Text
              variant="h3"
              className="text-base font-extrabold text-foreground tracking-tight"
              numberOfLines={1}
            >
              {name}
            </Text>
            {course ? (
              <Text
                variant="caption"
                className="text-xs text-muted-foreground font-medium mt-0.5"
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
      <View className="flex-row items-center justify-between pt-2.5 mt-2.5 border-t border-border">
        {/* Materials */}
        <View className="flex-row items-center gap-1.5 flex-1 justify-start">
          <Icon name="file-text" size={13} color={APP_COLORS.stone600} />
          <View>
            <Text className="text-xs font-extrabold text-foreground">
              {materials}
            </Text>
            <Text className="text-[10px] text-muted-foreground font-medium">Materials</Text>
          </View>
        </View>

        <View className="w-[1px] h-5 bg-border mx-1" />

        {/* PYQs */}
        <View className="flex-row items-center gap-1.5 flex-1 justify-center">
          <Icon name="list" size={13} color={APP_COLORS.stone600} />
          <View>
            <Text className="text-xs font-extrabold text-foreground">
              {pyqs}
            </Text>
            <Text className="text-[10px] text-muted-foreground font-medium">PYQs</Text>
          </View>
        </View>

        <View className="w-[1px] h-5 bg-border mx-1" />

        {/* Notes */}
        <View className="flex-row items-center gap-1.5 flex-1 justify-center">
          <Icon name="edit-3" size={13} color={APP_COLORS.stone600} />
          <View>
            <Text className="text-xs font-extrabold text-foreground">
              {notes}
            </Text>
            <Text className="text-[10px] text-muted-foreground font-medium">Notes</Text>
          </View>
        </View>

        <View className="w-[1px] h-5 bg-border mx-1" />

        {/* Last Active Timestamp (Time on top, Date on bottom) */}
        <View className="flex-row items-center gap-1.5 flex-1 justify-end">
          <Icon name="clock" size={13} color={APP_COLORS.stone500} />
          <View className="items-end">
            {timeStr ? (
              <Text
                className="text-xs font-extrabold text-foreground"
                numberOfLines={1}
              >
                {timeStr}
              </Text>
            ) : null}
            <Text
              className={`text-[10px] ${
                timeStr
                  ? "text-muted-foreground font-medium"
                  : "text-xs font-extrabold text-foreground"
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
