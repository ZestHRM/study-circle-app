import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { View } from "react-native";

export const ProfileSecurityCard = React.memo(function ProfileSecurityCard() {
  return (
    <Card className="rounded-3xl p-4 gap-3">
      <CardContent className="p-0 gap-3">
        <View className="flex-row items-center gap-2.5 border-b border-border pb-3 mb-1">
          <View className="w-8 h-8 rounded-xl bg-blue-500/15 items-center justify-center">
            <Icon name="sliders" size="sm" color="quiz" />
          </View>
          <Text variant="h3">Account Options</Text>
        </View>

        <View className="flex-row items-center justify-between py-1">
          <View className="flex-row items-center gap-3">
            <View className="w-8 h-8 rounded-full bg-muted items-center justify-center">
              <Icon name="lock" size="sm" color="muted" />
            </View>
            <View>
              <Text variant="subhead">Account Security</Text>
              <Text variant="caption">Password & Verification</Text>
            </View>
          </View>
          <Icon name="chevron-right" size="sm" color="muted" />
        </View>
      </CardContent>
    </Card>
  );
});
