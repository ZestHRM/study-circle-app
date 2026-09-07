import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { APP_COLORS } from '@/constants/colors';
import { Feather } from '@expo/vector-icons';
import * as React from 'react';
import { Alert, View } from 'react-native';

interface MaterialsHeaderProps {
  onUploadPress: () => void;
}

export function MaterialsHeader({ onUploadPress }: MaterialsHeaderProps) {
  return (
    <View className="gap-4 pb-3">
      {/* Subtitle & Title */}
      <View className="gap-0.5">
        <Text variant="muted">
          Welcome back
        </Text>
        <Text variant="h1">
          Study materials
        </Text>
      </View>

      {/* Action Buttons Row: Upload Material & Library */}
      <View className="flex-row items-center gap-3">
        <Button
          onPress={() => {
            console.log('[MaterialsHeader] Upload material button pressed');
            onUploadPress();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ backgroundColor: APP_COLORS.terracotta }}
          className="flex-1 rounded-xl h-12 flex-row items-center justify-center gap-2 shadow-2xs border-0"
        >
          <Feather name="upload" size={16} color="#FFFFFF" />
          <Text className="text-sm font-bold text-white">Upload material</Text>
        </Button>

        <Button
          variant="outline"
          onPress={() => Alert.alert('Coming Soon', 'Library will be available soon.')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="flex-1 rounded-xl h-12 flex-row items-center justify-center gap-2 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
        >
          <Feather name="book-open" size={16} color={APP_COLORS.textMuted} />
          <Text variant="subhead">
            Library
          </Text>
        </Button>
      </View>

      {/* Section Header */}
      <Text variant="muted" className="font-semibold mt-2">
        Recent uploads
      </Text>
    </View>
  );
}
