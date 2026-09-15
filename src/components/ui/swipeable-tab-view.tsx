import * as React from "react";
import {
  ScrollView,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { AppTabBar, type AppTabItem } from "./app-tab-bar";

export interface SwipeableTabViewProps<T extends string = string> {
  tabs: AppTabItem<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
  tabBarClassName?: string;
  dynamicHeight?: boolean;
  children: React.ReactNode[];
}

export function SwipeableTabView<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  tabBarClassName,
  dynamicHeight = true,
  children,
}: SwipeableTabViewProps<T>) {
  const { width } = useWindowDimensions();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = React.useState(width);
  const [tabHeights, setTabHeights] = React.useState<Record<number, number>>(
    {},
  );
  const isProgrammaticScroll = React.useRef(false);

  const activeIndex = React.useMemo(() => {
    const idx = tabs.findIndex((t) => t.id === activeTab);
    return idx >= 0 ? idx : 0;
  }, [tabs, activeTab]);

  // Sync scroll position when activeTab changes (e.g. tab header click)
  React.useEffect(() => {
    if (scrollViewRef.current && containerWidth > 0) {
      isProgrammaticScroll.current = true;
      scrollViewRef.current.scrollTo({
        x: activeIndex * containerWidth,
        animated: true,
      });
    }
  }, [activeIndex, containerWidth]);

  const handleMomentumScrollEnd = React.useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const contentOffset = e.nativeEvent.contentOffset.x;
      const w = containerWidth || width || 1;
      const calculatedIndex = Math.round(contentOffset / w);
      const targetTab = tabs[calculatedIndex];
      if (targetTab && targetTab.id !== activeTab) {
        onTabChange(targetTab.id);
      }
      isProgrammaticScroll.current = false;
    },
    [containerWidth, width, tabs, activeTab, onTabChange],
  );

  const handlePageLayout = React.useCallback((idx: number, height: number) => {
    if (height <= 0) return;
    setTabHeights((prev) => {
      if (prev[idx] === height) return prev;
      return { ...prev, [idx]: height };
    });
  }, []);

  const currentHeight = dynamicHeight ? tabHeights[activeIndex] : undefined;

  return (
    <View
      className={dynamicHeight ? "w-full" : "flex-1"}
      style={dynamicHeight ? undefined : { flex: 1 }}
    >
      <AppTabBar<T>
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        className={tabBarClassName}
      />

      <View
        className={dynamicHeight ? "w-full" : "flex-1"}
        style={{
          flex: dynamicHeight ? undefined : 1,
          height:
            dynamicHeight && currentHeight && currentHeight > 0
              ? currentHeight
              : undefined,
          overflow: "hidden",
        }}
        onLayout={(e) => {
          const newW = e.nativeEvent.layout.width || width;
          if (newW > 0 && newW !== containerWidth) {
            setContainerWidth(newW);
          }
        }}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          style={{
            flex: dynamicHeight ? undefined : 1,
            height:
              dynamicHeight && currentHeight && currentHeight > 0
                ? currentHeight
                : undefined,
          }}
          contentContainerStyle={dynamicHeight ? undefined : { flexGrow: 1 }}
          scrollEventThrottle={16}
        >
          {React.Children.map(children, (child, idx) => (
            <View
              key={tabs[idx]?.id || idx}
              style={{
                width: containerWidth,
                flex: dynamicHeight ? undefined : 1,
                alignSelf: dynamicHeight ? "flex-start" : undefined,
              }}
              onLayout={
                dynamicHeight
                  ? (e) => handlePageLayout(idx, e.nativeEvent.layout.height)
                  : undefined
              }
            >
              {child}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
