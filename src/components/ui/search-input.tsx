import { Icon } from "@/components/ui/icon";
import { APP_COLORS } from "@/constants/colors";
import { cn } from "@/lib/utils";
import * as React from "react";
import { Pressable, TextInput, View } from "react-native";

export type SearchInputProps = Omit<
  React.ComponentProps<typeof TextInput>,
  "value" | "onChangeText"
> & {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  onFilterPress?: () => void;
  isFilterActive?: boolean;
  containerClassName?: string;
  iconName?: React.ComponentProps<typeof Icon>["name"];
};

export const SearchInput = React.forwardRef<TextInput, SearchInputProps>(
  function SearchInput(
    {
      value,
      onChangeText,
      onClear,
      onFilterPress,
      isFilterActive,
      placeholder = "Search...",
      containerClassName,
      className,
      iconName = "search",
      ...props
    },
    ref,
  ) {
    const handleClear = React.useCallback(() => {
      onChangeText("");
      if (onClear) {
        onClear();
      }
    }, [onChangeText, onClear]);

    return (
      <View
        className={cn(
          "relative flex-row items-center w-full gap-2",
          containerClassName,
        )}
      >
        <View className="relative flex-1 flex-row items-center">
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={APP_COLORS.stone400}
            className={cn(
              "bg-card border border-border text-foreground flex h-11 w-full min-w-0 flex-row items-center rounded-xl pl-9 pr-9 text-sm font-medium",
              className,
            )}
            {...props}
          />

          {/* Left Search Icon */}
          <View className="absolute left-3 justify-center pointer-events-none">
            <Icon name={iconName} size={16} color="muted" />
          </View>

          {/* Right Clear Icon */}
          {value ? (
            <Pressable
              onPress={handleClear}
              hitSlop={8}
              className="absolute right-3 p-1 items-center justify-center active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Icon name="x" size={16} color="muted" />
            </Pressable>
          ) : null}
        </View>

        {onFilterPress ? (
          <Pressable
            onPress={onFilterPress}
            className={cn(
              "w-11 h-11 rounded-xl border items-center justify-center active:opacity-80",
              isFilterActive
                ? "bg-primary/10 border-primary/40"
                : "bg-card border-border",
            )}
            accessibilityRole="button"
            accessibilityLabel="Toggle filters"
          >
            <Icon
              name="sliders"
              size={18}
              color={isFilterActive ? "primary" : "muted"}
            />
          </Pressable>
        ) : null}
      </View>
    );
  },
);

SearchInput.displayName = "SearchInput";
