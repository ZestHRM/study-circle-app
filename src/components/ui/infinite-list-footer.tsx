import * as React from "react";
import { View } from "react-native";
import { Spinner } from "./spinner";
import { Text } from "./text";

export interface InfiniteListFooterProps {
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  totalLoaded: number;
  itemLabel?: string;
  className?: string;
}

export const InfiniteListFooter = React.memo(function InfiniteListFooter({
  isFetchingNextPage,
  hasNextPage,
  totalLoaded,
  itemLabel = "items",
  className = "",
}: InfiniteListFooterProps) {
  if (isFetchingNextPage) {
    return (
      <Spinner
        variant="terracotta"
        message={`Loading more ${itemLabel}...`}
        containerStyle={{ paddingVertical: 24 }}
      />
    );
  }

  if (!hasNextPage && totalLoaded > 0) {
    return (
      <View
        className={`py-6 items-center justify-center border-t border-stone-200/80 dark:border-stone-800 mt-2 ${className}`}
      >
        <Text className="text-xs font-medium text-stone-400">
          All {itemLabel} loaded ({totalLoaded} total)
        </Text>
      </View>
    );
  }

  return null;
});
