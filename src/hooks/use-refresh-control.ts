import * as React from "react";

export function useRefreshControl(
  onRefreshCallback: () => Promise<unknown> | void
) {
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefreshCallback();
    } finally {
      setRefreshing(false);
    }
  }, [onRefreshCallback]);

  return {
    refreshing,
    onRefresh: handleRefresh,
  };
}
