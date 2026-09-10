import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import * as React from "react";
import { Platform, Pressable, TextInput, View } from "react-native";

export interface InputProps extends React.ComponentProps<typeof TextInput> {
  label?: string;
  error?: string | null;
  containerClassName?: string;
  showEyeIcon?: boolean;
}

const Input = React.forwardRef<TextInput, InputProps>(function Input(
  { className, containerClassName, label, error, secureTextEntry, showEyeIcon, ...props },
  ref
) {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const isPasswordInput = Boolean(secureTextEntry || showEyeIcon);

  const togglePasswordVisibility = React.useCallback(() => {
    setIsPasswordVisible((prev) => !prev);
  }, []);

  const inputElement = (
    <View className="relative w-full flex-row items-center">
      <TextInput
        ref={ref}
        placeholderTextColor="#A8A29E"
        secureTextEntry={secureTextEntry ? !isPasswordVisible : false}
        className={cn(
          "bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 flex h-12 w-full min-w-0 flex-row items-center rounded-2xl px-4 text-sm font-medium shadow-2xs",
          isPasswordInput && "pr-12",
          error && "border-red-500 dark:border-red-500",
          props.editable === false &&
            cn(
              "opacity-50",
              Platform.select({ web: "disabled:pointer-events-none disabled:cursor-not-allowed" })
            ),
          Platform.select({
            web: cn(
              "placeholder:text-stone-400 selection:bg-purple-500 selection:text-white outline-none transition-[color,box-shadow]",
              "focus-visible:border-purple-500 focus-visible:ring-purple-500/20 focus-visible:ring-[3px]",
              "aria-invalid:border-red-500"
            ),
            native: "placeholder:text-stone-400",
          }),
          className
        )}
        {...props}
      />
      {isPasswordInput ? (
        <Pressable
          onPress={togglePasswordVisibility}
          hitSlop={12}
          className="absolute right-3.5 items-center justify-center p-1 z-10 rounded-full"
          accessibilityRole="button"
          accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
        >
          <Icon
            name={isPasswordVisible ? "eye-off" : "eye"}
            size={18}
            color="muted"
          />
        </Pressable>
      ) : null}
    </View>
  );

  if (!label && !error) {
    return inputElement;
  }

  return (
    <View className={cn("gap-1.5 w-full", containerClassName)}>
      {label ? <Text variant="subhead">{label}</Text> : null}
      {inputElement}
      {error ? <Text variant="error">{error}</Text> : null}
    </View>
  );
});

Input.displayName = "Input";

export { Input };
