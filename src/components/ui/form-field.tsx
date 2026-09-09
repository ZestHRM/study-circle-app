import * as React from "react";
import { View } from "react-native";
import { Label } from "./label";
import { Text } from "./text";

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField = React.memo(function FormField({
  label,
  required,
  error,
  hint,
  children,
  className = "gap-1.5",
}: FormFieldProps) {
  return (
    <View className={className}>
      {label ? (
        <Label>
          {label}
          {required ? <Text className="text-red-500"> *</Text> : null}
        </Label>
      ) : null}
      {children}
      {error ? (
        <Text className="text-xs text-red-500 font-medium">{error}</Text>
      ) : hint ? (
        <Text className="text-xs text-stone-500 dark:text-stone-400">
          {hint}
        </Text>
      ) : null}
    </View>
  );
});
