import { cn } from "@/lib/utils";
import * as React from "react";
import {
  RefreshControlProps,
  ScrollView,
  ScrollViewProps,
  View,
} from "react-native";
import {
  SafeAreaView,
  SafeAreaViewProps,
} from "react-native-safe-area-context";

export interface AppScreenProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  scrollable?: boolean;
  edges?: SafeAreaViewProps["edges"];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  className?: string;
  contentContainerClassName?: string;
  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];
  showsVerticalScrollIndicator?: boolean;
  keyboardShouldPersistTaps?: ScrollViewProps["keyboardShouldPersistTaps"];
}

export function AppScreen({
  children,
  header,
  scrollable = true,
  edges = ["top"],
  refreshControl,
  className,
  contentContainerClassName,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  keyboardShouldPersistTaps = "handled",
}: AppScreenProps) {
  const hasEdges = Boolean(
    edges && (Array.isArray(edges) ? edges.length > 0 : Object.keys(edges).length > 0)
  );

  const innerContent = (
    <View style={{ flex: 1 }} className="flex-1">
      {header}
      {scrollable ? (
        <ScrollView
          style={{ flex: 1 }}
          className="flex-1"
          contentContainerStyle={[
            { flexGrow: 1, paddingBottom: 32 },
            contentContainerStyle,
          ]}
          contentContainerClassName={cn(contentContainerClassName)}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }} className={cn("flex-1", contentContainerClassName)}>
          {children}
        </View>
      )}
    </View>
  );

  if (hasEdges) {
    return (
      <SafeAreaView
        edges={edges}
        style={{ flex: 1 }}
        className={cn("flex-1 bg-background", className)}
      >
        {innerContent}
      </SafeAreaView>
    );
  }

  return (
    <View
      style={{ flex: 1 }}
      className={cn("flex-1 bg-background", className)}
    >
      {innerContent}
    </View>
  );
}
