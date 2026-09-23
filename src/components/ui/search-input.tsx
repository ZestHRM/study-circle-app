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
  containerClassName?: string;
  iconName?: React.ComponentProps<typeof Icon>["name"];
};

export const SearchInput = React.forwardRef<TextInput, SearchInputProps>(
  function SearchInput(
    {
      value,
      onChangeText,
      onClear,
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
          "relative flex-row items-center w-full",
          containerClassName,
        )}
      >
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
    );
  },
);

SearchInput.displayName = "SearchInput";
