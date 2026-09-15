import { Input, type InputProps } from "@/components/ui/input";
import * as React from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

export interface FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<InputProps, "name"> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
}

export function FormInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ control, name, label, ...props }: FormInputProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <Input
          label={label}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          {...props}
        />
      )}
    />
  );
}
