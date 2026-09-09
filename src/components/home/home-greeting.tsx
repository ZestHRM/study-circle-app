import { AppLogo } from '@/components/ui/app-logo';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';

export function HomeGreeting({ name }: { name?: string | null }) {
  return (
    <View className="flex-row items-center justify-between pb-1">
      <View className="gap-0.5 flex-1 pr-2">
        <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
          Welcome back
        </Text>
        <Text className="text-2xl font-bold leading-tight text-stone-900 dark:text-stone-100">
          Hi, {name ?? 'there'}.
        </Text>
        <Text className="text-muted-foreground text-xs font-medium">
          Track your progress and keep the streak going.
        </Text>
      </View>

      {/* Brand Official Logo */}
      <AppLogo size={46} />
    </View>
  );
}
