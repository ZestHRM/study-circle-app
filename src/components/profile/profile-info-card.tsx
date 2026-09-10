import { Card, CardContent } from "@/components/ui/card";
import { Icon, type IconColorPreset } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Feather } from "@expo/vector-icons";
import * as React from "react";
import { View } from "react-native";

export interface ProfileInfoRow {
  label: string;
  value: string;
  iconName: keyof typeof Feather.glyphMap;
  verified?: boolean;
}

export interface ProfileInfoCardProps {
  title: string;
  headerIcon: keyof typeof Feather.glyphMap;
  headerIconColor?: IconColorPreset;
  headerIconBgClass?: string;
  rows: ProfileInfoRow[];
}

export const ProfileInfoCard = React.memo(function ProfileInfoCard({
  title,
  headerIcon,
  headerIconColor = "primary",
  headerIconBgClass = "bg-purple-500/15",
  rows,
}: ProfileInfoCardProps) {
  return (
    <Card className="rounded-3xl p-4 gap-4">
      <CardContent className="p-0 gap-4">
        {/* Header Title Row */}
        <View className="flex-row items-center gap-2.5 border-b border-border pb-3">
          <View className={`w-8 h-8 rounded-xl items-center justify-center ${headerIconBgClass}`}>
            <Icon name={headerIcon} size="sm" color={headerIconColor} />
          </View>
          <Text variant="h3">{title}</Text>
        </View>

        {/* Data Rows */}
        <View className="gap-3">
          {rows.map((row, index) => (
            <View key={index} className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <Icon name={row.iconName} size="sm" color="muted" />
                <Text variant="muted">{row.label}</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Text variant="subhead">{row.value}</Text>
                {row.verified ? (
                  <Icon name="check-circle" size="xs" color="success" />
                ) : null}
              </View>
            </View>
          ))}
        </View>
      </CardContent>
    </Card>
  );
});
